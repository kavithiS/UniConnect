const Message = require("../models/Message");
const Group = require("../models/Group");
const Student = require("../models/Student");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

/**
 * Get all messages for a specific group
 * @route GET /api/chat/messages/:groupId
 */
exports.getMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    console.log(`\n📖 Retrieving messages from chat_History collection...`);
    console.log(`   Group: ${groupId}`);

    // Fetch messages for this group, sorted by creation date (oldest first)
    // Note: Group doesn't need to exist for messages to be retrieved
    const messages = await Message.find({ groupId })
      .populate("sender", "name email") // Populate sender details
      .populate("replyTo", "text senderName")
      .sort({ createdAt: 1 }) // Oldest messages first
      .lean();

    console.log(`✅ Retrieved ${messages.length} messages from chat_History\n`);

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

/**
 * Send a text message
 * @route POST /api/chat/message
 */
exports.sendMessage = async (req, res) => {
  try {
    const {
      groupId,
      senderId,
      senderName,
      profilePicture,
      text,
      replyTo,
      mentions,
    } = req.body;

    // Validate required fields
    if (!groupId || !senderId || !senderName) {
      return res.status(400).json({
        success: false,
        message: "Group ID, sender ID, and sender name are required",
      });
    }

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message text cannot be empty",
      });
    }

    // Create new message
    // Note: Group doesn't need to exist for messages to be created
    const newMessage = await Message.create({
      groupId,
      sender: senderId,
      senderName,
      profilePicture: profilePicture || null,
      text: text.trim(),
      replyTo: replyTo || null,
      mentions: Array.isArray(mentions) ? mentions : [],
    });

    // Populate sender details for response
    await newMessage.populate("sender", "name email");

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

/**
 * Upload a file and create a message with file attachment
 * @route POST /api/chat/upload
 * File is uploaded via multer middleware
 */
exports.uploadFile = async (req, res) => {
  try {
    console.log("=== File Upload Request ===");
    console.log("Body:", req.body);
    console.log(
      "File:",
      req.file
        ? {
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
          }
        : "NO FILE",
    );

    const { groupId, senderId, senderName, profilePicture, text } = req.body;
    const file = req.file;

    // Validate required fields
    if (!groupId || !senderId || !senderName) {
      console.error("Missing required fields:", {
        groupId: !!groupId,
        senderId: !!senderId,
        senderName: !!senderName,
      });
      // Clean up uploaded file if validation fails
      if (file) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Group ID, sender ID, and sender name are required",
      });
    }

    if (!file) {
      console.error("No file provided");
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Validate file was uploaded
    if (!file.filename || !file.path) {
      console.error("Invalid file object:", file);
      return res.status(400).json({
        success: false,
        message: "File upload failed - no filename",
      });
    }

    // Generate file URL (accessible via static route)
    const fileUrl = `/uploads/${file.filename}`;
    console.log("Generated fileUrl:", fileUrl);

    // Create message with file attachment
    // Note: Group doesn't need to exist for messages to be created
    console.log("\n📤 Saving file message to chat_History collection...");
    console.log(`   Sender: ${senderName}, Group: ${groupId}`);
    console.log(
      `   File: ${file.originalname} (${file.size} bytes, ${file.mimetype})`,
    );

    const newMessage = await Message.create({
      groupId,
      sender: senderId,
      senderName,
      profilePicture: profilePicture || null,
      text: text || "", // Optional caption text
      fileUrl,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
    });

    console.log(`✅ File message saved to chat_History!`);
    console.log(`   Message ID: ${newMessage._id}`);
    console.log(`   Collection: chat_History`);
    console.log(`   File URL: ${fileUrl}\n`);

    // Try to populate sender details, but don't fail if sender doesn't exist
    try {
      await newMessage.populate("sender", "name email");
    } catch (populateError) {
      // If population fails, just continue with the message
      // (sender might not exist in database for dummy data scenario)
      console.warn("Could not populate sender details:", populateError.message);
    }

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("=== ERROR UPLOADING FILE ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error("Could not delete file:", deleteError);
      }
    }
    res.status(500).json({
      success: false,
      message: "Failed to upload file",
      error: error.message,
    });
  }
};

/**
 * Get group details
 * @route GET /api/chat/group/:groupId
 */
exports.getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;

    console.log(`\n📋 Fetching group details for: ${groupId}`);

    const group = await Group.findById(groupId)
      .populate("members", "firstName lastName email userId")
      .populate("createdBy", "firstName lastName email");

    if (!group) {
      console.log(`⚠ Group not found: ${groupId}`);
      return res.status(200).json({
        success: true,
        message: "Group not found. Returning default group details.",
        data: {
          _id: groupId,
          title: "Group Chat",
          groupName: "Group Chat",
          members: [],
          description: "",
        },
      });
    }

    console.log(
      `✅ Found group: ${group.groupName} with ${group.members?.length || 0} members`,
    );

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error("Error fetching group details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch group details",
      error: error.message,
    });
  }
};

/**
 * Get all groups for a specific student
 * @route GET /api/chat/groups/:studentId
 */
