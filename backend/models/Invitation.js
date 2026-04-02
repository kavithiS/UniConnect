const mongoose = require('mongoose');

/**
 * Invitation Schema
 * Stores invitation details for group invitations sent by group members
 */
const invitationSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender user ID is required']
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient user ID is required']
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group ID is required']
    },
    requestType: {
      type: String,
      enum: ['student-request', 'leader-invitation'],
      default: 'leader-invitation',
      description: 'Type of request: student requesting or leader inviting'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired', 'withdrawn'],
      default: 'pending'
    },
    message: {
      type: String,
      description: 'Invitation message from the sender'
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
      description: 'Skills that matched between invitee and group requirements'
    },
    missingSkills: {
      type: [String],
      default: [],
      description: 'Required skills that invitee is missing'
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      description: 'Invitation expiration date'
    },
    respondedAt: {
      type: Date,
      default: null,
      description: 'When the invitation was accepted/rejected/expired'
    },
    responseMessage: {
      type: String,
      default: '',
      description: 'Response message from the recipient'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invitation', invitationSchema);
