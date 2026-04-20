import React from "react";
import {
  FaStar,
  FaThumbtack,
  FaReply,
  FaLink,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileArchive,
  FaFileCode,
  FaFileAlt,
  FaFile,
  FaDownload,
} from "react-icons/fa";
import { getBackendBaseUrl } from "../../utils/backendUrl";

const FILE_BASE_URL = getBackendBaseUrl();

const MessageItem = ({
  message,
  repliedMessage,
  isOwnMessage,
  currentUserId,
  isMobilePreview = false,
  onContextMenu,
  onClick,
  onReactionClick,
}) => {
  const userStarred = message.starredBy?.some(
    (star) => star.userId === currentUserId,
  );

  // Detect URLs in message text
  const detectLinks = (text) => {
    if (!text) return [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex) || [];
    return [...new Set(matches)]; // Remove duplicates
  };

  const messageLinks = detectLinks(message.text);

  // Render text with clickable links
  const renderTextWithLinks = () => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = message.text.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="underline text-blue-300 hover:text-blue-100 transition"
            title={part}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Get file icon and info based on file extension
  const getFileInfo = (fileName) => {
    if (!fileName)
      return {
        icon: FaFile,
        color: "text-gray-500",
        bgColor: "bg-gray-100 dark:bg-gray-700",
      };

    const extension = fileName.split(".").pop()?.toLowerCase();

    const fileTypes = {
      // Documents
      pdf: {
        icon: FaFilePdf,
        color: "text-red-600",
        bgColor: "bg-red-50 dark:bg-red-900/20",
      },
      doc: {
        icon: FaFileWord,
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      },
      docx: {
        icon: FaFileWord,
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      },
      xls: {
        icon: FaFileExcel,
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20",
      },
      xlsx: {
        icon: FaFileExcel,
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20",
      },
      ppt: {
        icon: FaFilePowerpoint,
        color: "text-orange-600",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
      },
      pptx: {
        icon: FaFilePowerpoint,
        color: "text-orange-600",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
      },
      txt: {
        icon: FaFileAlt,
        color: "text-gray-600",
        bgColor: "bg-gray-50 dark:bg-gray-700",
      },

      // Archives
      zip: {
        icon: FaFileArchive,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      },
      rar: {
        icon: FaFileArchive,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      },
      "7z": {
        icon: FaFileArchive,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      },
      tar: {
        icon: FaFileArchive,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      },
      gz: {
        icon: FaFileArchive,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      },

      // Code files
      js: {
        icon: FaFileCode,
        color: "text-yellow-500",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      },
      jsx: {
        icon: FaFileCode,
        color: "text-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      },
      ts: {
        icon: FaFileCode,
        color: "text-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      },
      tsx: {
        icon: FaFileCode,
        color: "text-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      },
      py: {
        icon: FaFileCode,
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      },
      java: {
        icon: FaFileCode,
        color: "text-red-600",
        bgColor: "bg-red-50 dark:bg-red-900/20",
      },
      cpp: {
        icon: FaFileCode,
        color: "text-blue-700",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      },
      c: {
        icon: FaFileCode,
        color: "text-blue-700",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      },
      html: {
        icon: FaFileCode,
        color: "text-orange-600",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
      },
      css: {
        icon: FaFileCode,
        color: "text-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      },
      json: {
        icon: FaFileCode,
        color: "text-gray-600",
        bgColor: "bg-gray-50 dark:bg-gray-700",
      },
      xml: {
        icon: FaFileCode,
        color: "text-orange-500",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
      },
    };

    return (
      fileTypes[extension] || {
        icon: FaFile,
        color: "text-gray-500",
        bgColor: "bg-gray-100 dark:bg-gray-700",
      }
    );
  };

  // Get first letter of sender's name for avatar
  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  // Generate a color based on the sender's name
  const getAvatarColor = (name) => {
    if (!name) return "bg-gray-500";
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = name.codePointAt(0) % colors.length;
    return colors[index];
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) {
      return formatTime(date);
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${formatTime(date)}`;
    } else {
      return msgDate.toLocaleDateString([], {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // Group reactions by emoji and count them
  const groupedReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return [];

    const grouped = {};
    message.reactions.forEach((reaction) => {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: [],
          hasCurrentUser: false,
        };
      }
      grouped[reaction.emoji].count++;
      grouped[reaction.emoji].users.push(reaction.userName);
      if (reaction.userId === currentUserId) {
        grouped[reaction.emoji].hasCurrentUser = true;
      }
    });

    return Object.values(grouped);
  };

  const reactions = groupedReactions();
  const bubbleBaseClass =
    "relative w-fit max-w-[70%] px-4 py-2 rounded-2xl rounded-tl-none shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer box-border overflow-x-hidden [overflow-wrap:anywhere] break-words";

  const bubbleToneClass = isOwnMessage
    ? "bg-blue-500 dark:bg-blue-600 text-white"
    : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white";

  const bubbleClassName = `${bubbleBaseClass} ${bubbleToneClass} ${message.isDeleted ? "italic opacity-60" : ""} ${!message.isDeleted && reactions.length > 0 ? "pb-7" : ""}`;

  return (
    <div
      className={`w-full flex gap-2 mb-2 group ${
        isOwnMessage ? "justify-end" : "justify-start"
      } max-w-full box-border`}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu({
          message,
          isOwnMessage,
          position: { x: e.clientX, y: e.clientY },
        });
      }}
    >
      {/* Profile Picture/Initial - Only for other users' messages */}
      {!isOwnMessage && (
        <div className="flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-lg ${getAvatarColor(
              message.senderName,
            )}`}
          >
            {message.profilePicture ? (
              <img
                src={message.profilePicture}
                alt={message.senderName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitial(message.senderName)
            )}
          </div>
        </div>
      )}

      {/* Main Message Bubble */}
      <div
        className={`w-full min-w-0 flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
      >
        {/* Sender Name - Only for other users' messages */}
        {!isOwnMessage && (
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 ml-1">
            {message.senderName}
          </p>
        )}

        <div
          onClick={(e) => {
            // Only trigger on direct left-click, not right-click
            if (e.button === 0) {
              onClick({
                message,
                position: { x: e.clientX, y: e.clientY },
              });
            }
          }}
          className={`${bubbleClassName} ${isMobilePreview ? "w-fit max-w-[68%]" : ""}`}
        >
          {/* Forwarded Tag */}
          {!message.isDeleted && message.isForwarded && (
            <div className="mb-1.5">
              <span className="text-sm opacity-70 italic">⤷ Forwarded</span>
            </div>
          )}

          {/* Reply Preview */}
          {!message.isDeleted && message.replyTo && (
            <div
              className={`mb-2 px-3 py-2 rounded-xl border-l-4 ${
                isOwnMessage
                  ? "bg-blue-400/15 border-blue-300/70 dark:bg-blue-950/25 dark:border-blue-300/60"
                  : "bg-gray-100/80 border-blue-400/70 dark:bg-gray-800 dark:border-blue-400/60"
              }`}
            >
              <p className="text-[11px] font-semibold opacity-90 leading-tight">
                {repliedMessage?.senderName || "Replying to message"}
              </p>
              <p className="text-[11px] opacity-80 line-clamp-2 leading-snug">
                {repliedMessage?.text || "Original message unavailable"}
              </p>
            </div>
          )}

          {/* Mention Badge */}
          {!message.isDeleted &&
            message.mentions &&
            message.mentions.length > 0 && (
              <div className="text-xs mb-1 opacity-80 flex flex-wrap gap-1">
                {message.mentions.map((mention) => (
                  <span
                    key={mention.userId}
                    className={`px-2 py-0.5 rounded-full ${
                      isOwnMessage
                        ? "bg-blue-400 text-blue-100"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    @{mention.userName}
                  </span>
                ))}
              </div>
            )}

          {/* Message Text and Link Icon */}
          <div className="flex items-end gap-2">
            <p
              className={`text-sm leading-relaxed break-words flex-1 ${
                message.isEdited ? "text-xs opacity-90" : ""
              } [overflow-wrap:anywhere]`}
            >
              {renderTextWithLinks()}
            </p>
            {messageLinks.length > 0 && (
              <FaLink
                className={`flex-shrink-0 ${isOwnMessage ? "text-blue-200" : "text-gray-500 dark:text-gray-400"}`}
                size={12}
              />
            )}
          </div>

          {/* File Preview */}
          {message.fileUrl && !message.isDeleted && (
            <div className="mt-2">
              {(() => {
                const isImageFile = message.fileType?.startsWith("image/");
                const isAudioFile =
                  message.fileType?.toLowerCase().startsWith("audio/") ||
                  /\.(mp3|wav|ogg|m4a|webm|aac)$/i.test(message.fileName || "");

                if (isImageFile) {
                  return (
                    <a
                      href={`${FILE_BASE_URL}${message.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Open full image"
                    >
                      <img
                        src={`${FILE_BASE_URL}${message.fileUrl}`}
                        alt={message.fileName}
                        className="max-w-full rounded-lg max-h-48 cursor-pointer"
                      />
                    </a>
                  );
                }

                if (isAudioFile) {
                  return (
                    <div
                      className="rounded-xl p-2"
                      onClick={(e) => e.stopPropagation()}
                      onDoubleClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <audio
                          controls
                          preload="metadata"
                          src={`${FILE_BASE_URL}${message.fileUrl}`}
                          className={`w-full ${isMobilePreview ? "min-w-0 max-w-full" : "min-w-[320px] max-w-[480px]"}`}
                        >
                          <track kind="captions" />
                        </audio>
                        <div className="h-6 flex items-end gap-1 flex-shrink-0">
                          {[8, 14, 10, 16, 9, 13].map((height, index) => (
                            <span
                              key={`wave-${height}`}
                              className="w-1 rounded-full opacity-60 animate-pulse"
                              style={{
                                height: `${height}px`,
                                backgroundColor: isOwnMessage
                                  ? "rgb(59, 130, 246)"
                                  : "rgb(107, 114, 128)",
                                animationDelay: `${index * 0.12}s`,
                                animationDuration: "0.9s",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Modern file display with icon and extension
                const fileInfo = getFileInfo(message.fileName);
                const FileIcon = fileInfo.icon;

                return (
                  <a
                    href={`${FILE_BASE_URL}${message.fileUrl}`}
                    download={message.fileName}
                    onClick={(e) => e.stopPropagation()}
                    className={`flex items-center gap-3 p-3 rounded-xl max-w-xs transition-all hover:opacity-80 ${
                      isOwnMessage
                        ? "bg-blue-400/15 dark:bg-blue-900/20"
                        : "bg-white/60 dark:bg-gray-800/60"
                    }`}
                    title="Click to View"
                  >
                    {/* File Icon */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${fileInfo.bgColor}`}
                    >
                      <FileIcon className={`text-2xl ${fileInfo.color}`} />
                    </div>

                    {/* File Details */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium text-sm truncate ${
                          isOwnMessage
                            ? "text-white"
                            : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {message.fileName}
                      </div>
                      <div
                        className={`text-xs mt-0.5 ${
                          isOwnMessage
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {message.fileName?.split(".").pop()?.toUpperCase()} File
                      </div>
                    </div>

                    {/* Download Icon - show only for received messages */}
                    {!isOwnMessage && (
                      <div className="flex-shrink-0">
                        <FaDownload className="text-sm text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </a>
                );
              })()}
            </div>
          )}

          {/* Edit Info */}
          {!message.isDeleted && message.isEdited && (
            <p className="text-xs mt-1 opacity-75 italic">(edited)</p>
          )}

          {/* Timestamp */}
          <p className="text-xs mt-1 opacity-75">
            {formatDate(message.createdAt)}
          </p>

          {/* Reactions Display (inside bubble, bottom-right) */}
          {!message.isDeleted && reactions.length > 0 && (
            <div className="absolute bottom-1 right-2 flex gap-1">
              {reactions.map((reaction, index) => (
                <div
                  key={index}
                  onClick={(e) => {
                    // Only allow clicking if current user reacted
                    if (reaction.hasCurrentUser && onReactionClick) {
                      e.stopPropagation();
                      onReactionClick({
                        reaction,
                        message,
                      });
                    }
                  }}
                  className={`flex items-center gap-0.5 px-1 py-0.5 rounded-full text-xs shadow border transition-all duration-200 ${
                    reaction.hasCurrentUser
                      ? "bg-white/95 dark:bg-gray-800/95 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      : "bg-white/95 dark:bg-gray-800/95"
                  }`}
                  title={reaction.users.join(", ")}
                >
                  <span className="text-sm leading-none">{reaction.emoji}</span>
                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-200 leading-none">
                    {reaction.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Actions (shown on hover) */}
      {!isMobilePreview && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Star Count */}
          {message.starredBy && message.starredBy.length > 0 && (
            <div
              className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-xs ${
                userStarred
                  ? "bg-yellow-200 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              <FaStar size={12} />
              <span>{message.starredBy.length}</span>
            </div>
          )}

          {/* Pin Badge */}
          {message.isPinned && (
            <div className="flex items-center gap-0.5 px-2 py-1 rounded-full text-xs bg-orange-200 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
              <FaThumbtack size={12} />
            </div>
          )}

          {/* Reply Count */}
          {message.replies && message.replies.length > 0 && (
            <div className="flex items-center gap-0.5 px-2 py-1 rounded-full text-xs bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
              <FaReply size={12} />
              <span>{message.replies.length}</span>
            </div>
          )}
        </div>
      )}

      {isOwnMessage && (
        <div className="flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-lg ${getAvatarColor(
              message.senderName,
            )}`}
          >
            {message.profilePicture ? (
              <img
                src={message.profilePicture}
                alt={message.senderName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitial(message.senderName)
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageItem;
