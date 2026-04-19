import React, { useState } from "react";
import { groupAPI } from "../api/api";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const CreateGroupPage = () => {
  const { isDarkMode } = useTheme();
  const MIN_TITLE_LENGTH = 3;
  const MIN_DESCRIPTION_LENGTH = 10;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    memberLimit: 5,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "memberLimit" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Validate
      const trimmedTitle = formData.title.trim();
      const trimmedDescription = formData.description.trim();

      if (!trimmedTitle || !trimmedDescription || !formData.memberLimit) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      if (trimmedTitle.length < MIN_TITLE_LENGTH) {
        setError(
          `Group title must be at least ${MIN_TITLE_LENGTH} characters long.`,
        );
        setLoading(false);
        return;
      }

      if (trimmedDescription.length < MIN_DESCRIPTION_LENGTH) {
        setError(
          `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters long.`,
        );
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        title: trimmedTitle,
        description: trimmedDescription,
        requiredSkills: formData.requiredSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill),
      };

      const response = await groupAPI.create(payload);
      const createdGroup = response.data.data;
      const groupObjectId = createdGroup._id;
      const rawGroupId = createdGroup.groupCode;
      const formattedGroupId = rawGroupId?.startsWith("IT100-")
        ? rawGroupId
        : rawGroupId
          ? `IT100-${rawGroupId.replace(/^IT100-/, "").toUpperCase()}`
          : "IT100-UNKNOWN";
      if (groupObjectId) {
        localStorage.setItem("activeGroupId", groupObjectId);
      }
      setSuccess(
        `✅ Group created successfully! Your Group ID is: ${formattedGroupId}`,
      );

      setTimeout(() => {
        globalThis.location.href = "/dashboard/groups";
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen p-6 ${isDarkMode ? "bg-gradient-to-br from-slate-950 to-slate-900" : "bg-gradient-to-br from-slate-50 to-slate-100"}`}
    >
      {/* Header */}
      <div className="mb-8">
        <a
          href="/dashboard/groups"
          className={`flex items-center gap-2 mb-4 hover:opacity-80 transition ${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Groups
        </a>
        <h1
          className={`text-4xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          Create New Group
        </h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
          Set up a new collaboration group
        </p>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl mx-auto">
        <div
          className={`border rounded-lg p-8 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
        >
          {error && (
            <div
              className={`mb-6 p-4 border rounded-lg ${isDarkMode ? "bg-red-500/20 border-red-500 text-red-300" : "bg-red-100 border-red-300 text-red-700"}`}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className={`mb-6 p-4 border rounded-lg ${isDarkMode ? "bg-green-500/20 border-green-500 text-green-300" : "bg-green-100 border-green-300 text-green-700"}`}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-6">
              <label
                className={`block font-semibold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Group Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Web Development Team"
                className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition border ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-slate-100 border-slate-300 text-slate-900"}`}
                required
              />
              <p
                className={`text-sm mt-2 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                Minimum {MIN_TITLE_LENGTH} characters.
              </p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label
                className={`block font-semibold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your group's purpose and goals..."
                rows="5"
                className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition resize-none border ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-slate-100 border-slate-300 text-slate-900"}`}
                required
              />
              <p
                className={`text-sm mt-2 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                Minimum {MIN_DESCRIPTION_LENGTH} characters.
              </p>
            </div>

            {/* Required Skills */}
            <div className="mb-6">
              <label
                className={`block font-semibold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Required Skills
              </label>
              <input
                type="text"
                name="requiredSkills"
                value={formData.requiredSkills}
                onChange={handleChange}
                placeholder="e.g., React, Node.js, MongoDB (comma-separated)"
                className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition border ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-slate-100 border-slate-300 text-slate-900"}`}
              />
              <p
                className={`text-sm mt-2 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                Separate skills with commas
              </p>
            </div>

            {/* Member Limit */}
            <div className="mb-6">
              <label
                className={`block font-semibold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Member Limit *
              </label>
              <input
                type="number"
                name="memberLimit"
                value={formData.memberLimit}
                onChange={handleChange}
                min="1"
                max="100"
                className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition border ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-slate-100 border-slate-300 text-slate-900"}`}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition ${
                loading
                  ? isDarkMode
                    ? "bg-slate-600 cursor-not-allowed"
                    : "bg-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              }`}
            >
              {loading ? "Creating Group..." : "Create Group"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPage;
