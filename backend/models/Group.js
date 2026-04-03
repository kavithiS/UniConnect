const mongoose = require('mongoose');
const { generateUniqueGroupCode, PREFIX } = require('../utils/groupCode');

/**
 * Group Schema
 * Stores group details, required skills, members, and status
 */
const groupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Group title is required'],
      alias: 'groupName',
      trim: true,
      minlength: [3, 'Title must be at least 3 characters']
    },
    description: {
      type: String,
      required: [true, 'Group description is required'],
      minlength: [10, 'Description must be at least 10 characters']
    },
    groupCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
      index: true
    },
    requiredSkills: {
      type: [String],
      default: [],
      trim: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    memberLimit: {
      type: Number,
      required: [true, 'Member limit is required'],
      min: [1, 'Member limit must be at least 1'],
      max: [100, 'Member limit cannot exceed 100']
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'archived'],
      default: 'active'
    },
    profilePicture: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Pre-save hook to generate groupCode if missing
groupSchema.pre('save', async function() {
  if (!this.groupCode || !this.groupCode.startsWith(PREFIX)) {
    const GroupModel = mongoose.model('Group');
    this.groupCode = await generateUniqueGroupCode(GroupModel);
  }
});

module.exports = mongoose.model('Group', groupSchema);
