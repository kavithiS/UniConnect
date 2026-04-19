import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { io } from "socket.io-client";
import {
  getMessages,
  getGroupDetails,
  uploadFile,
  editMessage,
  deleteMessage,
  pinMessage,
  unpinMessage,
  starMessage,
  getPinnedMessages,
  forwardMessage,
  getGroupMembers,
  reactToMessage,
  getStudentGroups,
  updateGroup,
  clearGroupMessages,
  leaveGroup,
} from "../../services/chatService";
import { getBackendBaseUrl } from "../../utils/backendUrl";
import { getMockGroupById, isMockGroupId } from "../../data/mockGroups";
import studentService from "../../services/studentService";
import {
  FaPaperPlane,
  FaPaperclip,
  FaUsers,
  FaTimes,
  FaShare,
  FaTrash,
  FaSmile,
  FaMicrophone,
  FaStop,
  FaPause,
  FaPlay,
} from "react-icons/fa";
import {
  MessageContextMenu,
  MessageItem,
  MentionDropdown,
  EmojiPicker,
  EmojiReactionPicker,
  RemoveReactionPopup,
  GroupDetailsPanel,
} from "../../components/chat_area_components";

// Socket.IO connection
const socket = io(getBackendBaseUrl());

const getMessageIdentity = (message) => {
  if (!message) return "";
  if (message._id) return String(message._id);
  if (message.clientMessageId) return String(message.clientMessageId);
  return "";
};

const mergeMessages = (baseMessages, incomingMessages) => {
  const merged = [...baseMessages];

  incomingMessages.forEach((incoming) => {
    const incomingId = getMessageIdentity(incoming);
    const existingIndex = merged.findIndex((existing) => {
      if (incoming._id && existing._id) {
        return String(existing._id) === String(incoming._id);
      }

      if (incoming.clientMessageId && existing.clientMessageId) {
        return existing.clientMessageId === incoming.clientMessageId;
      }

      return (
        getMessageIdentity(existing) !== "" &&
        getMessageIdentity(existing) === incomingId
      );
    });

    if (existingIndex >= 0) {
      merged[existingIndex] = { ...merged[existingIndex], ...incoming };
    } else {
      merged.push(incoming);
    }
  });

  return merged.sort(
    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
  );
};