exports.getStudentGroups = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Find all groups where the student is a member
    const groups = await Group.find({ members: studentId })
      .populate("members", "name email studentId")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    console.error("Error fetching student groups:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch groups",
      error: error.message,
    });
  }
};

// ========== ENHANCED CHAT FEATURES ==========

/**
 * Edit a message
 * @route PUT /api/chat/message/:messageId
 */
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text, senderId } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message text cannot be empty",
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only allow the sender to edit their message
    if (message.sender.toString() !== senderId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own messages",
      });
    }

    // Store edit history
    message.editHistory.push({
      originalText: message.text,
      editedText: text.trim(),
      editedAt: new Date(),
    });

    message.text = text.trim();
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error editing message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to edit message",
      error: error.message,
    });
  }
};

/**
 * Delete a message (soft delete)
 * @route DELETE /api/chat/message/:messageId
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Allow any group chat user to delete messages as requested by product behavior

    message.isDeleted = true;
    message.text = "[This message was deleted]";
    message.fileUrl = null;
    message.fileName = null;
    message.fileType = null;
    message.fileSize = null;
    message.reactions = [];
    message.mentions = [];
    message.replyTo = null;
    message.isEdited = false;
    message.editedAt = null;
    message.isForwarded = false;

    await message.save();

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message,
    });
  }
};

/**
 * Pin a message (max 3 per group)
 * @route POST /api/chat/message/:messageId/pin
 */
exports.pinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { groupId } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if already pinned
    if (message.isPinned) {
      return res.status(400).json({
        success: false,
        message: "Message is already pinned",
      });
    }

    // Check max 3 pinned messages per group
    const pinnedCount = await Message.countDocuments({
      groupId,
      isPinned: true,
    });

    if (pinnedCount >= 3) {
      return res.status(400).json({
        success: false,
        message: "Maximum 3 pinned messages allowed per group",
      });
    }

    message.isPinned = true;
    message.pinnedAt = new Date();

    await message.save();

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error pinning message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to pin message",
      error: error.message,
    });
  }
};

/**
 * Unpin a message
 * @route DELETE /api/chat/message/:messageId/pin
 */
exports.unpinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    message.isPinned = false;
    message.pinnedAt = null;

    await message.save();

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error unpinning message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unpin message",
      error: error.message,
    });
  }
};

/**
 * Star/Like a message
 * @route POST /api/chat/message/:messageId/star
 */
exports.starMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user already starred this message
    const alreadyStarred = message.starredBy.some(
      (star) => star.userId.toString() === userId,
    );

    if (alreadyStarred) {
      // Remove star if already starred
      message.starredBy = message.starredBy.filter(
        (star) => star.userId.toString() !== userId,
      );
    } else {
      // Add star
      message.starredBy.push({
        userId,
        starredAt: new Date(),
      });
    }

    await message.save();

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error starring message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to star message",
      error: error.message,
    });
  }
};

/**
 * Get pinned messages for a group
 * @route GET /api/chat/group/:groupId/pinned
 */
exports.getPinnedMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const pinnedMessages = await Message.find({
      groupId,
      isPinned: true,
      isDeleted: false,
    })
      .populate("sender", "name email")
      .sort({ pinnedAt: -1 });

    res.status(200).json({
      success: true,
      count: pinnedMessages.length,
      data: pinnedMessages,
    });
  } catch (error) {
    console.error("Error fetching pinned messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pinned messages",
      error: error.message,
    });
  }
};

/**
 * Send a reply to a message
 * @route POST /api/chat/message/reply/:replyToMessageId
 */
exports.replyToMessage = async (req, res) => {
  try {
    const { replyToMessageId } = req.params;
    const { groupId, senderId, senderName, text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message text cannot be empty",
      });
    }

    // Verify the message being replied to exists
    const originalMessage = await Message.findById(replyToMessageId);
    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        message: "Message to reply to not found",
      });
    }

    // Create the reply message
    const replyMessage = await Message.create({
      groupId,
      sender: senderId,
      senderName,
      text: text.trim(),
      replyTo: replyToMessageId,
    });

    await replyMessage.populate("sender", "name email");

    res.status(201).json({
      success: true,
      data: replyMessage,
    });
  } catch (error) {
    console.error("Error replying to message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reply to message",
      error: error.message,
    });
  }
};

/**
 * Forward a message to another group or to the same group
 * @route POST /api/chat/message/:messageId/forward
 */
exports.forwardMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { targetGroupId, senderId, senderName } = req.body;

    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Create forwarded message
    const forwardedMessage = await Message.create({
      groupId: targetGroupId,
      sender: senderId,
      senderName,
      text: originalMessage.text,
      fileUrl: originalMessage.fileUrl,
      fileName: originalMessage.fileName,
      fileType: originalMessage.fileType,
      fileSize: originalMessage.fileSize,
      isForwarded: true,
      forwardedFrom: {
        groupId: originalMessage.groupId,
        originalSenderId: originalMessage.sender,
        originalSenderName: originalMessage.senderName,
        originalMessageId: originalMessage._id,
      },
    });

    await forwardedMessage.populate("sender", "name email");

    res.status(201).json({
      success: true,
      data: forwardedMessage,
    });
  } catch (error) {
    console.error("Error forwarding message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to forward message",
      error: error.message,
    });
  }
};

