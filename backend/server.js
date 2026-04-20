const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const net = require("net");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const path = require("path");
const connectDB = require("./config/db");
const studentRoutes = require("./routes/studentRoutes");
const chatRoutes = require("./routes/chatRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const requestApiRoutes = require("./routes/requestApiRoutes");
const invitationRoutes = require("./routes/invitationRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const aiChatRoutes = require("./routes/aiChatRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const bcrypt = require("bcryptjs");
const Message = require("./models/Message");
const Student = require("./models/Student");
const Group = require("./models/Group");
const User = require("./models/User");

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

/**
 * Socket.IO Configuration
 * Enable CORS for frontend connection
 */
// CORS Configuration - Accept allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
  "http://localhost:3000", // fallback for other dev setups
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/chat", chatRoutes); // Group Chat exactly uses /api/chat
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/requests", requestApiRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/recommend", recommendationRoutes);
app.use("/api/aichat", aiChatRoutes); // Remapped AI chat to avoid conflict
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/suggestions", suggestionRoutes);
app.use("/api/feedback", feedbackRoutes);

// Default route
app.get("/", (req, res) => {
  res.json({ message: "UniGroup Finder API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: err.message,
  });
});

/**
 * Socket.IO Real-time Communication
 * Handles real-time messaging for group chats
 */
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  const normalizeDisplayName = (student, user, fallbackName) => {
    const studentName =
      `${student?.firstName || ""} ${student?.lastName || ""}`.trim();
    if (studentName) return studentName;
    if (user?.fullName) return user.fullName;
    if (user?.name) return user.name;
    if (user?.email) return user.email;
    if (fallbackName) return fallbackName;
    return "Unknown User";
  };

  const resolveChatSender = async (rawSenderId, fallbackName) => {
    if (!rawSenderId) {
      throw new Error("senderId is required");
    }

    const senderIdString = String(rawSenderId);
    const isObjectId = mongoose.Types.ObjectId.isValid(senderIdString);

    let student = null;
    let user = null;

    if (isObjectId) {
      student = await Student.findById(senderIdString).lean();
      if (!student) {
        user = await User.findById(senderIdString).lean();
      }
    }

    if (!student) {
      student = await Student.findOne({ userId: senderIdString }).lean();
    }

    if (
      !user &&
      student?.userId &&
      mongoose.Types.ObjectId.isValid(student.userId)
    ) {
      user = await User.findById(student.userId).lean();
    }

    if (!student && user) {
      const [firstName = "User", ...lastNameParts] = String(
        user.fullName || user.name || "User",
      )
        .trim()
        .split(/\s+/);

      student = await Student.findOneAndUpdate(
        { userId: String(user._id) },
        {
          $setOnInsert: {
            userId: String(user._id),
            firstName,
            lastName: lastNameParts.join(" ") || "Member",
            email: user.email || `user-${user._id}@placeholder.local`,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ).lean();
    }

    if (!student && !user) {
      throw new Error("Sender not found");
    }

    const membershipIds = [
      senderIdString,
      student?._id ? String(student._id) : null,
      student?.userId ? String(student.userId) : null,
      user?._id ? String(user._id) : null,
    ].filter(Boolean);

    return {
      student,
      senderName: normalizeDisplayName(student, user, fallbackName),
      membershipIds: [...new Set(membershipIds)],
    };
  };

  /**
   * Join a group chat room
   * Client emits: { groupId: "..." }
   */
  socket.on("join_group", (data) => {
    const { groupId } = data;
    socket.join(groupId);
    console.log(`User ${socket.id} joined group: ${groupId}`);
  });

  /**
   * Leave a group chat room
   */
  socket.on("leave_group", (data) => {
    const { groupId } = data;
    if (!groupId) return;
    socket.leave(groupId);
    console.log(`User ${socket.id} left group: ${groupId}`);
  });

  /**
   * Send a message to the group
   * Client emits: { groupId, senderId, senderName, text, clientMessageId }
   * Server broadcasts message to all group members
   */
  socket.on("send_message", async (data) => {
    try {
      const {
        groupId,
        senderId,
        senderName,
        profilePicture,
        text,
        clientMessageId,
        replyTo,
        mentions,
      } = data;

      if (!groupId || !senderId) {
        socket.emit("message_error", {
          message: "groupId and senderId are required",
        });
        return;
      }

      const trimmedText = typeof text === "string" ? text.trim() : "";
      if (!trimmedText) {
        socket.emit("message_error", {
          message: "Message text cannot be empty",
        });
        return;
      }

      const group = await Group.findById(groupId).select("_id members").lean();
      if (!group) {
        socket.emit("message_error", {
          message: "Group not found",
        });
        return;
      }

      const senderContext = await resolveChatSender(senderId, senderName);
      const groupMemberIds = new Set(
        (group.members || []).map((memberId) => String(memberId)),
      );
      const isMember = senderContext.membershipIds.some((id) =>
        groupMemberIds.has(id),
      );

      if (!isMember) {
        socket.emit("message_error", {
          message: "Only group members can send messages",
        });
        return;
      }

      console.log(" Saving message to chat_History collection...");
      console.log(`   Group: ${groupId}, Sender: ${senderContext.senderName}`);

      // Save message to database (automatically goes to chat_History collection)
      const newMessage = await Message.create({
        groupId,
        sender: senderContext.student?._id || senderId,
        senderName: senderContext.senderName,
        profilePicture: profilePicture || null,
        text: trimmedText,
        replyTo: replyTo || null,
        mentions: Array.isArray(mentions) ? mentions : [],
      });

      console.log(`✅ Message saved to chat_History!`);
      console.log(`   Message ID: ${newMessage._id}`);
      console.log(`   Collection: chat_History`);

      // Try to populate sender details, but don't fail if sender doesn't exist
      try {
        await newMessage.populate("sender", "name email");
      } catch (populateError) {
        // If population fails, just continue with the message
        console.warn(
          "Could not populate sender details:",
          populateError.message,
        );
      }

      // Convert to plain object and include clientMessageId for matching
      const messageToSend = newMessage.toObject
        ? newMessage.toObject()
        : newMessage;
      messageToSend.clientMessageId = clientMessageId; // Include for frontend deduplication

      // Broadcast message to all users in the group room
      io.to(groupId).emit("receive_message", messageToSend);
      io.to(groupId).emit("receiveMessage", messageToSend);

      console.log(`📤 Message broadcasted to group: ${groupId}`);
    } catch (error) {
      console.error("❌ Error saving message:", error);
      socket.emit("message_error", {
        message: "Failed to send message",
        error: error.message,
      });
    }
  });

  /**
   * Send a file message to the group
   * Client emits: { groupId, message }
   * File is already uploaded via HTTP, this just broadcasts notification
   */
  socket.on("send_file", (data) => {
    const { groupId, message } = data;
    // Broadcast file message to all users in the group
    io.to(groupId).emit("receive_message", message);
    console.log(`File message sent to group ${groupId}`);
  });

  /**
   * Typing indicator
   * Client emits: { groupId, senderName }
   */
  socket.on("typing", (data) => {
    const { groupId, senderName } = data;
    socket.to(groupId).emit("user_typing", { senderName });
  });

  /**
   * Stop typing indicator
   * Client emits: { groupId }
   */
  socket.on("stop_typing", (data) => {
    const { groupId } = data;
    socket.to(groupId).emit("user_stop_typing");
  });

  /**
   * Emoji reaction added to a message
   * Client emits: { groupId, messageId, reaction: { emoji, userId, userName } }
   */
  socket.on("reaction_added", async (data) => {
    try {
      const { groupId, messageId, reaction } = data;
      console.log(
        `👍 Reaction ${reaction.emoji} added by ${reaction.userName} to message ${messageId}`,
      );

      // Fetch updated message to get all reactions
      const message = await Message.findById(messageId);

      // Broadcast to all users in the group
      io.to(groupId).emit("reaction_added", {
        messageId,
        reaction,
        updatedReactions: message?.reactions || [],
      });
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  });

  /**
   * User disconnected
   */
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Seed database with initial data on startup
const seedDatabase = async () => {
  try {
    console.log("\n📋 Checking if database needs initialization...");

    const demoEmail = "kavithi.thilakarathne123@gmail.com";
    const demoPassword = "TempPass123!";
    const sampleUsers = [
      "alice@example.com",
      "bob@example.com",
      "charlie@example.com",
      "diana@example.com",
      "eve@example.com",
    ];
    const authUserCount = await User.countDocuments();

    // Keep one stable demo account for local development so login remains predictable
    // across restarts and users are not forced into profile setup on startup.
    let demoUser = await User.findOne({ email: demoEmail.toLowerCase() });
    if (!demoUser) {
      const passwordHash = await bcrypt.hash(demoPassword, 10);
      demoUser = await User.create({
        email: demoEmail,
        passwordHash,
        fullName: "Kavithi Thilakarathne",
        name: "Kavithi",
        registrationNumber: "IT00000000",
        year: "3",
        semester: "2",
        enrolledYear: "2023",
        about: "Default development account",
        skills: ["Frontend", "Backend"],
        profileCompleted: true,
      });
      console.log("✓ Created default auth user for development");
    } else {
      // Never overwrite an existing user's password at startup.
      // This keeps manually registered credentials stable across restarts.
      if (!demoUser.passwordHash) {
        demoUser.passwordHash = await bcrypt.hash(demoPassword, 10);
      }
      if (!demoUser.fullName && demoUser.name)
        demoUser.fullName = demoUser.name;
      if (!demoUser.name && demoUser.fullName)
        demoUser.name = demoUser.fullName;
      if (typeof demoUser.profileCompleted !== "boolean") {
        demoUser.profileCompleted = true;
      }
      await demoUser.save();
      console.log("✓ Verified default auth user for development");
    }

    if (authUserCount === 0) {
      console.log(`   Email: ${demoEmail}`);
      console.log(`   Password: ${demoPassword}`);
    }

    const samplePasswordHash = await bcrypt.hash(demoPassword, 10);
    const sampleUserUpdate = await User.updateMany(
      {
        email: { $in: sampleUsers },
        $or: [{ passwordHash: { $exists: false } }, { passwordHash: "" }],
      },
      {
        $set: {
          passwordHash: samplePasswordHash,
          profileCompleted: true,
        },
      },
    );
    if (sampleUserUpdate.modifiedCount > 0) {
      console.log(
        `✓ Backfilled ${sampleUserUpdate.modifiedCount} sample auth user(s) with a login password`,
      );
    }

    const OLD_GROUP_NAME = "AI Project Team Alpha";
    const NEW_GROUP_NAME = "ITPM Project Group 01";

    const renamed = await Group.updateMany(
      { title: OLD_GROUP_NAME },
      { $set: { title: NEW_GROUP_NAME } },
    );
    if (renamed.modifiedCount > 0) {
      console.log(
        `✓ Renamed ${renamed.modifiedCount} group(s) from "${OLD_GROUP_NAME}" to "${NEW_GROUP_NAME}"`,
      );
    }

    const studentCount = await Student.countDocuments();
    const groupCount = await Group.countDocuments();

    if (studentCount > 0 || groupCount > 0) {
      console.log(
        `✓ Database already populated (${studentCount} students, ${groupCount} groups)`,
      );
      return;
    }

    console.log(
      "ℹ Database has no students/groups yet. Skipping dummy chat data seeding.",
    );
  } catch (error) {
    console.error("Error seeding database:", error.message);
  }
};

// Preflight check to avoid noisy crashes when another backend instance is already running.
const isPortAvailable = (port) =>
  new Promise((resolve) => {
    const tester = net
      .createServer()
      .once("error", (error) => {
        if (error.code === "EADDRINUSE") {
          resolve(false);
          return;
        }
        resolve(true);
      })
      .once("listening", () => {
        tester.close(() => resolve(true));
      });

    tester.listen(port);
  });

// Try to find an available port starting at `startPort`, checking `attempts` ports.
const getAvailablePort = async (startPort, attempts = 10) => {
  const start = parseInt(startPort, 10) || 5000;
  for (let i = 0; i < attempts; i++) {
    const portToCheck = start + i;
    // eslint-disable-next-line no-await-in-loop
    if (await isPortAvailable(portToCheck)) return portToCheck;
  }
  return null;
};

const startServer = async () => {
  try {
    const preferredPort = parseInt(PORT, 10) || 5000;
    const availablePort = await getAvailablePort(preferredPort, 20);

    if (!availablePort) {
      console.log(
        `⚠ No available ports found in range ${preferredPort}..${preferredPort + 19}.`,
      );
      console.log(
        "→ Stop the existing process or free up a port and try again.",
      );
      process.exit(0);
      return;
    }

    // If the preferred port is in use, log that we're falling back
    if (availablePort !== preferredPort) {
      console.log(
        `⚠ Preferred port ${preferredPort} is in use — falling back to available port ${availablePort}`,
      );
    }

    await connectDB();

    // Seed database if empty
    await seedDatabase();

    server.listen(availablePort, () => {
      console.log(`Server is running on port ${availablePort}`);
      console.log(`Socket.IO is ready for real-time communication`);
    });
  } catch (error) {
    console.error(`Startup failed: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown handlers
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Closing server gracefully...`);
  const { disconnectDB } = require("./config/db");

  server.close(async () => {
    console.log("HTTP server closed");
    await disconnectDB();
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("Forcing shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server
startServer();

module.exports = { app, io };
