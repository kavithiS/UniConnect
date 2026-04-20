import React from "react";

const ProfileCard = ({ profile, onEdit }) => {
  const formatDate = (date) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const InfoRow = ({ label, value }) => (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/50 transition-all duration-200 hover:-translate-y-px hover:shadow-sm dark:hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-500/30">
      <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-sm text-slate-900 dark:text-gray-200">
        {value || (
          <span className="text-slate-400 dark:text-gray-500 italic">
            Not specified
          </span>
        )}
      </p>
    </div>
  );

  const SectionTitle = ({ title }) => (
    <h3 className="text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wide mb-3">
      {title}
    </h3>
  );

  const NameBadge = ({ value }) => {
    if (!value) {
      return null;
    }

    return (
      <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded text-xs font-medium border border-indigo-100 dark:border-indigo-500/30">
        {value}
      </span>
    );
  };

  const AcademicProgress =
    profile?.currentYear && profile?.currentSemester
      ? `Year ${profile.currentYear}, Semester ${profile.currentSemester}`
      : null;

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-indigo-50/20 dark:from-gray-800 dark:via-gray-800/70 dark:to-indigo-900/20 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 mb-6 shadow-sm dark:shadow-lg transition-all duration-200 hover:shadow-md dark:hover:shadow-xl">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-gray-700">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold overflow-hidden border-2 border-slate-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md dark:hover:shadow-lg">
          {profile?.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt={`${profile?.firstName} ${profile?.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              {profile?.firstName?.[0]?.toUpperCase() || "S"}
              {profile?.lastName?.[0]?.toUpperCase() || "P"}
            </>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100 mb-1">
            {profile?.firstName} {profile?.lastName}
          </h2>
          <p className="text-sm text-slate-600 dark:text-gray-400 mb-2">
            {profile?.email}
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
            <NameBadge value="Active" />
            <NameBadge value="Student" />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <SectionTitle title="Basic Information" />
        <div className="grid md:grid-cols-2 gap-3">
          <InfoRow label="Birthday" value={formatDate(profile?.birthday)} />
          <InfoRow label="University" value={profile?.university} />
          <InfoRow label="Degree Program" value={profile?.degree} />
          <InfoRow label="Academic Progress" value={AcademicProgress} />
          <InfoRow
            label="Current GPA"
            value={profile?.gpa ? profile.gpa.toFixed(2) : null}
          />
        </div>
      </div>

      <div className="mb-6 p-4 bg-white/80 dark:bg-gray-800/50 rounded-xl border border-slate-200 dark:border-gray-700 transition-all duration-200 hover:-translate-y-px hover:shadow-sm dark:hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-500/30">
        <SectionTitle title="About" />
        <p className="text-sm text-slate-800 dark:text-gray-300 leading-relaxed">
          {profile?.bio || (
            <span className="text-slate-400 dark:text-gray-500 italic">
              No profile summary added yet.
            </span>
          )}
        </p>
      </div>

      <div className="mb-6">
        <SectionTitle title="Skills" />
        <TagsDisplay items={profile?.skills} />
      </div>

      <div>
        <SectionTitle title="Interests" />
        <TagsDisplay items={profile?.interests} />
      </div>

      {/* Edit Profile Button */}
      {onEdit && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-gray-700">
          <button
            onClick={onEdit}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-700 dark:to-blue-700 hover:from-indigo-700 hover:to-blue-700 dark:hover:from-indigo-600 dark:hover:to-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-xl"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

const TagsDisplay = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <span className="text-slate-400 dark:text-gray-500 italic text-sm">
        None added yet
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((item, index) => (
        <span
          key={index}
          className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-900/30 dark:to-cyan-900/30 text-indigo-800 dark:text-indigo-400 rounded-md text-xs font-medium border border-indigo-200 dark:border-indigo-500/30 transition-all duration-200 hover:-translate-y-px hover:shadow-sm dark:hover:shadow-lg hover:from-indigo-200 dark:hover:from-indigo-800 hover:to-cyan-200 dark:hover:to-cyan-800"
        >
          {item}
        </span>
      ))}
    </div>
  );
};

export default ProfileCard;
