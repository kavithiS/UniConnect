# MongoDB & Backend Implementation Guide

## MONGODB SETUP SCRIPT

```javascript
// Run this in mongosh or MongoDB Compass

// 1. CREATE USERS COLLECTION
db.createCollection("users");
db.users.createIndex({ email: 1 }, { unique: true });

// 2. CREATE GROUPS COLLECTION
db.createCollection("groups");
db.groups.createIndex({ createdBy: 1 });
db.groups.createIndex({ status: 1 });
db.groups.createIndex({ groupCode: 1 }, { unique: true });
db.groups.createIndex({ "members": 1 });

// 3. CREATE REQUESTS COLLECTION
db.createCollection("requests");
db.requests.createIndex({ from: 1, groupId: 1 }, { unique: true }); // Prevent duplicates
db.requests.createIndex({ to: 1, status: 1 }); // For inbox queries
db.requests.createIndex({ from: 1, status: 1 }); // For sent requests
db.requests.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-delete
db.requests.createIndex({ createdAt: 1 });

// 4. SAMPLE DATA

// Create Users
db.users.insertOne({
  _id: ObjectId("650001aabbccdd11eeff2233"),
  email: "john@example.com",
  name: "John Doe",
  password: "hashed_password_here",
  skills: ["React", "Node.js", "MongoDB"],
  bio: "Full-stack developer passionate about web apps",
  avatar: "https://api.example.com/avatars/john.jpg",
  createdAt: new Date(),
  updatedAt: new Date()
});

db.users.insertOne({
  _id: ObjectId("650001aabbccdd11eeff2234"),
  email: "sarah@example.com",
  name: "Sarah Khan",
  password: "hashed_password_here",
  skills: ["React", "JavaScript", "CSS"],
  bio: "Frontend developer and UI designer",
  avatar: "https://api.example.com/avatars/sarah.jpg",
  createdAt: new Date(),
  updatedAt: new Date()
});

db.users.insertOne({
  _id: ObjectId("650001aabbccdd11eeff2235"),
  email: "mike@example.com",
  name: "Mike Lee",
  password: "hashed_password_here",
  skills: ["Python", "Django", "PostgreSQL"],
  bio: "Backend developer",
  avatar: "https://api.example.com/avatars/mike.jpg",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create Groups
db.groups.insertOne({
  _id: ObjectId("660001aabbccdd11eeff2233"),
  groupCode: "IT100-ABC123",
  title: "Web Development Team",
  description: "Building modern web applications with MERN stack. Looking for motivated developers.",
  requiredSkills: ["React", "Node.js"],
  createdBy: ObjectId("650001aabbccdd11eeff2233"),
  members: [ObjectId("650001aabbccdd11eeff2233")],
  memberLimit: 5,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
});

db.groups.insertOne({
  _id: ObjectId("660001aabbccdd11eeff2234"),
  groupCode: "IT100-XYZ789",
  title: "Python Data Science",
  description: "Data science and machine learning enthusiasts",
  requiredSkills: ["Python", "Pandas", "Scikit-learn"],
  createdBy: ObjectId("650001aabbccdd11eeff2235"),
  members: [ObjectId("650001aabbccdd11eeff2235")],
  memberLimit: 8,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create Requests
db.requests.insertOne({
  _id: ObjectId("770001aabbccdd11eeff2233"),
  requestType: "join",
  status: "pending",
  from: ObjectId("650001aabbccdd11eeff2234"),
  to: ObjectId("650001aabbccdd11eeff2233"),
  groupId: ObjectId("660001aabbccdd11eeff2233"),
  skillMatchScore: 85,
  message: "Hi John! I'm very interested in joining your web dev team.",
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  respondedAt: null,
  updatedAt: new Date()
});

db.requests.insertOne({
  _id: ObjectId("770001aabbccdd11eeff2234"),
  requestType: "join",
  status: "pending",
  from: ObjectId("650001aabbccdd11eeff2235"),
  to: ObjectId("650001aabbccdd11eeff2233"),
  groupId: ObjectId("660001aabbccdd11eeff2233"),
  skillMatchScore: 40,
  message: "I'd like to learn web development from your team.",
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  respondedAt: null,
  updatedAt: new Date()
});
```

