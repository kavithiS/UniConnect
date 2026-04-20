const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  getMessages,
  sendMessage,
  uploadFile,
  getGroupDetails,
  getStudentGroups,
  getAllGroups,
  editMessage,
  deleteMessage,
  pinMessage,
  unpinMessage,
  starMessage,
  getPinnedMessages,
  replyToMessage,
  forwardMessage,
  getGroupMembers,
  reactToMessage,
  updateGroup,
  clearGroupMessages,
  leaveGroup,
} = require("../controllers/chatController");

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save to uploads folder
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

/**
 * File Filter - Accept only specific file types
 * Allowed: Images, PDF, DOC/DOCX, ZIP/RAR/7Z
 */
const fileFilter = (req, file, cb) => {
  const normalizedMimeType = (file.mimetype || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  const normalizedFileName = String(file.originalname || "").toLowerCase();

  const allowedMimeTypes = new Set([
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/zip", // .zip
    "application/x-zip-compressed", // .zip (windows variants)
    "application/x-rar-compressed", // .rar
    "application/vnd.rar", // .rar
    "application/x-7z-compressed", // .7z
  ]);
  const allowedExtensions = new Set([
    ".pdf",
    ".doc",
    ".docx",
    ".zip",
    ".rar",
    ".7z",
    ".jpg",
    ".jpeg",
    ".png",
  ]);

  const isAllowedImage = normalizedMimeType.startsWith("image/");
  const isAllowedByMime = allowedMimeTypes.has(normalizedMimeType);
  const isAllowedByExtension = [...allowedExtensions].some((ext) =>
    normalizedFileName.endsWith(ext),
  );

  if (isAllowedImage || isAllowedByMime || isAllowedByExtension) {
    cb(null, true); // Accept file
  } else {
    cb(
      new Error(
        `Invalid file type (${file.mimetype || "unknown"}). Allowed: .zip, .rar, .7z, .pdf, .doc, .docx, .jpg, .png.`,
      ),
      false,
    );
  }
};

/**
 * Multer Upload Configuration
 * Max file size: 10MB
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: fileFilter,
});

/**
 * CHAT ROUTES
 */

// Get chat history for a group (required endpoint)
// @route GET /api/chat/history/:groupId
router.get("/history/:groupId", getMessages);

// Get all messages for a group
// @route GET /api/chat/messages/:groupId
router.get("/messages/:groupId", getMessages);

// Send a text message
// @route POST /api/chat/message
router.post("/message", sendMessage);

// Upload file and send message
// @route POST /api/chat/upload
// Multer middleware handles file upload
router.post(
  "/upload",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return res.status(413).json({
          success: false,
          message: `File upload error: ${err.message}`,
          error: err.message,
        });
      } else if (err) {
        console.error("File upload error:", err);
        return res.status(400).json({
          success: false,
          message: `Upload failed: ${err.message}`,
          error: err.message,
        });
      }
      next();
    });
  },
  uploadFile,
);

// Get group details
// @route GET /api/chat/group/:groupId
router.get("/group/:groupId", getGroupDetails);

// Get all groups for a student
// @route GET /api/chat/student-groups/:studentId
router.get("/student-groups/:studentId", getStudentGroups);

// Get all groups
// @route GET /api/chat/groups
router.get("/groups", getAllGroups);

// ========== ENHANCED FEATURES ==========

// Edit a message
// @route PUT /api/chat/message/:messageId
router.put("/message/:messageId", editMessage);

// Delete a message
// @route DELETE /api/chat/message/:messageId
router.delete("/message/:messageId", deleteMessage);

// Pin a message
// @route POST /api/chat/message/:messageId/pin
router.post("/message/:messageId/pin", pinMessage);

// Unpin a message
// @route DELETE /api/chat/message/:messageId/pin
router.delete("/message/:messageId/pin", unpinMessage);

// Star/Like a message
// @route POST /api/chat/message/:messageId/star
router.post("/message/:messageId/star", starMessage);

// Get pinned messages for a group
// @route GET /api/chat/group/:groupId/pinned
router.get("/group/:groupId/pinned", getPinnedMessages);

// Reply to a message
// @route POST /api/chat/message/reply/:replyToMessageId
router.post("/message/reply/:replyToMessageId", replyToMessage);

// Forward a message
// @route POST /api/chat/message/:messageId/forward
router.post("/message/:messageId/forward", forwardMessage);

// Get group members for mention autocomplete
// @route GET /api/chat/group/:groupId/members
router.get("/group/:groupId/members", getGroupMembers);

// React to a message with emoji
// @route POST /api/chat/message/:messageId/react
router.post("/message/:messageId/react", reactToMessage);

// Update group details
// @route PATCH /api/chat/group/:groupId
router.patch("/group/:groupId", updateGroup);

// Clear all messages in a group
// @route DELETE /api/chat/group/:groupId/messages
router.delete("/group/:groupId/messages", clearGroupMessages);

// Leave a group
// @route DELETE /api/chat/group/:groupId/member/:memberId
router.delete("/group/:groupId/member/:memberId", leaveGroup);

module.exports = router;
