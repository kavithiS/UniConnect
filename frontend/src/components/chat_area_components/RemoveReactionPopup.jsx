import React from "react";
import { FaTimes } from "react-icons/fa";

const RemoveReactionPopup = ({ reaction, onRemove, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close remove reaction dialog"
        className="fixed inset-0 bg-black/30 z-50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl p-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span className="text-2xl">{reaction.emoji}</span>
            Remove Reaction
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to remove your reaction from this message?
          </p>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onRemove();
                onClose();
              }}
              className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 flex items-center gap-2"
            >
              <FaTimes size={14} />
              Remove
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RemoveReactionPopup;