---

## MONGOOSE MODELS (backend/models/)

### User.js
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't return password by default
  },
  skills: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return !v || v.every(s => typeof s === 'string' && s.length > 0);
      },
      message: 'Skills must be non-empty strings'
    }
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  avatar: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### Group.js
```javascript
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupCode: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Group title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  requiredSkills: {
    type: [String],
    required: [true, 'At least one skill is required'],
    validate: {
      validator: function(v) {
        return v && v.length > 0 && v.every(s => typeof s === 'string' && s.length > 0);
      },
      message: 'Required skills must be non-empty'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  members: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  memberLimit: {
    type: Number,
    required: [true, 'Member limit is required'],
    min: [2, 'Minimum member limit is 2'],
    max: [100, 'Maximum member limit is 100']
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'archived'],
    default: 'active',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Auto-generate group code before first save
groupSchema.pre('save', async function() {
  if (!this.groupCode) {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.groupCode = `IT100-${randomCode}${randomNum}`;
  }
});

// Virtual for available slots
groupSchema.virtual('availableSlots').get(function() {
  return this.memberLimit - this.members.length;
});

// Method to check if group is full
groupSchema.methods.isFull = function() {
  return this.members.length >= this.memberLimit;
};

// Method to add member
groupSchema.methods.addMember = async function(userId) {
  if (!this.members.includes(userId)) {
    this.members.push(userId);
    await this.save();
  }
};

module.exports = mongoose.model('Group', groupSchema);
```

### Request.js
```javascript
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requestType: {
    type: String,
    enum: ['join', 'invitation'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired', 'cancelled'],
    default: 'pending',
    index: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
    index: true
  },
  skillMatchScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  message: {
    type: String,
    default: '',
    maxlength: 500
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date,
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Unique constraint: from + groupId (prevent duplicate join requests)
requestSchema.index({ from: 1, groupId: 1 }, { 
  unique: true,
  partialFilterExpression: { status: 'pending' } // Unique only when pending
});

// Method to check if request is expired
requestSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Static method to auto-expire old requests
requestSchema.statics.expireOldRequests = async function() {
  await this.updateMany(
    {
      status: 'pending',
      expiresAt: { $lt: new Date() }
    },
    {
      status: 'expired',
      updatedAt: new Date()
    }
  );
};

module.exports = mongoose.model('Request', requestSchema);
```

---

## CONTROLLER IMPLEMENTATION (backend/controllers/)

### requestController.js

