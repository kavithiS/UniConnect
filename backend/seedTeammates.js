const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Group = require('./models/Group');

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uniconnect';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const hash = await bcrypt.hash('password123', 10);
    const teammatesData = [
      { email: 'danaja@example.com', fullName: 'Danaja', name: 'Danaja', passwordHash: hash, profileCompleted: true, role: 'Student' },
      { email: 'kavithi@example.com', fullName: 'Kavithi', name: 'Kavithi', passwordHash: hash, profileCompleted: true, role: 'Student' },
      { email: 'ramudi@example.com', fullName: 'Ramudi', name: 'Ramudi', passwordHash: hash, profileCompleted: true, role: 'Student' }
    ];

    const memberIds = [];
    for (const t of teammatesData) {
      let user = await User.findOne({ email: t.email });
      if (!user) {
        user = await User.create(t);
        console.log('Created user:', t.fullName);
      }
      memberIds.push(user._id);
    }

    // Try to find current user (Hiran)
    const hiran = await User.findOne({ fullName: 'Hiran' }) || await User.findOne({ email: /hiran/i });
    if (hiran) {
      memberIds.push(hiran._id);
      console.log('Added Hiran to group');
    } else {
       const newHiran = await User.create({ 
        email: 'hiran@example.com', 
        fullName: 'Hiran', 
        name: 'Hiran', 
        passwordHash: hash, 
        profileCompleted: true, 
        role: 'Student' 
      });
      memberIds.push(newHiran._id);
      console.log('Created and added Hiran to group');
    }

    const groupData = {
      title: 'Project Group Alpha',
      members: memberIds,
      status: 'active',
      groupCode: 'ALPHA123'
    };

    let group = await Group.findOne({ title: groupData.title });
    if (!group) {
      group = await Group.create(groupData);
      console.log('Created group:', groupData.title);
    } else {
      group.members = memberIds;
      await group.save();
      console.log('Updated group members');
    }

    console.log('Seeding finished successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
