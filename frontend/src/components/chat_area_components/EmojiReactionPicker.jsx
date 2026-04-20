import React, { useRef, useEffect } from "react";

const EmojiReactionPicker = ({ onReactionSelect, onClose, position }) => {
  const pickerRef = useRef(null);

  // Quick reaction emojis (most commonly used in WhatsApp)
  const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🎉"];

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Calculate safe position (prevent going off-screen)
  const calculatePosition = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const pickerWidth = 320; // Approximate width of the picker
    const pickerHeight = 60; // Approximate height of the picker

    let x = position.x;
    let y = position.y;

    // Adjust horizontal position
    if (x + pickerWidth > windowWidth) {
      x = windowWidth - pickerWidth - 20;
    }

    // Adjust vertical position (show above the message if not enough space below)
    if (y + pickerHeight > windowHeight) {
      y = y - pickerHeight - 20;
    }

    return { x, y };
  };

  const safePosition = calculatePosition();

  return (
    <div
      ref={pickerRef}
      style={{
        position: "fixed",
        left: `${safePosition.x}px`,
        top: `${safePosition.y}px`,
        zIndex: 100,
      }}
      className="bg-white dark:bg-gray-800 rounded-full shadow-lg px-3 py-2 flex items-center gap-1 animate-fadeIn"
    >
      {quickReactions.map((emoji, index) => (
        <button
          key={index}
          onClick={() => {
            onReactionSelect(emoji);
            onClose();
          }}
          className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-150 hover:scale-125 transform"
          title={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiReactionPicker;
