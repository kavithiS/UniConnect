const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      maxlength: [100, "Group name cannot exceed 100 characters"],
    },
    profilePicture: {
      type: String, // Base64 encoded image or URL
      default: null,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student", // Reference to Student model
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", // Student who created the group
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  },
);

// Index for faster queries
groupSchema.index({ members: 1 });
groupSchema.index({ createdAt: -1 });

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
