import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * ThemeContext
 * Manages global dark/light mode state with localStorage persistence
 *
 * Usage in components:
 * const { isDark, toggleTheme } = useContext(ThemeContext);
 */
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Get saved theme preference from localStorage
    const savedTheme = localStorage.getItem("theme");
    const prefersDark =
      savedTheme === "dark" ||
      (!savedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    // Apply theme
    setIsDark(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setIsLoaded(true);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newValue = !prev;

      // Save to localStorage
      localStorage.setItem("theme", newValue ? "dark" : "light");

      // Update DOM
      if (newValue) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      return newValue;
    });
  };

  // Don't render children until theme is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export default ThemeContext;
