/**
 * Demo User Configuration
 *
 * This file helps you set up demo user data in localStorage.
 * Open this file in your browser console or add to index.html
 */

// Set demo user data
const setDemoUser = () => {
  localStorage.setItem("userId", "demo-user-123");
  localStorage.setItem("userEmail", "demo@university.edu");
  localStorage.setItem("userFirstName", "Demo");
  localStorage.setItem("userLastName", "Student");
  console.log("✅ Demo user data set successfully!");
  console.log("User ID:", localStorage.getItem("userId"));
  console.log("Email:", localStorage.getItem("userEmail"));
};

// Clear all user data
const clearUserData = () => {
  localStorage.clear();
  console.log("🗑️ All user data cleared!");
};

// Check current user data
const showUserData = () => {
  console.log("👤 Current User Data:");
  console.log("User ID:", localStorage.getItem("userId"));
  console.log("Email:", localStorage.getItem("userEmail"));
  console.log("First Name:", localStorage.getItem("userFirstName"));
  console.log("Last Name:", localStorage.getItem("userLastName"));
};

// Export functions for use
if (typeof window !== "undefined") {
  window.setDemoUser = setDemoUser;
  window.clearUserData = clearUserData;
  window.showUserData = showUserData;

  console.log("📝 Demo User Utilities Loaded!");
  console.log("Available commands:");
  console.log("  - setDemoUser()    : Set demo user data");
  console.log("  - clearUserData()  : Clear all user data");
  console.log("  - showUserData()   : Show current user data");
}
