import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FolderPlus,
  Users,
  CheckSquare2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function FloatingActionButton() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: "New Group",
      icon: <Users size={18} />,
      action: () => navigate("/dashboard/create-group"),
    },
    {
      label: "New Project",
      icon: <FolderPlus size={18} />,
      action: () => navigate("/dashboard/add-project"),
    },
    {
      label: "New Task",
      icon: <CheckSquare2 size={18} />,
      action: () => navigate("/dashboard/tasks"),
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-30">
      {/* Mini Buttons */}
      {isOpen && (
        <div className="mb-4 space-y-3 flex flex-col items-end animate-in fade-in slide-in-from-bottom-2">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                action.action();
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg backdrop-blur-md transition-all duration-200 group ${
                isDarkMode
                  ? "bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white"
                  : "bg-white/90 hover:bg-slate-50 text-slate-700 hover:text-slate-900"
              }`}
            >
              <span className="text-indigo-500">{action.icon}</span>
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 ${
          isDarkMode
            ? "bg-gradient-to-br from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white"
            : "bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
        }`}
      >
        <Plus
          size={24}
          className={`transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
        />
      </button>
    </div>
  );
}

export default FloatingActionButton;
