import React, { useEffect, useRef, useState } from "react";
import {
  FaReply,
  FaShare,
  FaStar,
  FaThumbtack,
  FaPen,
  FaTrash,
} from "react-icons/fa";

const MessageContextMenu = ({
  message,
  position,
  onReply,
  onForward,
  onStar,
  onPin,
  onEdit,
  onDelete,
  isOwnMessage,
  userStarred,
  onClose,
}) => {
  const { x, y } = position || { x: 0, y: 0 };
  const menuRef = useRef(null);
  const [safePosition, setSafePosition] = useState({ x, y });

  useEffect(() => {
    const updateSafePosition = () => {
      const menu = menuRef.current;
      if (!menu) {
        setSafePosition({ x, y });
        return;
      }

      const padding = 8;
      const menuRect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let nextX = x;
      let nextY = y;

      if (nextX + menuRect.width + padding > viewportWidth) {
        nextX = viewportWidth - menuRect.width - padding;
      }
      if (nextY + menuRect.height + padding > viewportHeight) {
        nextY = viewportHeight - menuRect.height - padding;
      }

      nextX = Math.max(padding, nextX);
      nextY = Math.max(padding, nextY);

      setSafePosition({ x: nextX, y: nextY });
    };

    updateSafePosition();
    window.addEventListener("resize", updateSafePosition);
    return () => window.removeEventListener("resize", updateSafePosition);
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-gray-700 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600 z-50 py-2 min-w-max"
      style={{
        left: `${safePosition.x}px`,
        top: `${safePosition.y}px`,
      }}
    >
      {/* Reply */}
      <button
        onClick={() => {
          onReply();
          onClose();
        }}
        className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
      >
        <FaReply className="text-blue-500" size={14} />
        <span className="text-sm">Reply</span>
      </button>

      {/* Forward */}
      <button
        onClick={() => {
          onForward();
          onClose();
        }}
        className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
      >
        <FaShare className="text-green-500" size={14} />
        <span className="text-sm">Forward</span>
      </button>

      {/* Star */}
      <button
        onClick={() => {
          onStar();
          onClose();
        }}
        className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
      >
        <FaStar
          className={userStarred ? "text-yellow-400" : "text-gray-400"}
          size={14}
        />
        <span className="text-sm">{userStarred ? "Unstar" : "Star"}</span>
      </button>

      {/* Pin */}
      <button
        onClick={() => {
          onPin();
          onClose();
        }}
        className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
      >
        <FaThumbtack
          className={message.isPinned ? "text-orange-500" : "text-gray-400"}
          size={14}
        />
        <span className="text-sm">{message.isPinned ? "Unpin" : "Pin"}</span>
      </button>

      {/* Edit (only for own messages) */}
      {isOwnMessage && (
        <button
          onClick={() => {
            onEdit();
            onClose();
          }}
          className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors border-t border-gray-200 dark:border-gray-600"
        >
          <FaPen className="text-purple-500" size={14} />
          <span className="text-sm">Edit</span>
        </button>
      )}

      {/* Delete */}
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
      >
        <FaTrash size={14} />
        <span className="text-sm">Delete</span>
      </button>
    </div>
  );
};

export default MessageContextMenu;
