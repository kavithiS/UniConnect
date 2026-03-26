const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const net = require("net");
const { Server } = require("socket.io");
const path = require("path");
const connectDB = require("./config/db");
const studentRoutes = require("./routes/studentRoutes");
const chatRoutes = require("./routes/chatRoutes");
const Message = require("./models/Message");
const Student = require("./models/Student");
const Group = require("./models/Group");

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

/**
 * Socket.IO Configuration
 * Enable CORS for frontend connection
 */
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/chat", chatRoutes);

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

      console.log(" Saving message to chat_History collection...");
      console.log(`   Group: ${groupId}, Sender: ${senderName}`);

      // Save message to database (automatically goes to chat_History collection)
      const newMessage = await Message.create({
        groupId,
        sender: senderId,
        senderName,
        profilePicture: profilePicture || null,
        text,
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

    const OLD_GROUP_NAME = "AI Project Team Alpha";
    const NEW_GROUP_NAME = "ITPM Project Group 01";

    const renamed = await Group.updateMany(
      { groupName: OLD_GROUP_NAME },
      { $set: { groupName: NEW_GROUP_NAME } },
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

    console.log("📦 Database is empty. Creating initial data...\n");

    // Dummy Students Data
    const dummyStudents = [
      {
        userId: "S001",
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@university.edu",
        university: "SLIIT",
        degree: "Computer Science",
        currentYear: 3,
        currentSemester: 2,
        gpa: 3.8,
        bio: "Passionate about web development and AI",
        skills: ["JavaScript", "React", "Node.js", "Python"],
        interests: ["Machine Learning", "Web Development"],
      },
      {
        userId: "S002",
        firstName: "Emma",
        lastName: "Johnson",
        email: "emma.johnson@university.edu",
        university: "SLIIT",
        degree: "Software Engineering",
        currentYear: 3,
        currentSemester: 2,
        gpa: 3.7,
        bio: "Full-stack developer interested in cloud computing",
        skills: ["Java", "Spring Boot", "MongoDB", "AWS"],
        interests: ["Cloud Computing", "DevOps"],
      },
      {
        userId: "S003",
        firstName: "Michael",
        lastName: "Brown",
        email: "michael.brown@university.edu",
        university: "SLIIT",
        degree: "Computer Science",
        currentYear: 3,
        currentSemester: 2,
        gpa: 3.6,
        bio: "Mobile app developer and UI/UX enthusiast",
        skills: ["React Native", "Flutter", "Figma", "UI Design"],
        interests: ["Mobile Development", "UI/UX Design"],
      },
      {
        userId: "S004",
        firstName: "Sarah",
        lastName: "Davis",
        email: "sarah.davis@university.edu",
        university: "SLIIT",
        degree: "Information Technology",
        currentYear: 3,
        currentSemester: 2,
        gpa: 3.9,
        bio: "Data science and analytics specialist",
        skills: ["Python", "Data Analysis", "TensorFlow", "SQL"],
        interests: ["Data Science", "Analytics"],
      },
    ];

    // Create students
    const students = await Student.insertMany(dummyStudents);
    console.log(`✓ Created ${students.length} students`);

    // Get student IDs
    const studentIds = students.map((student) => student._id);

    // Create a group with all students as members
    const dummyGroup = await Group.create({
      groupName: "ITPM Project Group 01",
      members: studentIds,
      createdBy: studentIds[0],
    });
    console.log(`✓ Created group: ${dummyGroup.groupName}`);

    // Create initial messages
    const initialMessages = [
      {
        groupId: dummyGroup._id,
        sender: studentIds[0],
        senderName: "John Smith",
        text: "Hey everyone! Welcome to our project group. Let's build something amazing! 🚀",
      },
      {
        groupId: dummyGroup._id,
        sender: studentIds[1],
        senderName: "Emma Johnson",
        text: "Excited to work with you all! When should we schedule our first meeting?",
      },
      {
        groupId: dummyGroup._id,
        sender: studentIds[2],
        senderName: "Michael Brown",
        text: "I'm free this weekend. How about Saturday afternoon?",
      },
      {
        groupId: dummyGroup._id,
        sender: studentIds[3],
        senderName: "Sarah Davis",
        text: "Saturday works for me too! I'll prepare some initial data analysis.",
      },
    ];

    await Message.insertMany(initialMessages);
    console.log(`✓ Created ${initialMessages.length} initial messages`);

    console.log("✓ DATABASE INITIALIZED SUCCESSFULLY");

    console.log("📌 STUDENT DETAILS:");
    students.forEach((student) => {
      console.log(
        `   • ${student.firstName} ${student.lastName} (${student.userId})`,
      );
      console.log(`     MongoDB ID: ${student._id}`);
    });

    console.log(`\n👥 GROUP CREATED:`);
    console.log(`   • Name: ${dummyGroup.groupName}`);
    console.log(`   • Group ID: ${dummyGroup._id}`);
    console.log(`   • Members: ${dummyGroup.members.length}`);

    console.log(`\n📋 COPY THESE IDS FOR FRONTEND:`);
    console.log(`   • Group ID: ${dummyGroup._id}`);
    console.log(`   • John Smith ID: ${students[0]._id}`);
    console.log(`   • Emma Johnson ID: ${students[1]._id}\n`);
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

const startServer = async () => {
  try {
    const portFree = await isPortAvailable(PORT);
    if (!portFree) {
      console.log(
        `⚠ Port ${PORT} is already in use. Backend is likely already running.`,
      );
      console.log(
        "→ Stop the existing process or run only one backend instance.",
      );
      process.exit(0);
      return;
    }

    await connectDB();

    // Seed database if empty
    await seedDatabase();

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
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
