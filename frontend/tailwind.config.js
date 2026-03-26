/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: "#1e293b",
          lighter: "#334155",
        },
      },
    },
  },
  plugins: [],
};
