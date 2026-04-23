import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function Header({ user, onLogout }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleProfileClick = (action) => {
    setIsProfileOpen(false);
    if (action === "profile") {
      navigate("/dashboard/profile");
    } else if (action === "logout") {
      onLogout();
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      // TODO: Implement global search
      console.log("Search:", searchQuery);
      setSearchQuery("");
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 h-16 border-b backdrop-blur-md transition-colors duration-300 z-40 ${
        isDarkMode
          ? "bg-slate-950/80 border-slate-800"
          : "bg-white/80 border-slate-200"
      }`}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Logo (if needed, can be minimal) */}
        <div className="flex-1" />

        {/* Center: Search Bar */}
        <div className="flex-1 flex justify-center px-4">
          <div
            className={`w-96 flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
              isDarkMode
                ? "bg-slate-900/50 border-slate-700 focus-within:border-indigo-500"
                : "bg-slate-100/50 border-slate-300 focus-within:border-blue-500"
            }`}
          >
            <Search
              size={16}
              className={isDarkMode ? "text-slate-500" : "text-slate-400"}
            />
            <input
              type="text"
              placeholder="Search groups, projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className={`flex-1 bg-transparent outline-none text-sm ${
                isDarkMode
                  ? "text-white placeholder-slate-500"
                  : "text-slate-900 placeholder-slate-400"
              }`}
            />
          </div>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex-1 flex justify-end items-center gap-4">
          {/* Notifications Bell */}
          <button
            className={`p-2 rounded-lg transition-all duration-200 ${
              isDarkMode
                ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
            title="Notifications"
          >
            <Bell size={20} />
            {/* TODO: Add notification badge */}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                isDarkMode
                  ? "hover:bg-slate-800"
                  : "hover:bg-slate-100"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xs font-semibold text-white overflow-hidden`}
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    {(user?.fullName || user?.name || user?.email || "U")[0].toUpperCase()}
                    {(user?.fullName || user?.name || "").split(" ")[1]?.[0]?.toUpperCase() || ""}
                  </>
                )}
              </div>
              <ChevronDown
                size={16}
                className={isDarkMode ? "text-slate-400" : "text-slate-600"}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-lg border shadow-lg transition-colors duration-300 ${
                  isDarkMode
                    ? "bg-slate-900 border-slate-700"
                    : "bg-white border-slate-200"
                }`}
              >
                <div
                  className={`px-4 py-3 border-b ${
                    isDarkMode ? "border-slate-700" : "border-slate-200"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {user?.fullName || user?.email || "User"}
                  </p>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={() => handleProfileClick("profile")}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors duration-200 ${
                    isDarkMode
                      ? "hover:bg-slate-800 text-slate-300 hover:text-white"
                      : "hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <User size={16} />
                  My Profile
                </button>

                <button
                  onClick={() => setIsProfileOpen(false)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors duration-200 ${
                    isDarkMode
                      ? "hover:bg-slate-800 text-slate-300 hover:text-white"
                      : "hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <Settings size={16} />
                  Settings
                </button>

                <div
                  className={`border-t ${
                    isDarkMode ? "border-slate-700" : "border-slate-200"
                  }`}
                />

                <button
                  onClick={() => handleProfileClick("logout")}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors duration-200 ${
                    isDarkMode
                      ? "hover:bg-rose-900/30 text-rose-300 hover:text-rose-200"
                      : "hover:bg-rose-50 text-rose-600 hover:text-rose-700"
                  }`}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
