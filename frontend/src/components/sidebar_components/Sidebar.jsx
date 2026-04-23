import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen = true, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "My Profile", icon: "👤", path: "/dashboard/profile" },
    { name: "Group Chat", icon: "💬", path: "/dashboard/chat" },
    { name: "My Groups", icon: "👥", path: "/dashboard/groups" },
    { name: "Requests & Invites", icon: "📬", path: "/dashboard/requests" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl z-50 transition-all duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-56"
      }`}
    >
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-10 rounded-r-md bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors duration-200 flex items-center justify-center z-10"
        aria-label={isOpen ? "Hide sidebar" : "Show sidebar"}
      >
        <span className="text-xs">{isOpen ? "◀" : "▶"}</span>
      </button>

      {/* Logo Section */}
      <div
        className={`p-6 border-b border-slate-800 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
      >
        <h1 className="text-xl font-bold text-slate-100 whitespace-nowrap">
          UniGroup Finder
        </h1>
        <p className="text-xs text-slate-400 mt-1 whitespace-nowrap">
          Student Portal
        </p>
      </div>

      {/* Menu Items */}
      <nav
        className={`flex-1 py-4 px-3 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
      >
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full mb-1 px-4 py-2.5 flex items-center gap-3 rounded-lg border transition-all duration-200 hover:-translate-y-px ${
              isActive(item.path)
                ? "bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-cyan-400/20 border-indigo-400/40 text-slate-100 font-medium shadow-sm"
                : "border-transparent text-slate-300 hover:bg-slate-800/80 hover:border-slate-700 hover:text-slate-100 hover:shadow-sm font-normal"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm whitespace-nowrap">{item.name}</span>
          </button>
        ))}
      </nav>

      {/* User Info Section */}
      <div
        className={`px-4 py-4 border-t border-slate-800 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex items-center gap-3 mb-3 px-2 py-2 rounded-lg transition-all duration-200 hover:bg-slate-800/70 hover:shadow-sm">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xs font-semibold text-white overflow-hidden">
            {localStorage.getItem("userProfilePicture") ? (
              <img
                src={localStorage.getItem("userProfilePicture")}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                {localStorage.getItem("userFirstName")?.[0] || "D"}
                {localStorage.getItem("userLastName")?.[0] || "S"}
              </>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-100 truncate whitespace-nowrap">
              {localStorage.getItem("userFirstName") || "Demo"}{" "}
              {localStorage.getItem("userLastName") || "Student"}
            </p>
            <p className="text-xs text-slate-400 truncate whitespace-nowrap">
              {localStorage.getItem("userEmail") || "demo@university.edu"}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2.5 flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white rounded-lg transition-all duration-200 font-medium border border-slate-700 hover:-translate-y-px hover:shadow-sm"
        >
          <span className="text-base">🚪</span>
          <span className="text-sm whitespace-nowrap">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