const GroupChat = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const previewGroupIdFromQuery = searchParams.get("groupId");
  const isEmbeddedMobilePreview = searchParams.get("preview") === "mobile";
  const screenHeightClass = isEmbeddedMobilePreview
    ? "h-full min-h-0"
    : "h-screen";
  const chatHorizontalPadding = isEmbeddedMobilePreview ? "px-3" : "px-6";

  const handleClosePreviewFrame = () => {
    if (!isEmbeddedMobilePreview) return;
    globalThis.parent?.postMessage(
      { type: "close-group-chat-preview" },
      globalThis.location.origin,
    );
  };
  // Get current user from localStorage (set by StudentProfile)
  const storedFirstName = localStorage.getItem("userFirstName") || "John";
  const storedLastName = localStorage.getItem("userLastName") || "Smith";
  // do NOT default to an invalid id like 'S001' — prefer null so code validates correctly
  const storedUserId = localStorage.getItem("userId") || null;
  const storedProfilePicture = localStorage.getItem("userProfilePicture");

  // Dynamically load group ID from database instead of hardcoding
  const [groupId, setGroupId] = useState(null);
  const [senderId, setSenderId] = useState(null);
  const [senderName, setSenderName] = useState(null);
  const [senderProfilePicture, setSenderProfilePicture] =
    useState(storedProfilePicture);

  const [groupDetails, setGroupDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [typing, setTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ========== NEW FEATURES STATES ==========
  const [replyingTo, setReplyingTo] = useState(null); // Message being replied to
  const [editingMessage, setEditingMessage] = useState(null); // Message being edited
  const [contextMenu, setContextMenu] = useState(null); // Context menu position
  const [groupMembers, setGroupMembers] = useState([]); // Group members for mentions
  const [mentions, setMentions] = useState([]); // Currently mentioned users
  const [showMentionDropdown, setShowMentionDropdown] = useState(false); // Mention dropdown visibility
  const [mentionPosition, setMentionPosition] = useState({ x: 0, y: 0 }); // Mention dropdown position
  const [pinnedMessages, setPinnedMessages] = useState([]); // Pinned messages in group
  const [showPinnedPanel, setShowPinnedPanel] = useState(false); // Show/hide pinned panel
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [messagesToForward, setMessagesToForward] = useState([]);
  const [forwardTargetType, setForwardTargetType] = useState("same");
  const [forwardTargetGroupId, setForwardTargetGroupId] = useState("");
  const [isForwarding, setIsForwarding] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Emoji picker for input
  const [showReactionPicker, setShowReactionPicker] = useState(null); // Quick reaction picker for messages
  const [showRemoveReactionPopup, setShowRemoveReactionPopup] = useState(null); // Remove reaction popup
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedAudioFile, setRecordedAudioFile] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showGroupDetails, setShowGroupDetails] = useState(false); // Group details panel
  const [noGroupsAvailable, setNoGroupsAvailable] = useState(false); // Flag when no groups exist
  const [chatSelectionNonce, setChatSelectionNonce] = useState(0);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingControlsRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const autoSendAfterStopRef = useRef(false);
  const activeGroupRef = useRef(null);

  const clearGroupChatCache = (targetGroupId) => {
    if (!targetGroupId) return;
    localStorage.removeItem(`chat_messages_${targetGroupId}`);
    localStorage.removeItem(`hidden_messages_${targetGroupId}`);
    localStorage.removeItem(`removed_messages_${targetGroupId}`);
    localStorage.removeItem(`pinned_messages_${targetGroupId}`);
  };

  const resetGroupViewAfterLeave = (targetGroupId) => {
    clearGroupChatCache(targetGroupId);
    localStorage.removeItem("activeGroupId");
    if (targetGroupId) {
      socket.emit("leave_group", { groupId: targetGroupId });
    }
    window.dispatchEvent(new Event("group-membership-changed"));
    setGroupId(null);
    setGroupDetails(null);
    setMessages([]);
    setPinnedMessages([]);
    setGroupMembers([]);
    setMentions([]);
    setSelectedMessageIds([]);
    setMessagesToForward([]);
    setForwardTargetGroupId("");
    setTyping(false);
    setReplyingTo(null);
    setEditingMessage(null);
    setContextMenu(null);
    setShowMentionDropdown(false);
    setShowPinnedPanel(false);
    setSelectionMode(false);
    setShowForwardDialog(false);
    setShowDeleteDialog(false);
    setMessageToDelete(null);
    setShowBulkDeleteDialog(false);
    setShowEmojiPicker(false);
    setShowReactionPicker(null);
    setShowRemoveReactionPopup(null);
    setIsRecording(false);
    setIsPaused(false);
    setRecordedAudioFile(null);
    setRecordingDuration(0);
    setShowGroupDetails(false);
    setError(null);
    setNoGroupsAvailable(false);
  };

  useEffect(() => {
    if (!previewGroupIdFromQuery) {
      return;
    }

    localStorage.setItem("activeGroupId", previewGroupIdFromQuery);
    setGroupId(previewGroupIdFromQuery);
    setNoGroupsAvailable(false);
    setError(null);
    setIsLoading(true);
    setChatSelectionNonce((current) => current + 1);
  }, [previewGroupIdFromQuery]);

  useEffect(() => {
    if (recordedAudioFile && autoSendAfterStopRef.current) {
      autoSendAfterStopRef.current = false;
      handleSendRecordedVoiceMessage();
    }
  }, [recordedAudioFile]);

  useEffect(() => {
    if (isRecording && recordingControlsRef.current) {
      recordingControlsRef.current.focus();
    }
  }, [isRecording]);

  useEffect(() => {
    const handleGroupChatSelected = (event) => {
      const selectedGroupId = event?.detail?.groupId;

      if (!selectedGroupId) {
        return;
      }

      const previousGroupId = activeGroupRef.current;
      if (previousGroupId && previousGroupId !== selectedGroupId) {
        socket.emit("leave_group", { groupId: previousGroupId });
      }

      // Reset group-scoped UI state before hydrating the newly selected group.
      setMessages([]);
      setPinnedMessages([]);
      setGroupMembers([]);
      setTyping(false);
      setReplyingTo(null);
      setEditingMessage(null);
      setContextMenu(null);
      setSelectedMessageIds([]);
      setSelectionMode(false);

      localStorage.setItem("activeGroupId", selectedGroupId);
      setGroupId(selectedGroupId);
      setNoGroupsAvailable(false);
      setError(null);
      setIsLoading(true);
      setChatSelectionNonce((current) => current + 1);
    };

    window.addEventListener("group-chat-selected", handleGroupChatSelected);

    return () => {
      window.removeEventListener(
        "group-chat-selected",
        handleGroupChatSelected,
      );
    };
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // First try to fetch all students and find the current user
        const response = await studentService.getAllStudents();
        const students = response.data || [];

        if (students.length > 0) {
          // For now, use the first student (or find by userId from localStorage)
          // Try to match by _id or by a legacy userId field, otherwise fallback to first student
          const currentUser =
            students.find(
              (s) =>
                (s._id && s._id.toString() === storedUserId) ||
                (s.userId && s.userId === storedUserId),
            ) || students[0];

          setSenderId(currentUser._id);
          setSenderName(`${currentUser.firstName} ${currentUser.lastName}`);

          if (currentUser.profilePicture) {
            setSenderProfilePicture(currentUser.profilePicture);
          }

          console.log(
            "✓ Loaded current user for chat:",
            currentUser.firstName,
            currentUser.lastName,
          );
        }
      } catch (err) {
        console.warn(
          "Could not fetch current user, using localStorage data:",
          err.message,
        );
        // Fallback to using just the localStorage values
        setSenderName(`${storedFirstName} ${storedLastName}`);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true);

        // Step 1: Resolve selected group from active selection or current user's groups.
        const preferredGroupId = localStorage.getItem("activeGroupId");
        let selectedGroupId = groupId;
        const currentStudentId = senderId || storedUserId;
        if (!selectedGroupId) {
          if (currentStudentId) {
            try {
              const groupsResponse = await getStudentGroups(currentStudentId);
              const userGroups = groupsResponse.data || [];

              if (userGroups.length > 0) {
                const hasPreferredGroup =
                  preferredGroupId &&
                  userGroups.some((group) => group._id === preferredGroupId);

                selectedGroupId = hasPreferredGroup
                  ? preferredGroupId
                  : userGroups[0]._id;
                localStorage.setItem("activeGroupId", selectedGroupId);
              } else if (preferredGroupId) {
                // For newly created groups that might not list creator in members yet.
                selectedGroupId = preferredGroupId;
              } else {
                console.warn("⚠ No joined group(s) found for current user");
                setNoGroupsAvailable(true);
                setError(null);
                setIsLoading(false);
                return;
              }
            } catch (groupsFetchErr) {
              console.error("❌ Failed to fetch user groups:", groupsFetchErr);
              setError(
                "Failed to load your group(s): " + groupsFetchErr.message,
              );
              setIsLoading(false);
              return;
            }
          } else if (preferredGroupId) {
            selectedGroupId = preferredGroupId;
          } else {
            // Wait for sender identity to be resolved before deciding no groups are available.
            setIsLoading(true);
            return;
          }

          if (selectedGroupId) {
            setGroupId(selectedGroupId);
            setNoGroupsAvailable(false);
            console.log("✓ Using selected group ID:", selectedGroupId);
          }
        }

        // Step 2: Leave previous room and switch active group context.
        const previousGroupId = activeGroupRef.current;
        if (previousGroupId && previousGroupId !== selectedGroupId) {
          socket.emit("leave_group", { groupId: previousGroupId });
        }
        activeGroupRef.current = selectedGroupId;

        // Step 3: Fetch detailed group info with members
        try {
          if (isMockGroupId(selectedGroupId)) {
            const mockGroup = getMockGroupById(selectedGroupId);
            if (mockGroup) {
              setGroupDetails({
                ...mockGroup,
                groupName: mockGroup.groupName || mockGroup.title,
              });
              setGroupMembers(mockGroup.members || []);
              setPinnedMessages([]);
              setMessages([]);
              setIsLoading(false);
              return;
            }
          }

          const groupResponse = await getGroupDetails(selectedGroupId);
          // Backend: { success: true, data: { groupName, members: [...], ... } }
          // Service returns response.data = { success: true, data: {...} }
          // So we need: groupResponse.data = { groupName, members, ... }
          const groupData = groupResponse.data || {};
          setGroupDetails(groupData);
          console.log(
            "✅ Loaded group:",
            groupData.groupName || "Unknown",
            "with",
            groupData.members?.length || 0,
            "members",
          );
        } catch (groupErr) {
          console.error("❌ Could not fetch group details:", groupErr);
          setGroupDetails({
            groupName: "Group Chat",
            members: [],
            description: "",
          });
        }

        // Step 4: Fetch group members for mentions
        try {
          const membersResponse = await getGroupMembers(selectedGroupId);
          // Backend: { success: true, count: X, data: [...members...] }
          // Service returns response.data, so we need: membersResponse.data
          const membersData = membersResponse.data || [];
          setGroupMembers(membersData);
          console.log("✅ Loaded", membersData.length, "members for mentions");
        } catch (membersErr) {
          console.warn("⚠ Could not fetch group members:", membersErr.message);
        }

        // Step 5: Fetch pinned messages
        try {
          const pinnedResponse = await getPinnedMessages(selectedGroupId);
          const pinnedData = pinnedResponse.data || [];
          setPinnedMessages(pinnedData);
        } catch (pinnedErr) {
          console.warn("⚠ Could not fetch pinned messages:", pinnedErr.message);
        }

        // Step 6: Fetch existing messages
        try {
          const messagesResponse = await getMessages(selectedGroupId);
          // Backend: { success: true, count: X, data: [...messages...] }
          const fetchedMessages = messagesResponse.data || [];

          // Load hidden messages from localStorage
          const hiddenMessages = JSON.parse(
            localStorage.getItem(`hidden_messages_${selectedGroupId}`) || "[]",
          );

          // Load completely removed messages from localStorage
          const removedMessages = JSON.parse(
            localStorage.getItem(`removed_messages_${selectedGroupId}`) || "[]",
          );

          // If we got real messages from server, use them instead of dummy
          if (Array.isArray(fetchedMessages) && fetchedMessages.length > 0) {
            // Filter out completely removed messages and mark hidden ones
            const messagesWithHidden = fetchedMessages
              .filter((msg) => !removedMessages.includes(msg._id))
              .map((msg) =>
                hiddenMessages.includes(msg._id)
                  ? { ...msg, deletedForMe: true }
                  : msg,
              );
            // Replace state during hydration so only this group's messages are shown.
            setMessages(messagesWithHidden);
          } else {
            setMessages([]);
          }
        } catch (messagesErr) {
          console.warn("⚠ Could not fetch messages:", messagesErr.message);
          setMessages([]);
        }

        // Step 7: Join socket room for this group
        if (selectedGroupId) {
          socket.emit("join_group", { groupId: selectedGroupId });
          console.log("✅ Joined socket room for group:", selectedGroupId);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing chat:", err);
        setError("Connection issue. Make sure backend is running on port 5000");
        setIsLoading(false);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [groupId, chatSelectionNonce, senderId, storedUserId]);

  /**
   * Socket.IO: Listen for incoming messages
   */
  useEffect(() => {
    socket.on("receive_message", (message) => {
      if (!message || String(message.groupId) !== String(groupId)) {
        return;
      }

      setMessages((prevMessages) => {
        // Check 1: Exact ID match (for duplicate server messages)
        const messageExists = prevMessages.some(
          (msg) => msg._id === message._id,
        );
        if (messageExists) {
          return prevMessages;
        }

        // Check 2: Match by clientMessageId (for replacing optimistic messages)
        // This is the PRIMARY deduplication method
        if (message.clientMessageId) {
          const optimisticIndex = prevMessages.findIndex(
            (msg) => msg.clientMessageId === message.clientMessageId,
          );

          if (optimisticIndex !== -1) {
            // Found the optimistic message - replace it with the real one
            const updatedMessages = [...prevMessages];
            updatedMessages[optimisticIndex] = message; // Replace temp with real message

            return updatedMessages;
          }
        }

        // Otherwise, add as new message
        return [...prevMessages, message];
      });
    });

    socket.on("user_typing", (data) => {
      if (data.senderName !== senderName) {
        setTyping(true);
      }
    });

    socket.on("user_stop_typing", () => {
      setTyping(false);
    });

    socket.on("reaction_added", (data) => {
      // Update message with new reaction
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === data.messageId
            ? {
                ...msg,
                reactions: data.updatedReactions || msg.reactions,
              }
            : msg,
        ),
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      socket.off("reaction_added");
    };
  }, [senderName, groupId]);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  // ========== FUNCTIONS ==========

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * Handle typing indicator
   */
  const handleTyping = () => {
    socket.emit("typing", { groupId, senderName });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { groupId });
    }, 2000);
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setRecordedAudioFile(null);
      setSelectedFile(file);
    }
  };

  /**
   * Upload file and send message
   */
  const handleFileUpload = async () => {
    if (!selectedFile) return;

    // Make sure user data is loaded before sending
    if (!senderId || !senderName) {
      console.warn("User data not loaded yet. Please wait...");
      return;
    }

    try {
      setIsSending(true);

      const uploadData = {
        groupId,
        senderId,
        senderName,
        profilePicture: senderProfilePicture,
        text: messageText.trim(), // Optional caption
        file: selectedFile,
      };

      const response = await uploadFile(uploadData);
      const fileMessage = response.data;

      // Optimistic UI update - add file message immediately
      const optimisticFileMessage = {
        ...fileMessage,
        _id: fileMessage._id || `temp-${Date.now()}`,
        createdAt: fileMessage.createdAt || new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, optimisticFileMessage]);

      // Broadcast file message to all group members via socket
      socket.emit("send_file", {
        groupId,
        message: fileMessage,
      });

      // Clear inputs
      setMessageText("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setIsSending(false);
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Failed to upload file");
      setIsSending(false);
    }
  };

  /**
   * Cancel file selection
   */
  const handleCancelFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const handleStartVoiceRecording = async () => {
    if (isRecording || isSending) return;

    if (!navigator.mediaDevices || typeof MediaRecorder === "undefined") {
      alert("Voice recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ];

      const supportedMimeType = preferredMimeTypes.find((mimeType) =>
        MediaRecorder.isTypeSupported(mimeType),
      );

      const mediaRecorder = supportedMimeType
        ? new MediaRecorder(stream, { mimeType: supportedMimeType })
        : new MediaRecorder(stream);

      recordedChunksRef.current = [];
      setRecordedAudioFile(null);
      setSelectedFile(null);
      setRecordingDuration(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const chunks = recordedChunksRef.current;
        if (chunks.length > 0) {
          const mimeType = chunks[0].type || supportedMimeType || "audio/webm";
          const normalizedMimeType = mimeType.split(";")[0].toLowerCase();
          let extension = "webm";
          if (normalizedMimeType.includes("mpeg")) {
            extension = "mp3";
          } else if (normalizedMimeType.includes("mp4")) {
            extension = "m4a";
          } else if (normalizedMimeType.includes("wav")) {
            extension = "wav";
          } else if (normalizedMimeType.includes("ogg")) {
            extension = "ogg";
          }

          const voiceBlob = new Blob(chunks, { type: mimeType });
          const voiceFile = new File(
            [voiceBlob],
            `voice-note-${Date.now()}.${extension}`,
            { type: mimeType },
          );

          setRecordedAudioFile(voiceFile);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Could not start voice recording:", err);
      alert("Microphone access was denied or unavailable.");
    }
  };

  const handlePauseVoiceRecording = () => {
    if (!isRecording || !mediaRecorderRef.current || isPaused) return;

    if (mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      stopRecordingTimer();
      setIsPaused(true);
    }
  };

  const handleResumeVoiceRecording = () => {
    if (!isRecording || !mediaRecorderRef.current || !isPaused) return;

    if (mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      setIsPaused(false);
    }
  };

  const handleStopVoiceRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;

    stopRecordingTimer();
    setIsRecording(false);
    setIsPaused(false);

    if (mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleDeleteVoiceRecording = () => {
    if (isRecording && mediaRecorderRef.current?.state !== "inactive") {
      const stream = mediaRecorderRef.current.stream;
      mediaRecorderRef.current.stop();
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }

    stopRecordingTimer();
    setIsRecording(false);
    setIsPaused(false);
    setRecordingDuration(0);
    setRecordedAudioFile(null);
    recordedChunksRef.current = [];
  };

  const handleCancelVoiceRecording = () => {
    setRecordedAudioFile(null);
    recordedChunksRef.current = [];
  };

  const handleSendRecordedVoiceMessage = async () => {
    if (!recordedAudioFile) return;

    if (!senderId || !senderName) {
      console.warn("User data not loaded yet. Please wait...");
      return;
    }

    try {
      setIsSending(true);

      const uploadData = {
        groupId,
        senderId,
        senderName,
        profilePicture: senderProfilePicture,
        text: messageText.trim(),
        file: recordedAudioFile,
      };

      const response = await uploadFile(uploadData);
      const voiceMessage = response.data;

      const optimisticVoiceMessage = {
        ...voiceMessage,
        _id: voiceMessage._id || `temp-${Date.now()}`,
        createdAt: voiceMessage.createdAt || new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, optimisticVoiceMessage]);

      socket.emit("send_file", {
        groupId,
        message: voiceMessage,
      });

      setMessageText("");
      setReplyingTo(null);
      setMentions([]);
      setRecordedAudioFile(null);
      setRecordingDuration(0);
      setIsSending(false);
    } catch (err) {
      console.error("Error sending voice message:", err);
      alert(err?.response?.data?.message || "Failed to send voice message");
      setIsSending(false);
    }
  };

  // ========== ENHANCED FEATURES HANDLERS ==========

  /**
   * Handle reply to message
   */
  const handleReply = (messageId) => {
    const message = messages.find((m) => m._id === messageId);
    setReplyingTo(message);
    messageInputRef.current?.focus();
  };

  /**
   * Handle message context menu
   */
  const handleMessageContextMenu = (data) => {
    setContextMenu({
      ...data,
      message: data.message,
      isOwnMessage: data.isOwnMessage,
    });
  };

  /**
   * Handle edit message
   */
  const handleEditMessage = async (messageId) => {
    const message = messages.find((m) => m._id === messageId);
    setEditingMessage(message);
    setMessageText(message.text);
    messageInputRef.current?.focus();
  };

  /**
   * Handle save edited message
   */
  const handleSaveEdit = async () => {
    if (!editingMessage || !messageText.trim()) return;

    try {
      await editMessage(editingMessage._id, messageText.trim(), senderId);

      // Update message in local state
      setMessages(
        messages.map((m) =>
          m._id === editingMessage._id
            ? {
                ...m,
                text: messageText.trim(),
                isEdited: true,
                editedAt: new Date().toISOString(),
              }
            : m,
        ),
      );

      setEditingMessage(null);
      setMessageText("");
    } catch (err) {
      if (err?.response?.status === 404) {
        setMessages(
          messages.map((m) =>
            m._id === editingMessage._id
              ? {
                  ...m,
                  text: messageText.trim(),
                  isEdited: true,
                  editedAt: new Date().toISOString(),
                }
              : m,
          ),
        );
        setEditingMessage(null);
        setMessageText("");
        return;
      }
      console.error("Error editing message:", err);
      alert("Failed to edit message");
    }
  };

  /**
   * Handle delete message - opens delete dialog
   */
  const handleDeleteMessage = (messageId) => {
    setMessageToDelete(messageId);
    setShowDeleteDialog(true);
    setContextMenu(null);
  };

  /**
   * Delete for everyone - removes from database
   */
  const handleDeleteForEveryone = async () => {
    if (!messageToDelete) return;

    // Check if message is already deleted
    const targetMessage = messages.find((m) => m._id === messageToDelete);
    const isAlreadyDeleted = targetMessage?.isDeleted;

    setIsDeleting(true);
    try {
      if (isAlreadyDeleted) {
        // If already deleted, remove completely from chat area
        setMessages(messages.filter((m) => m._id !== messageToDelete));

        // Store in removed messages list to persist across page refresh
        const removedMessages = JSON.parse(
          localStorage.getItem(`removed_messages_${groupId}`) || "[]",
        );
        if (!removedMessages.includes(messageToDelete)) {
          removedMessages.push(messageToDelete);
          localStorage.setItem(
            `removed_messages_${groupId}`,
            JSON.stringify(removedMessages),
          );
        }
      } else {
        // First delete: mark as deleted
        await deleteMessage(messageToDelete, senderId);

        // Update message in local state
        setMessages(
          messages.map((m) =>
            m._id === messageToDelete
              ? { ...m, isDeleted: true, text: "[This message was deleted]" }
              : m,
          ),
        );
      }

      setShowDeleteDialog(false);
      setMessageToDelete(null);
    } catch (err) {
      if (err?.response?.status === 404) {
        setMessages(
          messages.map((m) =>
            m._id === messageToDelete
              ? { ...m, isDeleted: true, text: "[This message was deleted]" }
              : m,
          ),
        );
        setShowDeleteDialog(false);
        setMessageToDelete(null);
        return;
      }
      console.error("Error deleting message:", err);
      alert("Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Delete for me - hides locally only
   */
  const handleDeleteForMe = () => {
    if (!messageToDelete) return;

    // Mark as deleted locally (hide from UI)
    setMessages(
      messages.map((m) =>
        m._id === messageToDelete ? { ...m, deletedForMe: true } : m,
      ),
    );

    // Store in localStorage to persist across sessions
    const hiddenMessages = JSON.parse(
      localStorage.getItem(`hidden_messages_${groupId}`) || "[]",
    );
    if (!hiddenMessages.includes(messageToDelete)) {
      hiddenMessages.push(messageToDelete);
      localStorage.setItem(
        `hidden_messages_${groupId}`,
        JSON.stringify(hiddenMessages),
      );
    }

    setShowDeleteDialog(false);
    setMessageToDelete(null);
  };

  /**
   * Handle pin message
   */
  const handlePinMessage = async (messageId) => {
    try {
      const response = await pinMessage(messageId, groupId);

      // Update message in local state
      setMessages(
        messages.map((m) =>
          m._id === messageId ? { ...m, isPinned: true } : m,
        ),
      );

      // Add to pinned messages list
      setPinnedMessages([...pinnedMessages, response.data]);
      setContextMenu(null);

      alert("Message pinned successfully!");
    } catch (err) {
      if (err?.response?.status === 404) {
        const fallbackPinned = messages.find((m) => m._id === messageId);

        setMessages(
          messages.map((m) =>
            m._id === messageId ? { ...m, isPinned: true } : m,
          ),
        );

        if (fallbackPinned && pinnedMessages.length < 3) {
          setPinnedMessages([
            ...pinnedMessages,
            {
              ...fallbackPinned,
              isPinned: true,
              pinnedAt: new Date().toISOString(),
            },
          ]);
        }

        setContextMenu(null);
        return;
      }
      console.error("Error pinning message:", err);
      alert(err.response?.data?.message || "Failed to pin message");
    }
  };

  /**
   * Handle unpin message
   */
  const handleUnpinMessage = async (messageId) => {
    try {
      await unpinMessage(messageId);

      // Update message in local state
      setMessages(
        messages.map((m) =>
          m._id === messageId ? { ...m, isPinned: false } : m,
        ),
      );

      // Remove from pinned messages list
      setPinnedMessages(pinnedMessages.filter((m) => m._id !== messageId));
      setContextMenu(null);
    } catch (err) {
      if (err?.response?.status === 404) {
        setMessages(
          messages.map((m) =>
            m._id === messageId ? { ...m, isPinned: false } : m,
          ),
        );
        setPinnedMessages(pinnedMessages.filter((m) => m._id !== messageId));
        setContextMenu(null);
        return;
      }
      console.error("Error unpinning message:", err);
      alert("Failed to unpin message");
    }
  };

  /**
   * Handle star message
   */
  const handleStarMessage = async (messageId) => {
    try {
      const response = await starMessage(messageId, senderId);

      // Update message in local state
      setMessages(
        messages.map((m) => (m._id === messageId ? response.data : m)),
      );

      setContextMenu(null);
    } catch (err) {
      if (err?.response?.status === 404) {
        setMessages(
          messages.map((m) => {
            if (m._id !== messageId) return m;

            const existing = m.starredBy || [];
            const isStarred = existing.some((s) => s.userId === senderId);
            const updated = isStarred
              ? existing.filter((s) => s.userId !== senderId)
              : [
                  ...existing,
                  { userId: senderId, starredAt: new Date().toISOString() },
                ];

            return { ...m, starredBy: updated };
          }),
        );
        setContextMenu(null);
        return;
      }
      console.error("Error starring message:", err);
      alert("Failed to star message");
    }
  };

  /**
   * Handle forward message
   */
  const openForwardDialog = (messageIds) => {
    setMessagesToForward(messageIds);
    setForwardTargetType("same");
    setForwardTargetGroupId("");
    setShowForwardDialog(true);
    setContextMenu(null);
  };

  const handleForwardMessage = async (messageId) => {
    openForwardDialog([messageId]);
  };

  const handleConfirmForward = async () => {
    if (!messagesToForward.length) return;

    const targetGroupId =
      forwardTargetType === "same" ? groupId : forwardTargetGroupId.trim();

    if (!targetGroupId) {
      alert("Please enter a target group ID.");
      return;
    }

    try {
      setIsForwarding(true);
      const createdForwardedMessages = [];

      for (const messageId of messagesToForward) {
        const response = await forwardMessage(messageId, {
          targetGroupId,
          senderId,
          senderName,
        });

        if (response?.data) {
          createdForwardedMessages.push(response.data);
        }
      }

      if (targetGroupId === groupId && createdForwardedMessages.length > 0) {
        setMessages((prevMessages) => {
          const mergedMessages = [...prevMessages];

          createdForwardedMessages.forEach((forwardedMessage) => {
            const alreadyExists = mergedMessages.some(
              (message) => message._id === forwardedMessage._id,
            );

            if (!alreadyExists) {
              mergedMessages.push(forwardedMessage);
            }
          });

          return mergedMessages;
        });
      }

      if (selectionMode) {
        setSelectedMessageIds([]);
        setSelectionMode(false);
      }

      setShowForwardDialog(false);
      setMessagesToForward([]);
      setForwardTargetGroupId("");
      alert("Message(s) forwarded successfully!");
    } catch (err) {
      console.error("Error forwarding message:", err);
      alert("Failed to forward message(s)");
    } finally {
      setIsForwarding(false);
    }
  };

  /**
   * Handle message input with mention detection
   */
  const handleMessageInputChange = (e) => {
    const text = e.target.value;
    setMessageText(text);

    const getMemberName = (member) => {
      if (member?.name) return member.name;
      const fullName =
        `${member?.firstName || ""} ${member?.lastName || ""}`.trim();
      return fullName || member?.email || "";
    };

    // Detect @ mentions
    const lastAtIndex = text.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const mentionText = text.substring(lastAtIndex + 1);

      // Filter members based on mention text
      const filteredMembers = groupMembers.filter((member) => {
        const memberName = getMemberName(member).toLowerCase();
        if (!mentionText.trim()) return true; // show all when only '@'
        return memberName.includes(mentionText.toLowerCase());
      });

      if (filteredMembers.length > 0) {
        setShowMentionDropdown(true);
        // Calculate dropdown position
        const inputRect = messageInputRef.current?.getBoundingClientRect();
        setMentionPosition({
          x: inputRect?.left || 0,
          y: (inputRect?.top || 0) - 200,
        });
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }

    handleTyping();
  };

  /**
   * Handle mention selection
   */
  const handleMentionSelect = (member) => {
    const mentionName =
      member?.name ||
      `${member?.firstName || ""} ${member?.lastName || ""}`.trim() ||
      member?.email ||
      "Member";

    const lastAtIndex = messageText.lastIndexOf("@");
    const beforeMention = messageText.substring(0, lastAtIndex);
    const newText = `${beforeMention}@${mentionName} `;

    setMessageText(newText);

    // Add to mentions list
    const newMentions = mentions.filter((m) => m.userId !== member._id);
    newMentions.push({
      userId: member._id,
      userName: mentionName,
    });
    setMentions(newMentions);

    setShowMentionDropdown(false);
    messageInputRef.current?.focus();
  };

  /**
   * Handle send message with reply and mentions
   */
  const handleSendMessageWithMentions = (e) => {
    e.preventDefault();

    if (editingMessage) {
      handleSaveEdit();
      return;
    }

    if (!messageText.trim() && !selectedFile && !recordedAudioFile) return;

    if (recordedAudioFile) {
      handleSendRecordedVoiceMessage();
      return;
    }

    if (selectedFile) {
      handleFileUpload();
      // Make sure user data is loaded before sending
      if (!senderId || !senderName) {
        console.warn("User data not loaded yet. Please wait...");
        return;
      }

      return;
    }

    const clientMessageId = `client-${Date.now()}-${Math.random()}`;

    const messageData = {
      groupId,
      senderId,
      senderName,
      profilePicture: senderProfilePicture,
      text: messageText.trim(),
      createdAt: new Date().toISOString(),
      clientMessageId,
      replyTo: replyingTo?._id || null,
      mentions: mentions.length > 0 ? mentions : [],
    };

    const optimisticMessage = {
      ...messageData,
      _id: `temp-${Date.now()}`,
    };

    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);

    socket.emit("send_message", messageData);

    setMessageText("");
    setReplyingTo(null);
    setMentions([]);
    socket.emit("stop_typing", { groupId });
  };

  const toggleSelectMessage = (messageId) => {
    setSelectedMessageIds((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId],
    );
  };

  const handleMessageDoubleClick = (messageId) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedMessageIds([messageId]);
      return;
    }

    toggleSelectMessage(messageId);
  };

  const handleMessageSingleClick = (messageId) => {
    if (!selectionMode) return;
    toggleSelectMessage(messageId);
  };

  const handleBulkDelete = async () => {
    if (!selectedMessageIds.length) return;
    setShowBulkDeleteDialog(true);
  };

  /**
   * Bulk delete for everyone - removes from database
   */
  const handleBulkDeleteForEveryone = async () => {
    setIsDeleting(true);
    try {
      const removedMessageIds = [];

      for (const messageId of selectedMessageIds) {
        const message = messages.find((m) => m._id === messageId);
        if (message && isMyMessage(message)) {
          const isAlreadyDeleted = message.isDeleted;

          if (isAlreadyDeleted) {
            // Remove completely from chat area
            setMessages((prev) => prev.filter((m) => m._id !== messageId));
            removedMessageIds.push(messageId);
          } else {
            // First delete: mark as deleted
            try {
              await deleteMessage(messageId, senderId);
            } catch (err) {
              console.error("Bulk delete failed for message:", messageId, err);
            }
          }
        }
      }

      // Update messages state for non-already-deleted messages
      setMessages((prev) =>
        prev.map((message) =>
          selectedMessageIds.includes(message._id) &&
          isMyMessage(message) &&
          !message.isDeleted
            ? {
                ...message,
                isDeleted: true,
                text: "[This message was deleted]",
              }
            : message,
        ),
      );

      // Store completely removed messages to persist across page refresh
      if (removedMessageIds.length > 0) {
        const removedMessages = JSON.parse(
          localStorage.getItem(`removed_messages_${groupId}`) || "[]",
        );
        removedMessageIds.forEach((id) => {
          if (!removedMessages.includes(id)) {
            removedMessages.push(id);
          }
        });
        localStorage.setItem(
          `removed_messages_${groupId}`,
          JSON.stringify(removedMessages),
        );
      }

      setSelectedMessageIds([]);
      setSelectionMode(false);
      setShowBulkDeleteDialog(false);
    } catch (err) {
      console.error("Error in bulk delete:", err);
      alert("Failed to delete some messages");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Bulk delete for me - hides locally only
   */
  const handleBulkDeleteForMe = () => {
    // Mark all selected as deleted locally
    setMessages(
      messages.map((m) =>
        selectedMessageIds.includes(m._id) ? { ...m, deletedForMe: true } : m,
      ),
    );

    // Store in localStorage to persist across sessions
    const hiddenMessages = JSON.parse(
      localStorage.getItem(`hidden_messages_${groupId}`) || "[]",
    );

    selectedMessageIds.forEach((messageId) => {
      if (!hiddenMessages.includes(messageId)) {
        hiddenMessages.push(messageId);
      }
    });

    localStorage.setItem(
      `hidden_messages_${groupId}`,
      JSON.stringify(hiddenMessages),
    );

    setSelectedMessageIds([]);
    setSelectionMode(false);
    setShowBulkDeleteDialog(false);
  };

  const handleBulkForward = async () => {
    if (!selectedMessageIds.length) return;
    openForwardDialog([...selectedMessageIds]);
  };

  /**
   * Handle emoji selection for message input
   */
  const handleEmojiSelect = (emoji) => {
    setMessageText(messageText + emoji);
    setShowEmojiPicker(false);
    // Focus back on input
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 0);
  };

  /**
   * Handle emoji reaction on a message
   */
  const handleReactionSelect = async (emoji, message) => {
    try {
      const response = await reactToMessage(message._id, {
        emoji,
        userId: senderId,
        userName: senderName,
      });

      // Update local state optimistically
      setMessages((prevMessages) =>
        prevMessages.map((m) => (m._id === message._id ? response.data : m)),
      );

      // Broadcast reaction via socket
      socket.emit("reaction_added", {
        groupId,
        messageId: message._id,
        reaction: {
          emoji,
          userId: senderId,
          userName: senderName,
        },
      });

      setShowReactionPicker(null);
    } catch (error) {
      console.error("Error adding reaction:", error);
      alert("Failed to add reaction");
    }
  };

  /**
   * Handle message click to show reaction picker
   */
  const handleMessageClick = ({ message, position }) => {
    // Don't show reaction picker if message is deleted or in selection mode
    if (message.isDeleted || selectionMode) return;

    setShowReactionPicker({
      message,
      position,
    });
  };

  /**
   * Handle reaction click to show remove popup
   */
  const handleReactionClick = ({ reaction, message }) => {
    setShowRemoveReactionPopup({
      reaction,
      message,
    });
  };

  /**
   * Handle remove reaction
   */
  const handleRemoveReaction = async () => {
    if (!showRemoveReactionPopup) return;

    const { reaction, message } = showRemoveReactionPopup;

    try {
      // Call the same reaction endpoint with same emoji to toggle it off
      const response = await reactToMessage(message._id, {
        emoji: reaction.emoji,
        userId: senderId,
        userName: senderName,
      });

      // Update local state
      setMessages((prevMessages) =>
        prevMessages.map((m) => (m._id === message._id ? response.data : m)),
      );

      // Broadcast reaction removal via socket
      socket.emit("reaction_added", {
        groupId,
        messageId: message._id,
        reaction: {
          emoji: reaction.emoji,
          userId: senderId,
          userName: senderName,
        },
      });
    } catch (error) {
      console.error("Error removing reaction:", error);
      alert("Failed to remove reaction");
    }
  };

  /**
   * Check if message is from current user
   */
  const isMyMessage = (message) => {
    const normalizeId = (value) => {
      if (!value) return "";
      if (typeof value === "string") return value;
      if (typeof value === "object") {
        if (typeof value._id === "string") return value._id;
        if (typeof value.toString === "function") return value.toString();
      }
      return String(value);
    };

    const senderFromMessage = normalizeId(
      message?.sender?._id || message?.sender || message?.senderId,
    );
    const currentSender = normalizeId(senderId);

    return senderFromMessage !== "" && senderFromMessage === currentSender;
  };

  /**
   * Get file icon based on file type
   */
  const getFileIcon = (fileType) => {
    if (!fileType) return "📄";
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType === "application/pdf") return "📕";
    if (fileType.includes("word")) return "📘";
    if (fileType.includes("excel")) return "📗";
    if (fileType.includes("powerpoint")) return "📙";
    return "📄";
  };

  const truncateWords = (text, wordCount = 3) => {
    if (!text) return "(No text)";

    const words = text.trim().split(/\s+/);
    if (words.length <= wordCount) {
      return text.trim();
    }

    return `${words.slice(0, wordCount).join(" ")}...`;
  };

  const getReplyTargetMessage = (message) => {
    if (!message?.replyTo) return null;

    if (typeof message.replyTo === "object" && message.replyTo.text) {
      return message.replyTo;
    }

    const replyId =
      typeof message.replyTo === "object"
        ? message.replyTo._id || message.replyTo.toString?.()
        : message.replyTo;

    return messages.find((item) => item._id === replyId) || null;
  };

  /**
   * Update group details (name or picture)
   */
  const handleUpdateGroup = async (updates) => {
    try {
      const response = await updateGroup(groupId, updates);
      setGroupDetails(response.data);
      console.log("Group updated:", updates);
      alert("Group updated successfully!");
    } catch (error) {
      console.error("Error updating group:", error);
      alert("Failed to update group");
    }
  };

  /**
   * Clear all messages in the chat
   */
  const handleClearChat = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear all messages? This action cannot be undone.",
      )
    ) {
      try {
        await clearGroupMessages(groupId);
        setMessages([]);
        setPinnedMessages([]);
        console.log("Chat cleared");
        alert("Chat cleared successfully!");
        setShowGroupDetails(false);
      } catch (error) {
        console.error("Error clearing chat:", error);
        alert("Failed to clear chat");
      }
    }
  };

  /**
   * Leave the group
   */
  const handleLeaveGroup = async () => {
    if (
      window.confirm(
        "Are you sure you want to leave this group? You will no longer be able to send or receive messages.",
      )
    ) {
      try {
        const memberId =
          senderId ||
          localStorage.getItem("userId") ||
          localStorage.getItem("currentUserId") ||
          null;

        if (!memberId) {
          alert(
            "Unable to leave group: missing user session. Please sign in again.",
          );
          return;
        }

        const currentGroupId = groupId || localStorage.getItem("activeGroupId");

        if (currentGroupId && isMockGroupId(currentGroupId)) {
          resetGroupViewAfterLeave(currentGroupId);
          console.log("Left mock group successfully");
          alert("You have left the group.");
          return;
        }

        await leaveGroup(currentGroupId || groupId, memberId);
        console.log("Left group successfully");
        resetGroupViewAfterLeave(currentGroupId || groupId);
        alert("You have left the group.");
      } catch (error) {
        console.error("Error leaving group:", error);
        alert("Failed to leave group");
      }
    }
  };

  /**
   * Scroll to a starred message
   */
  const handleStarredMessageClick = (messageId) => {
    const element = document.getElementById(`msg-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Briefly highlight the message
      element.classList.add("bg-yellow-100", "dark:bg-yellow-900/30");
      setTimeout(() => {
        element.classList.remove("bg-yellow-100", "dark:bg-yellow-900/30");
      }, 2000);
    }
    setShowGroupDetails(false);
  };

  // ========== RENDER ==========

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center ${screenHeightClass} bg-gray-100 overflow-x-hidden`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading chat...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center ${screenHeightClass} bg-gray-100 dark:bg-gray-900 overflow-x-hidden`}
      >
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-2xl max-w-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
            Error
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
          <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold mb-2">
              Setup Instructions:
            </p>
            <ol className="list-decimal list-inside text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>
                Run:{" "}
                <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-blue-900 dark:text-blue-200">
                  node backend/seedDummyData.js
                </code>
              </li>
              <li>Copy the Group ID from terminal output</li>
              <li>Update DUMMY_GROUP_ID in GroupChat.jsx</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div
        className={`flex ${screenHeightClass} items-center justify-center bg-gray-100 dark:bg-gray-900 overflow-x-hidden`}
      >
        <div className="rounded-lg bg-white dark:bg-gray-800 p-8 text-center max-w-md shadow-lg">
          <div className="text-red-500 dark:text-red-400 text-3xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Chat
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div
        className={`flex ${screenHeightClass} items-center justify-center bg-gray-100 dark:bg-gray-900 overflow-x-hidden`}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Show "no groups available" state
  if (noGroupsAvailable) {
    return (
      <div
        className={`flex ${screenHeightClass} items-center justify-center bg-gray-100 dark:bg-gray-900 overflow-x-hidden`}
      >
        <div className="rounded-lg bg-white dark:bg-gray-800 p-8 text-center max-w-md shadow-lg">
          <p className="text-gray-700 dark:text-gray-300 text-base font-medium">
            You are not part of any group yet. Please join a group.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col ${screenHeightClass} relative w-full max-w-full min-w-0 box-border overflow-x-hidden ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}
    >
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full max-w-full min-w-0 min-h-0 overflow-hidden box-border">
        {/* Chat Header */}
        <div
          className={`sticky top-0 z-10 border-b ${chatHorizontalPadding} h-14 shadow-sm ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
        >
          <div className="h-full flex items-center justify-between gap-2">
            <button
              onClick={() => setShowGroupDetails(true)}
              className="flex items-center space-x-2 w-full text-left rounded-lg p-1 transition-colors duration-200 min-w-0"
            >
              <div className="bg-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center overflow-hidden flex-shrink-0">
                {groupDetails?.profilePicture ? (
                  <img
                    src={groupDetails.profilePicture}
                    alt={groupDetails?.groupName || "Group Chat"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUsers />
                )}
              </div>
              <div className="min-w-0">
                <h1
                  className={`text-base font-semibold truncate ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}
                >
                  {groupDetails?.groupName || "Group Chat"}
                </h1>
                <p
                  className={`text-xs truncate ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  {groupDetails?.members?.length || 0} members
                </p>
              </div>
            </button>
          </div>
        </div>

        {selectionMode && (
          <div
            className={`sticky top-14 z-10 px-6 py-2 border-b flex items-center justify-between ${isEmbeddedMobilePreview ? "bg-indigo-950/90 border-indigo-700 px-3 py-2" : isDarkMode ? "bg-indigo-900/20 border-indigo-700" : "bg-indigo-50 border-indigo-200"}`}
          >
            <p
              className={`text-sm ${isDarkMode ? "text-indigo-300" : "text-indigo-700"}`}
            >
              {selectedMessageIds.length} selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectionMode(false);
                  setSelectedMessageIds([]);
                }}
                className="h-8 w-8 rounded bg-gray-500 text-white flex items-center justify-center hover:bg-gray-600 transition"
                title="Cancel"
                aria-label="Cancel selection"
              >
                <FaTimes size={14} />
              </button>
              <button
                onClick={handleBulkForward}
                disabled={!selectedMessageIds.length}
                className="h-8 w-8 rounded bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-50"
                title="Forward selected"
                aria-label="Forward selected messages"
              >
                <FaShare size={13} />
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={!selectedMessageIds.length}
                className="h-8 w-8 rounded bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition disabled:opacity-50"
                title="Delete selected"
                aria-label="Delete selected messages"
              >
                <FaTrash size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Persistent Pinned Messages Strip */}
        {pinnedMessages.length > 0 && (
          <div
            className={`sticky top-14 z-10 border-b ${isEmbeddedMobilePreview ? "border-amber-700 bg-amber-950/95 px-3 py-1" : "border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-4 py-2"}`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-600 dark:text-amber-400 text-xs leading-none">
                  📌
                </span>
                <p className="text-[9px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide leading-none">
                  Pinned Messages ({pinnedMessages.length}/3)
                </p>
              </div>
              <button
                onClick={() => setShowPinnedPanel((prev) => !prev)}
                className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-700 transition leading-none"
              >
                {showPinnedPanel ? "Compact" : "Expand"}
              </button>
            </div>

            <div
              className={`app-scrollbar overflow-x-auto ${showPinnedPanel ? "max-h-52 overflow-y-auto" : ""}`}
            >
              <div
                className={`flex gap-2 ${showPinnedPanel ? "flex-col" : ""}`}
              >
                {pinnedMessages.map((msg) => (
                  <button
                    key={`pinned-${msg._id}`}
                    type="button"
                    onClick={() => {
                      const element = document.getElementById(`msg-${msg._id}`);
                      element?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                    className={`text-left rounded-md border border-amber-300 dark:border-amber-600 bg-white/90 dark:bg-gray-800/90 hover:bg-amber-100 dark:hover:bg-amber-800/30 transition p-2 ${showPinnedPanel ? "w-full" : "min-w-[220px] max-w-[260px]"}`}
                    title="Jump to pinned message"
                  >
                    <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 truncate mb-0.5 leading-none">
                      {msg.senderName || "Pinned message"}
                    </p>
                    <p className="text-[10px] text-gray-700 dark:text-gray-200 leading-tight">
                      {truncateWords(msg.text, 3)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div
          className={`app-scrollbar flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${chatHorizontalPadding} py-4 space-y-4 relative w-full max-w-full box-border ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
          style={{ overscrollBehavior: "contain" }}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div
                className={`text-center ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
              >
                <p className="text-lg">No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages
              .filter((message) => !message.deletedForMe)
              .map((message) => (
                <div
                  key={message._id}
                  id={`msg-${message._id}`}
                  className="flex items-start gap-2"
                  onDoubleClick={() => handleMessageDoubleClick(message._id)}
                  onClick={() => handleMessageSingleClick(message._id)}
                >
                  {selectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedMessageIds.includes(message._id)}
                      onChange={() => toggleSelectMessage(message._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2"
                    />
                  )}
                  <MessageItem
                    message={message}
                    repliedMessage={getReplyTargetMessage(message)}
                    isOwnMessage={isMyMessage(message)}
                    currentUserId={senderId}
                    isMobilePreview={isEmbeddedMobilePreview}
                    onContextMenu={handleMessageContextMenu}
                    onClick={handleMessageClick}
                    onReactionClick={handleReactionClick}
                  />
                </div>
              ))
          )}

          {/* Typing Indicator */}
          {typing && (
            <div className="flex justify-start">
              <div
                className={`rounded-lg px-4 py-2 shadow-sm ${isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}
              >
                <div className="flex space-x-1">
                  <div
                    className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? "bg-gray-500" : "bg-gray-400"}`}
                  ></div>
                  <div
                    className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? "bg-gray-500" : "bg-gray-400"}`}
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? "bg-gray-500" : "bg-gray-400"}`}
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Area */}
        <div
          className={`sticky bottom-0 z-10 border-t ${chatHorizontalPadding} py-4 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
        >
          {/* Reply Preview */}
          {replyingTo && (
            <div
              className={`mb-3 border-l-4 border-blue-500 rounded px-4 py-3 flex items-start justify-between ${isDarkMode ? "bg-blue-900/30" : "bg-blue-50"}`}
            >
              <div className="flex-1">
                <p
                  className={`text-xs font-semibold mb-1 ${isDarkMode ? "text-blue-300" : "text-blue-800"}`}
                >
                  Replying to {replyingTo.senderName}
                </p>
                <p
                  className={`text-sm line-clamp-2 ${isDarkMode ? "text-blue-200" : "text-blue-700"}`}
                >
                  {replyingTo.text}
                </p>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className={`ml-2 ${isDarkMode ? "text-blue-400 hover:text-blue-200" : "text-blue-600 hover:text-blue-800"}`}
              >
                <FaTimes size={16} />
              </button>
            </div>
          )}

          {/* Edit Mode Indicator */}
          {editingMessage && (
            <div
              className={`mb-3 border-l-4 border-purple-500 rounded px-4 py-3 flex items-start justify-between ${isDarkMode ? "bg-purple-900/30" : "bg-purple-50"}`}
            >
              <div className="flex-1">
                <p
                  className={`text-xs font-semibold mb-1 ${isDarkMode ? "text-purple-300" : "text-purple-800"}`}
                >
                  Editing message
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingMessage(null);
                  setMessageText("");
                }}
                className={`ml-2 ${isDarkMode ? "text-purple-400 hover:text-purple-200" : "text-purple-600 hover:text-purple-800"}`}
              >
                <FaTimes size={16} />
              </button>
            </div>
          )}

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="mb-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-400/30 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">
                  {getFileIcon(selectedFile.type)}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelFile}
                className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold text-sm"
              >
                Remove
              </button>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={handleSendMessageWithMentions}
            className="flex items-end space-x-2 relative"
          >
            {/* File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-full p-3 transition ${isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
              disabled={isSending}
            >
              <FaPaperclip size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            />

            {/* Message Input */}
            <div
              className={`flex-1 rounded-full px-4 py-2 relative ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}
            >
              {/* Emoji Picker */}
              <EmojiPicker
                show={showEmojiPicker}
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />

              {isRecording ? (
                <div
                  ref={recordingControlsRef}
                  className="flex items-center justify-center gap-3 py-2 px-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      console.log("Enter key pressed while recording");

                      // Set flag to auto-send after recording stops
                      autoSendAfterStopRef.current = true;

                      // Stop the recording
                      stopRecordingTimer();
                      setIsRecording(false);
                      setIsPaused(false);

                      if (
                        mediaRecorderRef.current &&
                        mediaRecorderRef.current.state !== "inactive"
                      ) {
                        mediaRecorderRef.current.stop();
                      }
                    }
                  }}
                  tabIndex={0}
                  role="region"
                  aria-label="Voice recording controls"
                >
                  <span
                    className={`font-medium text-sm ${
                      isPaused
                        ? "text-orange-500 dark:text-orange-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    {isPaused ? "Paused" : "Recording..."}
                  </span>
                  {!isPaused && (
                    <div className="h-6 flex items-end gap-1">
                      {[8, 14, 10, 16, 9, 13].map((height, index) => (
                        <span
                          key={`wave-${height}`}
                          className="w-1.5 rounded-full bg-red-500 dark:bg-red-400 animate-pulse"
                          style={{
                            height: `${height}px`,
                            animationDelay: `${index * 0.12}s`,
                            animationDuration: "0.9s",
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <span
                    className={`tabular-nums text-sm font-semibold ${
                      isPaused
                        ? "text-orange-500 dark:text-orange-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    {formatDuration(recordingDuration)}
                  </span>
                  <button
                    type="button"
                    onClick={
                      isPaused
                        ? handleResumeVoiceRecording
                        : handlePauseVoiceRecording
                    }
                    className={`transition ml-1 ${
                      isPaused
                        ? "text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300"
                        : "text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300"
                    }`}
                    title={isPaused ? "Resume recording" : "Pause recording"}
                  >
                    {isPaused ? <FaPlay size={16} /> : <FaPause size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteVoiceRecording}
                    className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition"
                    title="Delete recording"
                  >
                    <FaTrash size={16} />
                  </button>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    Press{" "}
                    <kbd className="bg-gray-300 dark:bg-gray-600 px-1.5 py-0.5 rounded text-xs font-mono">
                      Enter
                    </kbd>{" "}
                    to send
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      ref={messageInputRef}
                      type="text"
                      value={messageText}
                      onChange={handleMessageInputChange}
                      placeholder={
                        editingMessage
                          ? "Edit message..."
                          : "Type a message... @ to mention"
                      }
                      className={`flex-1 bg-transparent outline-none placeholder-opacity-70 ${isDarkMode ? "text-gray-200 placeholder-gray-400" : "text-gray-800 placeholder-gray-500"}`}
                      disabled={isSending}
                    />

                    {/* Emoji Button */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`transition ${isDarkMode ? "text-gray-400 hover:text-yellow-400" : "text-gray-500 hover:text-yellow-500"}`}
                      disabled={isSending}
                    >
                      <FaSmile size={20} />
                    </button>

                    <button
                      type="button"
                      onClick={handleStartVoiceRecording}
                      className={`transition ${isDarkMode ? "text-gray-400 hover:text-blue-400" : "text-gray-500 hover:text-blue-500"}`}
                      disabled={isSending || !!selectedFile || !!editingMessage}
                      title="Record voice"
                    >
                      <FaMicrophone size={18} />
                    </button>
                  </div>
                </>
              )}

              {/* Mention Dropdown */}
              {showMentionDropdown && (
                <MentionDropdown
                  members={groupMembers.filter((member) => {
                    const lastAtIndex = messageText.lastIndexOf("@");
                    const mentionText = messageText.substring(lastAtIndex + 1);
                    const memberName =
                      member?.name ||
                      `${member?.firstName || ""} ${member?.lastName || ""}`.trim() ||
                      member?.email ||
                      "";
                    if (!mentionText.trim()) return true;
                    return memberName
                      .toLowerCase()
                      .includes(mentionText.toLowerCase());
                  })}
                  position={mentionPosition}
                  onSelect={handleMentionSelect}
                  onClose={() => setShowMentionDropdown(false)}
                />
              )}
            </div>

            {/* Send Button */}
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();

                // If recording is paused, stop it and mark for auto-send
                if (isRecording && isPaused) {
                  autoSendAfterStopRef.current = true;
                  handleStopVoiceRecording();
                  return;
                }

                // If recording is active, stop it and mark for auto-send
                if (isRecording && !isPaused) {
                  autoSendAfterStopRef.current = true;
                  handleStopVoiceRecording();
                  return;
                }

                // If voice file is ready, send it
                if (recordedAudioFile) {
                  handleSendRecordedVoiceMessage();
                  return;
                }

                // Otherwise, send regular message
                handleSendMessageWithMentions(e);
              }}
              disabled={
                (!messageText.trim() &&
                  !selectedFile &&
                  !editingMessage &&
                  !recordedAudioFile &&
                  !isRecording) ||
                isSending
              }
              className={`${isEmbeddedMobilePreview ? "w-11 h-11 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-500 disabled:text-white/90 flex items-center justify-center flex-shrink-0" : "rounded-full p-3"} transition ${
                !isEmbeddedMobilePreview &&
                !messageText.trim() &&
                !selectedFile &&
                !editingMessage &&
                !recordedAudioFile &&
                !isRecording
                  ? isDarkMode
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : !isEmbeddedMobilePreview
                    ? isDarkMode
                      ? "bg-blue-700 hover:bg-blue-600 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                    : ""
              }`}
              title="Send message or voice"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <span>{editingMessage ? "✓" : <FaPaperPlane size={18} />}</span>
              )}
            </button>
          </form>
        </div>

        {/* Message Context Menu */}
        {showForwardDialog && (
          <>
            <button
              type="button"
              aria-label="Close forward dialog"
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => {
                if (isForwarding) return;
                setShowForwardDialog(false);
              }}
            />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl p-5">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  Forward Message
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  {messagesToForward.length} message
                  {messagesToForward.length > 1 ? "s" : ""} selected
                </p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setForwardTargetType("same")}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                      forwardTargetType === "same"
                        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-300"
                        : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="font-medium">This Group</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {groupDetails?.groupName || "Group Chat"}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForwardTargetType("other")}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                      forwardTargetType === "other"
                        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-300"
                        : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="font-medium">Another Group</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Forward to a different group
                    </div>
                  </button>

                  {forwardTargetType === "other" && (
                    <input
                      type="text"
                      value={forwardTargetGroupId}
                      onChange={(e) => setForwardTargetGroupId(e.target.value)}
                      placeholder="Enter target group ID"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  )}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForwardDialog(false)}
                    disabled={isForwarding}
                    className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmForward}
                    disabled={isForwarding}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isForwarding ? "Forwarding..." : "Forward"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <>
            <button
              type="button"
              aria-label="Close delete dialog"
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => {
                if (isDeleting) return;
                setShowDeleteDialog(false);
                setMessageToDelete(null);
              }}
            />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl p-5">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  Delete Message
                </h3>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleDeleteForMe}
                    disabled={isDeleting}
                    className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium">Delete for me</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Only you won't see this message
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteForEveryone}
                    disabled={isDeleting}
                    className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium">Delete for everyone</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Everyone in the group won't see this
                    </div>
                  </button>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setMessageToDelete(null);
                    }}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {contextMenu && (
          <>
            <button
              type="button"
              aria-label="Close message menu"
              className="fixed inset-0 z-40"
              onClick={() => setContextMenu(null)}
            />
            <MessageContextMenu
              message={contextMenu.message}
              position={contextMenu.position}
              isOwnMessage={contextMenu.isOwnMessage}
              userStarred={contextMenu.message.starredBy?.some(
                (star) => star.userId === senderId,
              )}
              onReply={() => handleReply(contextMenu.message._id)}
              onForward={() => handleForwardMessage(contextMenu.message._id)}
              onStar={() => handleStarMessage(contextMenu.message._id)}
              onPin={() =>
                contextMenu.message.isPinned
                  ? handleUnpinMessage(contextMenu.message._id)
                  : handlePinMessage(contextMenu.message._id)
              }
              onEdit={() => handleEditMessage(contextMenu.message._id)}
              onDelete={() => handleDeleteMessage(contextMenu.message._id)}
              onClose={() => setContextMenu(null)}
            />
          </>
        )}

        {/* Quick Emoji Reaction Picker */}
        {showReactionPicker && (
          <>
            <button
              type="button"
              aria-label="Close reaction picker"
              className="fixed inset-0 z-40"
              onClick={() => setShowReactionPicker(null)}
            />
            <EmojiReactionPicker
              position={showReactionPicker.position}
              onReactionSelect={(emoji) =>
                handleReactionSelect(emoji, showReactionPicker.message)
              }
              onClose={() => setShowReactionPicker(null)}
            />
          </>
        )}

        {/* Remove Reaction Popup */}
        {showRemoveReactionPopup && (
          <RemoveReactionPopup
            reaction={showRemoveReactionPopup.reaction}
            onRemove={handleRemoveReaction}
            onClose={() => setShowRemoveReactionPopup(null)}
          />
        )}

        {/* Bulk Delete Confirmation Dialog */}
        {showBulkDeleteDialog && (
          <>
            <button
              type="button"
              aria-label="Close bulk delete dialog"
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => {
                if (isDeleting) return;
                setShowBulkDeleteDialog(false);
              }}
            />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl p-5">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  Delete Messages
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  {selectedMessageIds.length} message
                  {selectedMessageIds.length > 1 ? "s" : ""} selected
                </p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleBulkDeleteForMe}
                    disabled={isDeleting}
                    className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium">Delete for me</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Only you won't see these messages
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleBulkDeleteForEveryone}
                    disabled={isDeleting}
                    className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium">Delete for everyone</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Everyone in the group won't see these
                    </div>
                  </button>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowBulkDeleteDialog(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Group Details Panel */}
      <GroupDetailsPanel
        isOpen={showGroupDetails}
        onClose={() => setShowGroupDetails(false)}
        groupDetails={groupDetails}
        messages={messages}
        currentUserId={senderId}
        onUpdateGroup={handleUpdateGroup}
        onClearChat={handleClearChat}
        onStarredMessageClick={handleStarredMessageClick}
        isEmbeddedPreview={isEmbeddedMobilePreview}
      />
    </div>
  );
};

export default GroupChat;
