const mongoose = require('mongoose');

/**
 * JoinRequest Schema
 * Stores join request details with advanced status tracking and skill matching
 */
const joinRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group ID is required']
    },
    requestType: {
      type: String,
      enum: ['student-request', 'leader-invitation'],
      default: 'student-request',
      description: 'Type of request: student requesting or leader inviting'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired', 'withdrawn'],
      default: 'pending'
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      description: 'Skill match percentage (0-100)'
    },
    matchedSkills: {
      type: [String],
      default: [],
      description: 'Skills that matched between user and group requirements'
    },
    missingSkills: {
      type: [String],
      default: [],
      description: 'Required skills that user is missing'
    },
    message: {
      type: String,
      default: '',
      description: 'Optional message from requester explaining why they want to join'
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      description: 'Request expiration date'
    },
    respondedAt: {
      type: Date,
      default: null,
      description: 'When the request was accepted/rejected/expired'
    },
    responseMessage: {
      type: String,
      default: '',
      description: 'Response message from group leader'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
