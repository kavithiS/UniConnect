const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: [true, "Group ID is required"],
      index: true, // Index for faster queries by group
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Sender ID is required"],
      alias: "senderId",
    },
    senderName: {
      type: String,
      required: true, // Store sender name for faster display without population
    },
    profilePicture: {
      type: String, // Base64 encoded image or URL to profile picture
      default: null,
    },
    text: {
      type: String,
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
      alias: "message",
    },
    fileUrl: {
      type: String, // URL or path to uploaded file
    },
    fileName: {
      type: String, // Original file name
    },
    fileType: {
      type: String, // MIME type (image/png, application/pdf, etc.)
    },
    fileSize: {
      type: Number, // File size in bytes
    },

    // Reply functionality
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null, // null if not a reply
    },
    // Mentions - stores IDs of mentioned users
    mentions: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        userName: String,
      },
    ],
    // Message editing
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    editHistory: [
      {
        originalText: String,
        editedText: String,
        editedAt: Date,
      },
    ],
    // Soft delete functionality
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // Pin functionality (max 3 per group)
    isPinned: {
      type: Boolean,
      default: false,
    },
    pinnedAt: {
      type: Date,
      default: null,
    },
    // Star/Like functionality (per user)
    starredBy: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        starredAt: Date,
      },
    ],
    // Forward tracking
    isForwarded: {
      type: Boolean,
      default: false,
    },
    forwardedFrom: {
      groupId: mongoose.Schema.Types.ObjectId,
      originalSenderId: mongoose.Schema.Types.ObjectId,
      originalSenderName: String,
      originalMessageId: mongoose.Schema.Types.ObjectId,
    },
    // Emoji reactions (WhatsApp-style)
    reactions: [
      {
        emoji: String, // The emoji (e.g., "👍", "❤️", "😂")
        userId: mongoose.Schema.Types.ObjectId,
        userName: String,
        reactedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index for efficient message retrieval by group and time
messageSchema.index({ groupId: 1, createdAt: -1 });

// Create model with collection name "chat_History" as per requirements
const Message = mongoose.model("Message", messageSchema, "chat_History");

module.exports = Message;