/**
 * Get group members for mention autocomplete
 * @route GET /api/chat/group/:groupId/members
 */
exports.getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    console.log(`\n👥 Fetching group members for: ${groupId}`);

    const group = await Group.findById(groupId)
      .populate("members", "firstName lastName email userId")
      .select("members");

    if (!group) {
      console.log(`⚠ Group not found: ${groupId}`);
      return res.status(200).json({
        success: true,
        message: "Group not found. Returning empty members list.",
        count: 0,
        data: [],
      });
    }

    const normalizedMembers = group.members.map((member) => ({
      _id: member._id,
      firstName: member.firstName || "",
      lastName: member.lastName || "",
      name:
        `${member.firstName || ""} ${member.lastName || ""}`.trim() ||
        member.email ||
        "Member",
      email: member.email || "",
      userId: member.userId || "",
    }));

    console.log(`✅ Found ${normalizedMembers.length} members`);

    res.status(200).json({
      success: true,
      count: normalizedMembers.length,
      data: normalizedMembers,
    });
  } catch (error) {
    console.error("Error fetching group members:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch group members",
      error: error.message,
    });
  }
};

/**
 * Add or toggle emoji reaction to a message
 * @route POST /api/chat/message/:messageId/react
 */
exports.reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji, userId, userName } = req.body;

    if (!emoji || !userId || !userName) {
      return res.status(400).json({
        success: false,
        message: "Emoji, userId, and userName are required",
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user already reacted with this emoji
    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId && r.emoji === emoji,
    );

    if (existingReactionIndex >= 0) {
      // Remove reaction if already exists (toggle off)
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Add new reaction
      message.reactions.push({
        emoji,
        userId,
        userName,
        reactedAt: new Date(),
      });
    }

    await message.save();

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error reacting to message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to react to message",
      error: error.message,
    });
  }
};

/**
 * Get all groups
 * @route GET /api/chat/groups
 */
exports.getAllGroups = async (req, res) => {
  try {
    console.log("\n\ud83d\udccb Fetching all groups from database...");
    const groups = await Group.find({}).populate(
      "members",
      "firstName lastName",
    );
    console.log(`\u2705 Found ${groups.length} groups`);
    if (groups.length > 0) {
      console.log(
        `First group: "${groups[0].groupName}" with ${groups[0].members?.length || 0} members (ID: ${groups[0]._id})`,
      );
    }

    res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error("\u274c Error fetching all groups:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch groups",
      error: error.message,
    });
  }
};
/**
 * Update group details (name and/or profile picture)
 * @route PATCH /api/chat/group/:groupId
 */
exports.updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { groupName, profilePicture } = req.body;

    console.log(`\n📝 Updating group ${groupId}...`);

    // Build update object
    const updateData = {};
    if (groupName !== undefined) updateData.title = groupName;
    if (profilePicture !== undefined)
      updateData.profilePicture = profilePicture;

    // Update the group
    const updatedGroup = await Group.findByIdAndUpdate(groupId, updateData, {
      new: true,
      runValidators: true,
    }).populate("members", "firstName lastName email profilePicture");

    if (!updatedGroup) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    console.log(`✅ Group updated successfully`);

    res.status(200).json({
      success: true,
      data: updatedGroup,
    });
  } catch (error) {
    console.error("❌ Error updating group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update group",
      error: error.message,
    });
  }
};

/**
 * Clear all messages in a group
 * @route DELETE /api/chat/group/:groupId/messages
 */
exports.clearGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    console.log(`\n🗑️ Clearing all messages for group ${groupId}...`);

    // Delete all messages for this group
    const result = await Message.deleteMany({ groupId });

    console.log(`✅ Cleared ${result.deletedCount} messages`);

    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} messages`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ Error clearing messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear messages",
      error: error.message,
    });
  }
};

/**
 * Remove a member from a group
 * @route DELETE /api/chat/group/:groupId/member/:memberId
 */
exports.leaveGroup = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;

    console.log(`\n🚪 Removing member ${memberId} from group ${groupId}...`);

    if (!groupId || !memberId || memberId === "null") {
      return res.status(400).json({
        success: false,
        message: "Valid groupId and memberId are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(groupId) ||
      !mongoose.Types.ObjectId.isValid(memberId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid groupId or memberId format",
      });
    }

    // Remove member from group
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: memberId } },
      { new: true },
    ).populate("members", "firstName lastName email profilePicture");

    if (!updatedGroup) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    console.log(`✅ Member removed from group`);

    res.status(200).json({
      success: true,
      message: "Successfully left the group",
      data: updatedGroup,
    });
  } catch (error) {
    console.error("❌ Error leaving group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to leave group",
      error: error.message,
    });
  }
};
