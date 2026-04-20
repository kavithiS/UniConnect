const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Group = require("./models/Group");
const bcrypt = require("bcryptjs");

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/uniconnect";
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(uri);
    console.log(`MongoDB Connected.`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

const seedFeedbackTeammates = async () => {
  await connectDB();

  try {
    const allUsers = await User.find({});
    if (allUsers.length === 0) {
      console.log("No users found. Please register first.");
      process.exit(1);
    }
    console.log(`Found ${allUsers.length} users. Provisioning for all...`);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("Password123!", salt);

    // Updated names as per user request
    const dummiesData = [
      { fullName: "Kavithi Thilakarathne (Teammate)", email: "kavithi.test@uniconnect.edu", passwordHash, faculty: "Computing", skills: ["React", "Node.js"], profileCompleted: true },
      { fullName: "Danaja V Kulathunga (Teammate)", email: "danaja.test@uniconnect.edu", passwordHash, faculty: "Business", skills: ["UI/UX", "Figma"], profileCompleted: true },
      { fullName: "Ramudi Jayalath (Teammate)", email: "ramudi.test@uniconnect.edu", passwordHash, faculty: "Engineering", skills: ["Python", "SQL"], profileCompleted: true }
    ];

    const globalDummies = [];
    for (const d of dummiesData) {
      let u = await User.findOne({ email: d.email });
      if (!u) u = await User.create(d);
      globalDummies.push(u);
    }

    const dummyIds = globalDummies.map(d => d._id);

    // Delete previous auto-generated groups to avoid duplicates or name conflicts
    await Group.deleteMany({ title: { $regex: "Feedback Test Group" } });

    for (const user of allUsers) {
      // Don't add dummies to their own groups to rate themselves
      if (dummyIds.some(id => id.toString() === user._id.toString())) continue;

      await Group.create({
        title: `Feedback Test Group - ${user.fullName || user.email}`,
        description: "Auto-generated group for testing feedback.",
        members: [user._id, ...dummyIds],
        memberLimit: 10,
        status: "active"
      });
      console.log(`? Added 3 teammates for: ${user.fullName || user.email}`);
    }

    console.log("\nDone! Every user now has 3 teammates (Kavithi, Danaja, Ramudi) in their dropdown.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedFeedbackTeammates();
