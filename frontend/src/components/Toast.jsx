import React from "react";

const Toast = ({ message, type = "success", onClose }) => {
  const icons = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
    warning: "⚠️",
  };

  const colors = {
    success: "bg-green-600 dark:bg-green-700",
    error: "bg-red-600 dark:bg-red-700",
    info: "bg-blue-600 dark:bg-blue-700",
    warning: "bg-yellow-600 dark:bg-yellow-700",
  };

  return (
    <div
      className={`fixed top-6 right-6 max-w-md ${colors[type]} text-white px-5 py-3 rounded-lg shadow-lg dark:shadow-2xl flex items-center gap-3 animate-slide-in-right z-50`}
    >
      <span className="text-xl">{icons[type]}</span>
      <div className="flex-1">
        <p className="font-medium text-sm">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 dark:hover:text-gray-300 transition-colors duration-200 text-xl font-bold"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
