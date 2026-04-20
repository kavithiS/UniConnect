import axios from "axios";
import { getApiBaseUrl, getBackendBaseUrl } from "../utils/backendUrl";

/**
 * Chat Service
 * Handles all HTTP requests related to chat functionality
 * Base URL: http://localhost:5000/api/chat
 */

const getChatApiBaseUrl = () => `${getApiBaseUrl()}/chat`;
const getFileBaseUrl = () => getBackendBaseUrl();

// Backward-compatible export used by existing chat components.
// It resolves once at module load, which is fine for current usage.
export const FILE_BASE_URL = getBackendBaseUrl();

/**
 * Get all messages for a specific group
 * @param {string} groupId - The ID of the group
 * @returns {Promise} - Array of messages
 */
export const getMessages = async (groupId) => {
  try {
    const response = await axios.get(
      `${getChatApiBaseUrl()}/history/${groupId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

/**
 * Send a text message (via HTTP - for fallback or initial send)
 * @param {Object} messageData - { groupId, senderId, senderName, text }
 * @returns {Promise} - Created message
 */
export const sendMessage = async (messageData) => {
  try {
    const response = await axios.post(
      `${getChatApiBaseUrl()}/message`,
      messageData,
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Upload a file and create a message
 * @param {Object} uploadData - { groupId, senderId, senderName, profilePicture, text, file }
 * @returns {Promise} - Created message with file
 */
export const uploadFile = async (uploadData) => {
  try {
    const formData = new FormData();
    formData.append("groupId", uploadData.groupId);
    formData.append("senderId", uploadData.senderId);
    formData.append("senderName", uploadData.senderName);
    if (uploadData.profilePicture) {
      formData.append("profilePicture", uploadData.profilePicture);
    }
    if (uploadData.text) {
      formData.append("text", uploadData.text);
    }
    if (uploadData.replyTo) {
      formData.append("replyTo", JSON.stringify(uploadData.replyTo));
    }
    formData.append("file", uploadData.file);

    const response = await axios.post(
      `${getChatApiBaseUrl()}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

/**
 * Get group details
 * @param {string} groupId - The ID of the group
 * @returns {Promise} - Group details with members
 */
export const getGroupDetails = async (groupId) => {
  try {
    const response = await axios.get(`${getChatApiBaseUrl()}/group/${groupId}`);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      console.warn("Group not found. Using default fallback group details.");
    } else {
      console.error("Error fetching group details:", error);
    }
    throw error;
  }
};

/**
 * Get all groups for a student
 * @param {string} studentId - The ID of the student
 * @returns {Promise} - Array of groups
 */
export const getStudentGroups = async (studentId) => {
  try {
    const response = await axios.get(
      `${getChatApiBaseUrl()}/student-groups/${studentId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student groups:", error);
    throw error;
  }
};

/**
 * Get file URL for download/display
 * @param {string} fileUrl - Relative file path from server
 * @returns {string} - Full URL to file
 */
export const getFileUrl = (fileUrl) => {
  if (!fileUrl) return "";
  return `${getFileBaseUrl()}${fileUrl}`;
};

/**
 * Download file
 * @param {string} fileUrl - Relative file path
 * @param {string} fileName - Original file name
 */
export const downloadFile = (fileUrl, fileName) => {
  const fullUrl = getFileUrl(fileUrl);
  const link = document.createElement("a");
  link.href = fullUrl;
  link.download = fileName || "download";
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/**
 * Edit a message
 * @param {string} messageId - The ID of the message to edit
 * @param {string} text - The new message text
 * @param {string} senderId - The ID of the sender (for authorization)
 * @returns {Promise} - Updated message
 */
export const editMessage = async (messageId, text, senderId) => {
  try {
    const response = await axios.put(
      `${getChatApiBaseUrl()}/message/${messageId}`,
      {
        text,
        senderId,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error editing message:", error);
    throw error;
  }
};

/**
 * Delete a message
 * @param {string} messageId - The ID of the message to delete
 * @param {string} senderId - The ID of the sender (for authorization)
 * @returns {Promise}
 */
export const deleteMessage = async (messageId, senderId) => {
  try {
    const response = await axios.delete(
      `${getChatApiBaseUrl()}/message/${messageId}`,
      {
        data: { senderId },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

/**
 * Pin a message
 * @param {string} messageId - The ID of the message to pin
 * @param {string} groupId - The ID of the group
 * @returns {Promise} - Updated message
 */
export const pinMessage = async (messageId, groupId) => {
  try {
    const response = await axios.post(
      `${getChatApiBaseUrl()}/message/${messageId}/pin`,
      {
        groupId,
      },
    );
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      console.warn("Message not found in DB. Using local pin fallback.");
    } else {
      console.error("Error pinning message:", error);
    }
    throw error;
  }
};

/**
 * Unpin a message
 * @param {string} messageId - The ID of the message to unpin
 * @returns {Promise} - Updated message
 */
export const unpinMessage = async (messageId) => {
  try {
    const response = await axios.delete(
      `${getChatApiBaseUrl()}/message/${messageId}/pin`,
    );
    return response.data;
  } catch (error) {
    console.error("Error unpinning message:", error);
    throw error;
  }
};

/**
 * Star/Like a message
 * @param {string} messageId - The ID of the message to star
 * @param {string} userId - The ID of the user starring the message
 * @returns {Promise} - Updated message
 */
export const starMessage = async (messageId, userId) => {
  try {
    const response = await axios.post(
      `${getChatApiBaseUrl()}/message/${messageId}/star`,
      {
        userId,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error starring message:", error);
    throw error;
  }
};

/**
 * Get pinned messages for a group
 * @param {string} groupId - The ID of the group
 * @returns {Promise} - Array of pinned messages
 */
export const getPinnedMessages = async (groupId) => {
  try {
    const response = await axios.get(
      `${getChatApiBaseUrl()}/group/${groupId}/pinned`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching pinned messages:", error);
    throw error;
  }
};

/**
 * Reply to a message
 * @param {string} replyToMessageId - The ID of the message being replied to
 * @param {Object} replyData - { groupId, senderId, senderName, text }
 * @returns {Promise} - Created reply message
 */
export const replyToMessage = async (replyToMessageId, replyData) => {
  try {
    const response = await axios.post(
      `${getChatApiBaseUrl()}/message/reply/${replyToMessageId}`,
      replyData,
    );
    return response.data;
  } catch (error) {
    console.error("Error replying to message:", error);
    throw error;
  }
};

/**
 * Forward a message to another group
 * @param {string} messageId - The ID of the message to forward
 * @param {Object} forwardData - { targetGroupId, senderId, senderName }
 * @returns {Promise} - Created forwarded message
 */
export const forwardMessage = async (messageId, forwardData) => {
  try {
    const response = await axios.post(
      `${getChatApiBaseUrl()}/message/${messageId}/forward`,
      forwardData,
    );
    return response.data;
  } catch (error) {
    console.error("Error forwarding message:", error);
    throw error;
  }
};

/**
 * Get group members for mention autocomplete
 * @param {string} groupId - The ID of the group
 * @returns {Promise} - Array of group members
 */
export const getGroupMembers = async (groupId) => {
  try {
    const response = await axios.get(
      `${getChatApiBaseUrl()}/group/${groupId}/members`,
    );
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      console.warn("Group members not found. Using empty list fallback.");
    } else {
      console.error("Error fetching group members:", error);
    }
    throw error;
  }
};

/**
 * React to a message with emoji
 * @param {string} messageId - The ID of the message to react to
 * @param {Object} reactionData - { emoji, userId, userName }
 * @returns {Promise} - Updated message with reactions
 */
export const reactToMessage = async (messageId, reactionData) => {
  try {
    const response = await axios.post(
      `${getChatApiBaseUrl()}/message/${messageId}/react`,
      reactionData,
    );
    return response.data;
  } catch (error) {
    console.error("Error reacting to message:", error);
    throw error;
  }
};

/**
 * Get all groups
 * @returns {Promise} - Array of all groups
 */
export const getAllGroups = async () => {
  try {
    const response = await axios.get(`${getChatApiBaseUrl()}/groups`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all groups:", error);
    throw error;
  }
};

/**
 * Update group details (name and/or profile picture)
 * @param {string} groupId - The ID of the group
 * @param {Object} updateData - { groupName?, profilePicture? }
 * @returns {Promise} - Updated group details
 */
export const updateGroup = async (groupId, updateData) => {
  try {
    const response = await axios.patch(
      `${getChatApiBaseUrl()}/group/${groupId}`,
      updateData,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating group:", error);
    throw error;
  }
};

/**
 * Clear all messages in a group
 * @param {string} groupId - The ID of the group
 * @returns {Promise} - Success message
 */
export const clearGroupMessages = async (groupId) => {
  try {
    const response = await axios.delete(
      `${getChatApiBaseUrl()}/group/${groupId}/messages`,
    );
    return response.data;
  } catch (error) {
    console.error("Error clearing group messages:", error);
    throw error;
  }
};

/**
 * Leave a group (remove member from group)
 * @param {string} groupId - The ID of the group
 * @param {string} memberId - The ID of the member to remove
 * @returns {Promise} - Updated group details
 */
export const leaveGroup = async (groupId, memberId) => {
  try {
    const response = await axios.delete(
      `${getChatApiBaseUrl()}/group/${groupId}/member/${memberId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error leaving group:", error);
    throw error;
  }
};
