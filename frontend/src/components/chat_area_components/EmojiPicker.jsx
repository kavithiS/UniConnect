import React, { useRef, useEffect, useState } from "react";
import { FaSmile } from "react-icons/fa";

const EmojiPicker = ({ onEmojiSelect, onClose, show }) => {
  const pickerRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("smileys");

  // Emoji categories (WhatsApp-style organization)
  const emojiCategories = {
    smileys: {
      icon: "😊",
      label: "Smileys & People",
      emojis: [
        "😀",
        "😃",
        "😄",
        "😁",
        "😆",
        "😅",
        "🤣",
        "😂",
        "🙂",
        "🙃",
        "😉",
        "😊",
        "😇",
        "🥰",
        "😍",
        "🤩",
        "😘",
        "😗",
        "😚",
        "😙",
        "😋",
        "😛",
        "😜",
        "🤪",
        "😝",
        "🤑",
        "🤗",
        "🤭",
        "🤫",
        "🤔",
        "🤐",
        "🤨",
        "😐",
        "😑",
        "😶",
        "😏",
        "😒",
        "🙄",
        "😬",
        "🤥",
        "😌",
        "😔",
        "😪",
        "🤤",
        "😴",
        "😷",
        "🤒",
        "🤕",
        "🤢",
        "🤮",
        "🤧",
        "🥵",
        "🥶",
        "😎",
        "🤓",
        "🧐",
        "😕",
        "😟",
        "🙁",
        "☹️",
        "😮",
        "😯",
        "😲",
        "😳",
        "🥺",
        "😦",
        "😧",
        "😨",
        "😰",
        "😥",
        "😢",
        "😭",
        "😱",
        "😖",
        "😣",
        "😞",
        "😓",
        "😩",
        "😫",
        "🥱",
      ],
    },
    gestures: {
      icon: "👍",
      label: "Gestures & Body",
      emojis: [
        "👍",
        "👎",
        "👏",
        "🙌",
        "👐",
        "🤲",
        "🤝",
        "🙏",
        "✌️",
        "🤞",
        "🤟",
        "🤘",
        "🤙",
        "👈",
        "👉",
        "👆",
        "👇",
        "☝️",
        "👋",
        "🤚",
        "🖐",
        "✋",
        "🖖",
        "💪",
        "🦾",
        "🖕",
        "✍️",
        "🤳",
        "💅",
        "🦵",
        "🦿",
        "🦶",
        "👂",
        "🦻",
        "👃",
        "🧠",
        "🦷",
        "🦴",
        "👀",
        "👁️",
      ],
    },
    hearts: {
      icon: "❤️",
      label: "Hearts & Symbols",
      emojis: [
        "❤️",
        "🧡",
        "💛",
        "💚",
        "💙",
        "💜",
        "🖤",
        "🤍",
        "🤎",
        "💔",
        "❣️",
        "💕",
        "💞",
        "💓",
        "💗",
        "💖",
        "💘",
        "💝",
        "💟",
        "☮️",
        "✝️",
        "☪️",
        "🕉",
        "☸️",
        "✨",
        "🌟",
        "⭐",
        "💫",
        "⚡",
        "💥",
        "💢",
        "💯",
        "🔥",
        "💨",
        "💦",
        "💤",
        "🕳️",
        "💬",
        "👁️‍🗨️",
        "🗨️",
      ],
    },
    activities: {
      icon: "⚽",
      label: "Activities & Objects",
      emojis: [
        "⚽",
        "🏀",
        "🏈",
        "⚾",
        "🥎",
        "🎾",
        "🏐",
        "🏉",
        "🥏",
        "🎱",
        "🏓",
        "🏸",
        "🏒",
        "🏑",
        "🥍",
        "🏏",
        "🎯",
        "🎮",
        "🕹️",
        "🎲",
        "🎰",
        "🎳",
        "🎪",
        "🎭",
        "🎨",
        "🎬",
        "🎤",
        "🎧",
        "🎼",
        "🎹",
        "🥁",
        "🎷",
        "🎺",
        "🎸",
        "🎻",
        "🎉",
        "🎊",
        "🎈",
        "🎁",
        "🏆",
        "🥇",
        "🥈",
        "🥉",
        "🏅",
        "🎖️",
        "📱",
        "💻",
        "⌨️",
      ],
    },
    food: {
      icon: "🍕",
      label: "Food & Drink",
      emojis: [
        "🍕",
        "🍔",
        "🍟",
        "🌭",
        "🍿",
        "🧂",
        "🥓",
        "🥚",
        "🍳",
        "🧇",
        "🥞",
        "🧈",
        "🍞",
        "🥐",
        "🥨",
        "🥯",
        "🍰",
        "🎂",
        "🧁",
        "🥧",
        "🍦",
        "🍧",
        "🍨",
        "🍩",
        "🍪",
        "🌰",
        "🥜",
        "🍯",
        "🥛",
        "🍼",
        "☕",
        "🍵",
        "🧃",
        "🥤",
        "🧋",
        "🍺",
        "🍻",
        "🥂",
        "🍷",
        "🥃",
        "🍸",
        "🍹",
        "🧉",
        "🍾",
        "🍶",
        "🍴",
        "🥄",
        "🔪",
      ],
    },
    nature: {
      icon: "🌿",
      label: "Nature & Animals",
      emojis: [
        "🐶",
        "🐱",
        "🐭",
        "🐹",
        "🐰",
        "🦊",
        "🐻",
        "🐼",
        "🐨",
        "🐯",
        "🦁",
        "🐮",
        "🐷",
        "🐸",
        "🐵",
        "🐔",
        "🐧",
        "🐦",
        "🐤",
        "🦆",
        "🦅",
        "🦉",
        "🦇",
        "🐺",
        "🐗",
        "🐴",
        "🦄",
        "🐝",
        "🐛",
        "🦋",
        "🐌",
        "🐞",
        "🌸",
        "🌺",
        "🌻",
        "🌹",
        "🌷",
        "🌼",
        "🌱",
        "🌲",
        "🌳",
        "🌴",
        "🌵",
        "🌾",
        "🌿",
        "☘️",
        "🍀",
        "🍁",
        "🍂",
        "🍃",
        "🌍",
        "🌎",
        "🌏",
        "🌑",
        "☀️",
        "⭐",
      ],
    },
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [show, onClose]);

  if (!show) return null;

  const currentEmojis = emojiCategories[activeCategory].emojis;

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-96 z-50 overflow-hidden"
      style={{ maxHeight: "380px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <FaSmile className="text-yellow-500" />
          {emojiCategories[activeCategory].label}
        </h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl leading-none w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          ×
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-around px-2 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {Object.entries(emojiCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`text-2xl p-2 rounded-lg transition-all duration-200 ${
              activeCategory === key
                ? "bg-blue-50 dark:bg-blue-900/30 scale-110"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 opacity-60 hover:opacity-100"
            }`}
            title={category.label}
          >
            {category.icon}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div
        className="emoji-picker-scrollbar overflow-y-auto px-3 py-3"
        style={{ height: "260px" }}
      >
        <div className="grid grid-cols-8 gap-1">
          {currentEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onEmojiSelect(emoji);
                onClose();
              }}
              className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-all duration-150 hover:scale-125 transform active:scale-95"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmojiPicker;
