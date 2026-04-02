const User = require('../models/User');

/**
 * Create a new user
 * POST /api/users
 */
exports.createUser = async (req, res) => {
  try {
    const { name, skills } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'User name is required'
      });
    }

    // Create user
    const user = new User({
      name,
      skills: skills || []
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

/**
 * Get all users
 * GET /api/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

/**
 * Update user
 * PUT /api/users/:id
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, skills } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { name, skills },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

/**
 * Delete user
 * DELETE /api/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

/**
 * Seed sample data for testing
 * GET /api/users/seed/sample-data
 */
exports.seedSampleData = async (req, res) => {
  try {
    const Group = require('../models/Group');
    const JoinRequest = require('../models/JoinRequest');

    // Check if sample data already exists
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      const allUsers = await User.find();
      const allGroups = await Group.find();
      const allRequests = await JoinRequest.find();
      return res.status(200).json({
        success: true,
        message: 'Sample data already exists',
        stats: {
          users: allUsers.length,
          groups: allGroups.length,
          requests: allRequests.length
        },
        data: {
          sampleUserId: allUsers[0]?._id,
          sampleGroupId: allGroups[0]?._id
        }
      });
    }

    // Create sample users
    const users = await User.insertMany([
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        skills: ['React', 'Node.js', 'PostgreSQL', 'Project Management', 'UI/UX']
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        skills: ['React', 'Vue.js', 'JavaScript', 'Python', 'REST APIs']
      },
      {
        name: 'Charlie Davis',
        email: 'charlie@example.com',
        skills: ['Figma', 'UI/UX', 'Graphic Design', 'Prototyping']
      },
      {
        name: 'Diana Wilson',
        email: 'diana@example.com',
        skills: ['Java', 'Spring Boot', 'Databases', 'Microservices']
      },
      {
        name: 'Eve Martinez',
        email: 'eve@example.com',
        skills: ['React', 'HTML/CSS', 'JavaScript']
      }
    ]);

    // Create sample groups
    const groups = await Group.insertMany([
      {
        title: 'Web App Development Team',
        description: 'Building a modern web application with React and Node.js. We need developers experienced in full-stack development.',
        requiredSkills: ['React', 'Node.js', 'REST APIs'],
        members: [users[0]._id, users[1]._id],
        memberLimit: 5,
        status: 'active'
      },
      {
        title: 'Mobile App Project',
        description: 'Creating a cross-platform mobile application. Looking for developers with React Native experience.',
        requiredSkills: ['React Native', 'JavaScript', 'Mobile Dev'],
        members: [users[2]._id],
        memberLimit: 4,
        status: 'active'
      },
      {
        title: 'UI/UX Design Squad',
        description: 'Designing intuitive user interfaces for digital products. Figma expertise required.',
        requiredSkills: ['Figma', 'UI/UX', 'Prototyping'],
        members: [users[2]._id],
        memberLimit: 3,
        status: 'active'
      },
      {
        title: 'Backend Optimization Group',
        description: 'Optimizing backend performance. Looking for experienced backend engineers.',
        requiredSkills: ['Java', 'Databases', 'Spring Boot'],
        members: [users[3]._id],
        memberLimit: 4,
        status: 'active'
      }
    ]);

    // Create sample join requests
    await JoinRequest.insertMany([
      {
        userId: users[4]._id, // Eve
        groupId: groups[0]._id, // Web App Dev
        requestType: 'student-request',
        status: 'pending',
        matchScore: 66.67,
        matchedSkills: ['React', 'JavaScript'],
        missingSkills: ['Node.js', 'REST APIs']
      },
      {
        userId: users[1]._id, // Bob
        groupId: groups[1]._id, // Mobile App
        requestType: 'student-request',
        status: 'pending',
        matchScore: 33.33,
        matchedSkills: ['JavaScript'],
        missingSkills: ['React Native', 'Mobile Dev']
      }
    ]);

    res.status(201).json({
      success: true,
      message: '✅ Sample data created successfully!',
      stats: {
        users: users.length,
        groups: groups.length,
        requests: 2
      },
      testData: {
        sampleUserId: users[4]._id, // Eve Martinez for student view
        sampleGroupId: groups[0]._id, // Web App Dev for leader view
        instructions: 'Use these IDs in the Smart Request & Invitation Hub to test the features'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error seeding sample data',
      error: error.message
    });
  }
};
