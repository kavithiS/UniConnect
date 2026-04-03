import React, { useState, useEffect, useRef } from "react";
import {
  FaTimes,
  FaCamera,
  FaEdit,
  FaCheck,
  FaUsers,
  FaImage,
  FaFile,
  FaStar,
  FaTrash,
  FaSignOutAlt,
  FaChevronRight,
  FaChevronDown,
  FaFolderOpen,
  FaLink,
} from "react-icons/fa";
import { FILE_BASE_URL } from "../../services/chatService";


const GroupDetailsPanel = ({
  isOpen,
  onClose,
  groupDetails,
  messages,
  currentUserId,
  onUpdateGroup,
  onClearChat,
  onLeaveGroup,
  onStarredMessageClick,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedGroupName, setEditedGroupName] = useState("");
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPictureMenu, setShowPictureMenu] = useState(false);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (groupDetails?.groupName) {
      setEditedGroupName(groupDetails.groupName);
    }
  }, [groupDetails]);

  // Get starred messages for current user
  const starredMessages = messages.filter(
    (msg) =>
      msg.starredBy?.some((star) => star.userId === currentUserId) &&
      !msg.isDeleted,
  );

  // Get all media files (images, documents) - exclude deleted messages
  const mediaMessages = messages.filter((msg) => msg.fileUrl && !msg.isDeleted);
  const imageMessages = mediaMessages.filter((msg) =>
    msg.fileType?.startsWith("image/"),
  );
  const documentMessages = mediaMessages.filter(
    (msg) =>
      msg.fileType &&
      !msg.fileType.startsWith("image/") &&
      !msg.fileType.startsWith("audio/"),
  );

  // Extract links from messages
  const extractLinks = (text) => {
    if (!text) return [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex) || [];
    return [...new Set(matches)]; // Remove duplicates
  };

  const linkMessages = messages
    .filter(
      (msg) => msg.text && !msg.isDeleted && extractLinks(msg.text).length > 0,
    )
    .map((msg) => ({
      ...msg,
      links: extractLinks(msg.text),
    }));

  // Debug logging
  useEffect(() => {
    const deletedMedia = messages.filter((msg) => msg.fileUrl && msg.isDeleted);
    console.log("GroupDetailsPanel - Media Messages:", {
      total: messages.length,
      withFiles: mediaMessages.length,
      deletedFiles: deletedMedia.length,
      images: imageMessages.length,
      documents: documentMessages.length,
    });
  }, [messages, mediaMessages, imageMessages, documentMessages]);

  const handleSaveGroupName = async () => {
    if (editedGroupName.trim() && editedGroupName !== groupDetails.groupName) {
      await onUpdateGroup({ groupName: editedGroupName.trim() });
    }
    setIsEditingName(false);
  };

  const compressImage = (imageData, callback) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 400;
      const MAX_HEIGHT = 400;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
      callback(compressedBase64);
    };
    img.src = imageData;
  };

  const processProfilePictureFile = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should not exceed 5MB");
      return;
    }

    setIsUploadingPicture(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      compressImage(reader.result, async (compressedBase64) => {
        await onUpdateGroup({ profilePicture: compressedBase64 });
        setIsUploadingPicture(false);
      });
    };
    reader.onerror = () => {
      console.error("Error reading file:", reader.error);
      setIsUploadingPicture(false);
    };
    reader.readAsDataURL(file);

    // Reset file inputs
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    processProfilePictureFile(file);
    setShowPictureMenu(false);
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCameraStream = async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return true;
    } catch (error) {
      console.error("Could not access camera:", error);
      setCameraError(
        "Could not open device camera. Falling back to file picker.",
      );
      return false;
    }
  };

  const handleOpenCamera = async () => {
    setShowPictureMenu(false);
    setShowCameraDialog(true);

    const opened = await startCameraStream();
    if (!opened) {
      cameraInputRef.current?.click();
    }
  };

  const handleCaptureFromCamera = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      setCameraError("Camera is not ready yet. Please try again.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    setIsUploadingPicture(true);
    compressImage(imageData, async (compressedBase64) => {
      await onUpdateGroup({ profilePicture: compressedBase64 });
      setIsUploadingPicture(false);
    });

    stopCameraStream();
    setShowCameraDialog(false);
  };

  const handleCloseCameraDialog = () => {
    stopCameraStream();
    setShowCameraDialog(false);
    setCameraError("");
  };

  const handleOpenFileBrowser = () => {
    fileInputRef.current?.click();
  };

  const handleDeletePicture = async () => {
    await onUpdateGroup({ profilePicture: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    setShowPictureMenu(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        role="button"
        tabIndex={0}
        aria-label="Close group details"
      />

      {/* Side Panel */}
      <div
        className={`fixed lg:relative right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Group Info
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Close group details"
          >
            <FaTimes className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto app-scrollbar">
          {/* Group Profile Section */}
          <div className="bg-gray-50 dark:bg-gray-900 py-8 px-6 text-center border-b border-gray-200 dark:border-gray-700">
            {/* Profile Picture */}
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-4 border-slate-200 dark:border-gray-600">
                {groupDetails?.profilePicture ? (
                  <img
                    src={groupDetails.profilePicture}
                    alt={groupDetails.groupName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUsers className="text-5xl" />
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowPictureMenu(true)}
                disabled={isUploadingPicture}
                className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 dark:from-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-700 dark:hover:to-indigo-600 text-white rounded-full cursor-pointer shadow-lg dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 flex items-center justify-center border-4 border-white dark:border-gray-700 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Open group picture options"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>

              {/* Picture Menu Popup */}
              {showPictureMenu && (
                <>
                  <button
                    type="button"
                    aria-label="Close picture options dialog"
                    className="fixed inset-0 bg-black/30 z-50"
                    onClick={() => setShowPictureMenu(false)}
                  />
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl p-5">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          Group Picture
                        </h3>
                        <button
                          type="button"
                          onClick={handleDeletePicture}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Delete group picture"
                          disabled={!groupDetails?.profilePicture}
                        >
                          <FaTrash size={13} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleOpenCamera}
                          className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition flex items-center gap-3"
                        >
                          <FaCamera className="text-blue-500" size={15} />
                          <div>
                            <div className="font-medium">Use Camera</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Take a photo and upload
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={handleOpenFileBrowser}
                          className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition flex items-center gap-3"
                        >
                          <FaFolderOpen className="text-indigo-500" size={15} />
                          <div>
                            <div className="font-medium">Browse Device</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Select an existing photo
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Hidden File Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleProfilePictureChange}
                className="hidden"
              />

              {/* Hidden Canvas for Image Capture */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Group Name */}
            {isEditingName ? (
              <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                <input
                  type="text"
                  value={editedGroupName}
                  onChange={(e) => setEditedGroupName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  maxLength={100}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSaveGroupName();
                  }}
                />
                <button
                  onClick={handleSaveGroupName}
                  className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  <FaCheck />
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false);
                    setEditedGroupName(groupDetails.groupName);
                  }}
                  className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {groupDetails?.groupName || "Group Chat"}
                </h3>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full transition"
                  title="Edit group name"
                >
                  <FaEdit size={14} />
                </button>
              </div>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Group · {groupDetails?.members?.length || 0} members
            </p>
          </div>

          {/* Members Section */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toggleSection("members")}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            >
              <div className="flex items-center gap-3">
                <FaUsers className="text-green-600 dark:text-green-400" />
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {groupDetails?.members?.length || 0} Members
                </span>
              </div>
              {expandedSection === "members" ? (
                <FaChevronDown className="text-gray-400" />
              ) : (
                <FaChevronRight className="text-gray-400" />
              )}
            </button>
            {expandedSection === "members" && (
              <div className="px-6 pb-4 space-y-2">
                {groupDetails?.members?.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center gap-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg px-2 transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold overflow-hidden">
                      {member.profilePicture ? (
                        <img
                          src={member.profilePicture}
                          alt={`${member.firstName} ${member.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        {member.firstName} {member.lastName}
                        {member._id === currentUserId && (
                          <span className="text-xs text-gray-500 ml-2">
                            (You)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Media Section */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toggleSection("media")}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            >
              <div className="flex items-center gap-3">
                <FaImage className="text-pink-600 dark:text-pink-400" />
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  Media, Files & Links
                </span>
              </div>
              {expandedSection === "media" ? (
                <FaChevronDown className="text-gray-400" />
              ) : (
                <FaChevronRight className="text-gray-400" />
              )}
            </button>
            {expandedSection === "media" && (
              <div className="px-6 pb-4">
                {/* Images */}
                {imageMessages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Images ({imageMessages.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {imageMessages.slice(0, 9).map((msg) => (
                        <a
                          key={msg._id}
                          href={`${FILE_BASE_URL}${msg.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 hover:opacity-80 transition"
                        >
                          <img
                            src={`${FILE_BASE_URL}${msg.fileUrl}`}
                            alt={msg.fileName}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                    {imageMessages.length > 9 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        +{imageMessages.length - 9} more
                      </p>
                    )}
                  </div>
                )}

                {/* Documents */}
                {documentMessages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Documents ({documentMessages.length})
                    </p>
                    <div className="space-y-2">
                      {documentMessages.slice(0, 5).map((msg) => (
                        <a
                          key={msg._id}
                          href={`${FILE_BASE_URL}${msg.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={msg.fileName}
                          className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <FaFile className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                              {msg.fileName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(msg.fileSize)} ·{" "}
                              {formatDate(msg.createdAt)}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                    {documentMessages.length > 5 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        +{documentMessages.length - 5} more
                      </p>
                    )}
                  </div>
                )}

                {/* Links */}
                {linkMessages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Links (
                      {linkMessages.reduce(
                        (acc, msg) => acc + msg.links.length,
                        0,
                      )}
                      )
                    </p>
                    <div className="space-y-2">
                      {linkMessages
                        .slice()
                        .reverse()
                        .flatMap((msg) =>
                          msg.links.map((link, index) => (
                            <a
                              key={`${msg._id}-${index}`}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
                            >
                              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FaLink className="text-cyan-600 dark:text-cyan-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
                                  {link
                                    .replace(/^https?:\/\/(www\.)?/, "")
                                    .substring(0, 50)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {msg.senderName} · {formatDate(msg.createdAt)}
                                </p>
                              </div>
                            </a>
                          )),
                        )
                        .slice(0, 5)}
                    </div>
                    {linkMessages.reduce(
                      (acc, msg) => acc + msg.links.length,
                      0,
                    ) > 5 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        +
                        {linkMessages.reduce(
                          (acc, msg) => acc + msg.links.length,
                          0,
                        ) - 5}{" "}
                        more
                      </p>
                    )}
                  </div>
                )}

                {mediaMessages.length === 0 && linkMessages.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No media files yet
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Starred Messages Section */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toggleSection("starred")}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            >
              <div className="flex items-center gap-3">
                <FaStar className="text-yellow-500" />
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  Starred Messages
                </span>
              </div>
              {expandedSection === "starred" ? (
                <FaChevronDown className="text-gray-400" />
              ) : (
                <FaChevronRight className="text-gray-400" />
              )}
            </button>
            {expandedSection === "starred" && (
              <div className="px-6 pb-4 space-y-2">
                {starredMessages.length > 0 ? (
                  starredMessages.slice(0, 10).map((msg) => (
                    <button
                      key={msg._id}
                      onClick={() => onStarredMessageClick(msg._id)}
                      className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                            {msg.senderName}
                          </p>
                          <p className="text-sm text-gray-800 dark:text-gray-100 line-clamp-2">
                            {msg.text || (msg.fileUrl && `📎 ${msg.fileName}`)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(msg.createdAt)}
                          </p>
                        </div>
                        <FaStar
                          className="text-yellow-500 flex-shrink-0"
                          size={12}
                        />
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No starred messages yet
                  </p>
                )}
                {starredMessages.length > 10 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    +{starredMessages.length - 10} more
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 space-y-2">
            {/* Clear Chat */}
            <button
              onClick={onClearChat}
              className="w-full flex items-center gap-3 px-4 py-3 text-left bg-gray-50 dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition"
            >
              <FaTrash />
              <span className="font-medium">Clear Chat</span>
            </button>

            {/* Leave Group */}
            <button
              onClick={onLeaveGroup}
              className="w-full flex items-center gap-3 px-4 py-3 text-left bg-gray-50 dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition"
            >
              <FaSignOutAlt />
              <span className="font-medium">Leave Group</span>
            </button>
          </div>
        </div>
      </div>

      {/* Camera Dialog */}
      {showCameraDialog && (
        <>
          <button
            type="button"
            aria-label="Close camera dialog"
            className="fixed inset-0 bg-black/30 z-50"
            onClick={handleCloseCameraDialog}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl p-5">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                Use Camera
              </h3>

              <div className="rounded-lg overflow-hidden bg-black mb-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
              </div>

              {cameraError && (
                <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                  {cameraError}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseCameraDialog}
                  className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCaptureFromCamera}
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                >
                  Capture
                </button>
              </div>

              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default GroupDetailsPanel;
