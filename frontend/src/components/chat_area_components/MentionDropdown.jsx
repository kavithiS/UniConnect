import React from "react";

const MentionDropdown = ({ members, position, onSelect, onClose }) => {
  const { x, y } = position || { x: 0, y: 0 };
  const getMemberName = (member) => {
    if (member?.name) return member.name;
    const fullName =
      `${member?.firstName || ""} ${member?.lastName || ""}`.trim();
    return fullName || member?.email || "Member";
  };

  return (
    <div
      className="mention-dropdown-scrollbar fixed bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-40 overflow-y-auto w-56"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {members && members.length > 0 ? (
        members.map((member) => (
          <button
            key={member._id}
            onClick={() => {
              onSelect(member);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
          >
            <div className="text-xs font-semibold truncate">
              @{getMemberName(member)}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
              {member.email}
            </div>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
          No members found
        </div>
      )}
    </div>
  );
};

export default MentionDropdown;