```javascript
const Request = require('../models/Request');
const Group = require('../models/Group');
const User = require('../models/User');

// UTILITY: Calculate skill match
const calculateSkillMatch = (userSkills, requiredSkills) => {
  if (requiredSkills.length === 0) return 100;
  
  const userSkillsLower = (userSkills || []).map(s => s.toLowerCase());
  const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase());
  
  const matchedSkills = requiredSkillsLower.filter(skill =>
    userSkillsLower.includes(skill)
  ).length;
  
  return Math.round((matchedSkills / requiredSkillsLower.length) * 100);
};

// ENDPOINT: Send join request or invitation
exports.sendRequest = async (req, res) => {
  try {
    const { groupId, requestType, message } = req.body;
    const fromUserId = req.user.id; // From auth middleware

    // Validation
    if (!groupId || !requestType) {
      return res.status(400).json({ message: 'Group ID and request type are required' });
    }

    if (!['join', 'invitation'].includes(requestType)) {
      return res.status(400).json({ message: 'Invalid request type' });
    }

    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if group is active
    if (group.status !== 'active') {
      return res.status(400).json({ message: 'This group is no longer accepting requests' });
    }

    // Check if group is full
    if (group.isFull()) {
      return res.status(400).json({ message: 'This group has reached its member limit' });
    }

    let toUserId;

    if (requestType === 'join') {
      // Join request: to group creator
      toUserId = group.createdBy;
      const fromUser = req.user;

      // Check if user is already a member
      if (group.members.includes(fromUserId)) {
        return res.status(400).json({ message: 'You are already a member of this group' });
      }

      // Check for existing pending request
      const existingRequest = await Request.findOne({
        from: fromUserId,
        groupId,
        status: 'pending'
      });

      if (existingRequest) {
        return res.status(400).json({ message: 'You already have a pending request for this group' });
      }

      // Calculate skill match
      const skillMatchScore = calculateSkillMatch(fromUser.skills, group.requiredSkills);

      // Create join request
      const newRequest = new Request({
        requestType: 'join',
        status: 'pending',
        from: fromUserId,
        to: toUserId,
        groupId,
        skillMatchScore,
        message: message || '',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      await newRequest.save();

      return res.status(201).json({
        message: 'Join request sent successfully',
        request: newRequest
      });

    } else if (requestType === 'invitation') {
      // Invitation: to specified user from group member
      const { toUserId: targetUserId } = req.body;

      if (!targetUserId) {
        return res.status(400).json({ message: 'Target user ID is required for invitations' });
      }

      // Check if sender is group member
      if (!group.members.includes(fromUserId)) {
        return res.status(403).json({ message: 'Only group members can send invitations' });
      }

      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: 'Target user not found' });
      }

      // Check if target is already a member
      if (group.members.includes(targetUserId)) {
        return res.status(400).json({ message: 'User is already a member of this group' });
      }

      // Check for existing pending invitation
      const existingInvitation = await Request.findOne({
        from: fromUserId,
        to: targetUserId,
        groupId,
        status: 'pending'
      });

      if (existingInvitation) {
        return res.status(400).json({ message: 'You already have a pending invitation for this user' });
      }

      // Calculate skill match
      const skillMatchScore = calculateSkillMatch(targetUser.skills, group.requiredSkills);

      // Create invitation
      const newInvitation = new Request({
        requestType: 'invitation',
        status: 'pending',
        from: fromUserId,
        to: targetUserId,
        groupId,
        skillMatchScore,
        message: message || '',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      await newInvitation.save();

      return res.status(201).json({
        message: 'Invitation sent successfully',
        request: newInvitation
      });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ENDPOINT: Get received requests
exports.getReceivedRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query; // Optional filter

    let query = { to: userId };
    if (status) {
      query.status = status;
    }

    const requests = await Request.find(query)
      .populate('from', 'name email skills avatar')
      .populate('groupId', 'title groupCode memberLimit members')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: requests.length,
      requests
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ENDPOINT: Get sent requests
exports.getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query; // Optional filter

    let query = { from: userId };
    if (status) {
      query.status = status;
    }

    const requests = await Request.find(query)
      .populate('to', 'name email avatar')
      .populate('groupId', 'title groupCode memberLimit')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: requests.length,
      requests
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ENDPOINT: Accept request
exports.acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if current user is the "to" user
    if (request.to.toString() !== userId) {
      return res.status(403).json({ message: 'You can only accept requests sent to you' });
    }

    // Check if request is pending
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Cannot accept a ${request.status} request` });
    }

    // Check if group still exists and is active
    const group = await Group.findById(request.groupId);
    if (!group || group.status !== 'active') {
      return res.status(400).json({ message: 'This group is no longer available' });
    }

    // Check if group still has space
    if (group.isFull()) {
      return res.status(400).json({ message: 'This group has reached its member limit' });
    }

    // Add user to group
    await group.addMember(request.from);

    // Update request status
    request.status = 'accepted';
    request.respondedAt = new Date();
    await request.save();

    // Close all other pending requests from this user to the same group
    await Request.updateMany(
      {
        from: request.from,
        groupId: request.groupId,
        status: 'pending',
        _id: { $ne: requestId }
      },
      {
        status: 'cancelled',
        updatedAt: new Date()
      }
    );

    // If group is now full, reject all other pending requests
    if (group.isFull()) {
      await Request.updateMany(
        {
          groupId: request.groupId,
          status: 'pending'
        },
        {
          status: 'rejected',
          updatedAt: new Date()
        }
      );
    }

    res.status(200).json({
      message: 'Request accepted successfully',
      request
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ENDPOINT: Reject request
exports.rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if current user is the "to" user
    if (request.to.toString() !== userId) {
      return res.status(403).json({ message: 'You can only reject requests sent to you' });
    }

    // Check if request is pending
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Cannot reject a ${request.status} request` });
    }

    request.status = 'rejected';
    request.respondedAt = new Date();
    await request.save();

    res.status(200).json({
      message: 'Request rejected successfully',
      request
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ENDPOINT: Cancel request (sender only)
exports.cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if current user is the "from" user
    if (request.from.toString() !== userId) {
      return res.status(403).json({ message: 'You can only cancel your own requests' });
    }

    // Check if request is pending
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Cannot cancel a ${request.status} request` });
    }

    request.status = 'cancelled';
    request.updatedAt = new Date();
    await request.save();

    res.status(200).json({
      message: 'Request cancelled successfully',
      request
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// BACKGROUND JOB: Auto-expire old requests (run daily via cron)
exports.expireOldRequests = async (req, res) => {
  try {
    const result = await Request.expireOldRequests();
    res.status(200).json({
      message: `Auto-expired ${result.modifiedCount} requests`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
```

---

## API ROUTES (backend/routes/)

### requestRoutes.js

```javascript
const express = require('express');
const router = express.Router();
const { 
  sendRequest, 
  getReceivedRequests, 
  getSentRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  expireOldRequests 
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth'); // Auth middleware

// All routes require authentication
router.use(protect);

// Send new request
router.post('/', sendRequest);

// Get received requests
router.get('/received', getReceivedRequests);

// Get sent requests
router.get('/sent', getSentRequests);

// Accept request
router.put('/:requestId/accept', acceptRequest);

// Reject request
router.put('/:requestId/reject', rejectRequest);

// Cancel request
router.delete('/:requestId', cancelRequest);

// Background job (secure this endpoint!)
router.post('/job/expire', expireOldRequests);

module.exports = router;
```

Add to backend/index.js or app.js:
```javascript
const requestRoutes = require('./routes/requestRoutes');
app.use('/api/requests', requestRoutes);
```

---

## CRON JOB SETUP (Optional but Recommended)

Add to backend/index.js:
```javascript
const cron = require('node-cron');
const Request = require('./models/Request');

// Run auto-expire job every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  try {
    const result = await Request.expireOldRequests();
    console.log(`[CRON] Auto-expired ${result.modifiedCount} requests`);
  } catch (err) {
    console.error('[CRON] Error expiring requests:', err);
  }
});
```

Install package:
```bash
npm install node-cron
```

---

## TESTING CHECKLIST

```
REQUEST CREATION TESTS:
[ ] User A sends join request to Group X
[ ] User B cannot send duplicate request to Group X
[ ] User C cannot request group they're already in
[ ] User D cannot request closed/archived group
[ ] Skill match score calculated correctly (85% = 2/3 skills match)

ACCEPTANCE TESTS:
[ ] User A accepts request from User B
[ ] User B added to group members
[ ] Other pending requests from User B to Group X are cancelled
[ ] If group now full, all other pending requests are rejected
[ ] Request status shows "accepted"

REJECTION TESTS:
[ ] Request marked "rejected" after rejection
[ ] User not added to group
[ ] Sender still has option to request again

EXPIRATION TESTS:
[ ] Request expires after 30 days
[ ] Cron job marks expired requests correctly
[ ] Expired requests removed from inbox

EDGE CASES:
[ ] Send request to own group (should fail)
[ ] Accept already-accepted request (should fail)
[ ] Cancel own request while pending
[ ] Creator removes group while request pending
[ ] User deletes account (cascade delete requests)
```
