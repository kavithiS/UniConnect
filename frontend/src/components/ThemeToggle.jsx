import React from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

/**
 * ThemeToggle Component
 * Displays a button to toggle between light and dark modes
 * Shows moon icon in light mode, sun icon in dark mode
 * Smooth transitions with hover effects
 */
const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`
        relative inline-flex items-center justify-center
        w-7 h-7 rounded-full
        transition-all duration-300 ease-in-out
        
        bg-gray-200 hover:bg-gray-300
        dark:bg-gray-700 dark:hover:bg-gray-600
        
        text-gray-800 dark:text-gray-200
        shadow-md hover:shadow-lg
        
        transform hover:scale-110
      `}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <FaSun
          size={14}
          className="text-yellow-400 transition-transform duration-300"
        />
      ) : (
        <FaMoon
          size={14}
          className="text-gray-800 transition-transform duration-300"
        />
      )}
    </button>
  );
};

export default ThemeToggle;
