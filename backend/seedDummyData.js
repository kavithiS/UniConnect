/**
 * Dummy Data Seed Script
 * Creates 4 dummy students and 1 group with those students as members
 * Run this script once to populate the database for testing
 *
 * Usage: node backend/seedDummyData.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Student = require("./models/Student");
const Group = require("./models/Group");
const Message = require("./models/Message");

dotenv.config();

let mongoServer;

// MongoDB Connection with Fallback
const connectDB = async () => {
  try {
    // Try Atlas connection first if MONGO_URI is set
    if (process.env.MONGO_URI && !process.env.USE_MEMORY_DB) {
      try {
        console.log("Attempting MongoDB Atlas connection...");
        const conn = await mongoose.connect(process.env.MONGO_URI, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`✓ MongoDB Atlas Connected: ${conn.connection.host}`);
        return conn;
      } catch (atlasError) {
        console.log("⚠ MongoDB Atlas connection failed");
        console.log("→ Falling back to in-memory MongoDB...\n");
      }
    }

    // Fall back to in-memory MongoDB
    console.log("Starting MongoDB Memory Server...");
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const conn = await mongoose.connect(mongoUri);
    console.log(`✓ MongoDB Memory Server Connected: ${conn.connection.host}`);
    console.log("→ Using in-memory database for seeding\n");
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

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

// Seed Database
const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data (optional - remove if you want to keep existing data)
    console.log("Clearing existing dummy data...");
    await Student.deleteMany({
      userId: { $in: ["S001", "S002", "S003", "S004"] },
    });
    await Group.deleteMany({
      groupName: { $in: ["AI Project Team Alpha", "ITPM Project Group 01"] },
    });

    // Create students
    console.log("Creating dummy students...");
    const students = await Student.insertMany(dummyStudents);
    console.log(`✓ Created ${students.length} students`);

    // Get student IDs
    const studentIds = students.map((student) => student._id);

    // Create a group with all students as members
    console.log("Creating dummy group...");
    const dummyGroup = await Group.create({
      groupName: "ITPM Project Group 01",
      members: studentIds,
      createdBy: studentIds[0], // John Smith creates the group,
    });
    console.log(`✓ Created group: ${dummyGroup.groupName}`);

    // Create some initial messages for the group
    console.log("Creating initial messages...");
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

    // Display created data
    console.log("\n\n");
    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║           ✓ DUMMY DATA SUCCESSFULLY CREATED             ║");
    console.log("╚════════════════════════════════════════════════════════╝");

    console.log("\n📦 STUDENTS CREATED:");
    students.forEach((student, index) => {
      console.log(
        `  ${index + 1}. ${student.firstName} ${student.lastName} (${student.userId})`,
      );
      console.log(`     ID: ${student._id}`);
    });

    console.log(`\n👥 GROUP CREATED:`);
    console.log(`  Name: ${dummyGroup.groupName}`);
    console.log(`  Members: ${dummyGroup.members.length}`);
    console.log(`\n🆔 GROUP ID (COPY THIS):`);
    console.log(`\n   ╔════════════════════════════════════════════╗`);
    console.log(`   ║ ${dummyGroup._id.toString().padEnd(42)} ║`);
    console.log(`   ╚════════════════════════════════════════════╝\n`);

    console.log(`📝 STUDENT ID TO USE AS SENDER (COPY ONE):`);
    students.forEach((student, index) => {
      console.log(
        `   ${index + 1}. ${student._id.toString()} (${student.firstName} ${student.lastName})`,
      );
    });
    console.log();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n📌 NEXT STEPS:");
    console.log("\n1️⃣  Copy the Group ID from above");
    console.log("2️⃣  Open: frontend/src/pages/chat_area_page/GroupChat.jsx");
    console.log("3️⃣  Find line 26: const DUMMY_GROUP_ID = ...");
    console.log(
      '4️⃣  Replace with: const DUMMY_GROUP_ID = "<GROUP_ID_FROM_ABOVE>";',
    );
    console.log("5️⃣  Find line 27: const DUMMY_SENDER_ID = ...");
    console.log("6️⃣  Replace with any Student ID from above");
    console.log("7️⃣  Find line 28: const DUMMY_SENDER_NAME = ...");
    console.log("8️⃣  Match the sender name with the chosen Student ID");
    console.log("9️⃣  Save the file and refresh http://localhost:3000/chat");
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Cleanup and exit
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    // Cleanup even on error
    if (mongoServer) {
      await mongoServer.stop();
    }
    process.exit(1);
  }
};

// Run seed
seedDatabase();
