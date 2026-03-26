import React from "react";
import ThemeToggle from "./ThemeToggle";

/**
 * Header Component
 * Modern floating header with theme toggle at top-right
 * Appears across all pages with a clean, minimal design
 */
const Header = () => {
  return (
    <header className="fixed top-0 right-0 z-40 p-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl dark:hover:shadow-3xl">
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
