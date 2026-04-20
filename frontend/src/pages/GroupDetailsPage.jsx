import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { groupAPI, recommendationAPI, invitationAPI } from "../api/api";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { fetchCurrentUser, getAuthToken } from "../services/authService";
import { getMockGroupById, isMockGroupId } from "../data/mockGroups";
import { leaveGroup } from "../services/chatService";

const CHAT_PREVIEW_ANIMATION_MS = 320;

const GroupDetailsPage = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentUserId, setCurrentUserId] = useState(
    localStorage.getItem("userId") ||
      localStorage.getItem("currentUserId") ||
      "",
  );
  const [group, setGroup] = useState(null);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [invitedUsers, setInvitedUsers] = useState(new Set());
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState(null);
  const [isChatPreviewOpen, setIsChatPreviewOpen] = useState(false);
  const [isChatPreviewVisible, setIsChatPreviewVisible] = useState(false);
  const [isChatIframeLoading, setIsChatIframeLoading] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  useEffect(() => {
    const resolveCurrentUserId = async () => {
      if (currentUserId) return;

      const token = getAuthToken();
      if (!token) return;

      try {
        const me = await fetchCurrentUser(token);
        const resolvedId = me?._id || me?.id || "";
        if (resolvedId) {
          localStorage.setItem("userId", resolvedId);
          localStorage.setItem("currentUserId", resolvedId);
          setCurrentUserId(resolvedId);
        }
      } catch (err) {
        console.warn("Could not resolve current user in group details", err);
      }
    };

    resolveCurrentUserId();
  }, [currentUserId]);

  useEffect(() => {
    if (!isChatPreviewOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsChatPreviewVisible(false);
      }
    };

    const handlePreviewCloseMessage = (event) => {
      if (event.origin !== globalThis.location.origin) {
        return;
      }

      if (event.data?.type === "close-group-chat-preview") {
        setIsChatPreviewVisible(false);
      }
    };

    globalThis.addEventListener("keydown", handleEscape);
    globalThis.addEventListener("message", handlePreviewCloseMessage);

    return () => {
      document.body.style.overflow = previousOverflow;
      globalThis.removeEventListener("keydown", handleEscape);
      globalThis.removeEventListener("message", handlePreviewCloseMessage);
    };
  }, [isChatPreviewOpen]);

  useEffect(() => {
    if (isChatPreviewVisible) {
      return undefined;
    }

    if (!isChatPreviewOpen) {
      return undefined;
    }

    const timeoutId = globalThis.setTimeout(() => {
      setIsChatPreviewOpen(false);
    }, CHAT_PREVIEW_ANIMATION_MS);

    return () => globalThis.clearTimeout(timeoutId);
  }, [isChatPreviewOpen, isChatPreviewVisible]);

  const fetchGroupDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isMockGroupId(id)) {
        const mockGroup = getMockGroupById(id);
        if (!mockGroup) {
          setError("Group not found");
          return;
        }

        setGroup(mockGroup);
        setRecommendedUsers(mockGroup.recommendations || []);
        return;
      }

      const groupResponse = await groupAPI.getById(id);
      setGroup(groupResponse.data.data);

      const usersResponse = await recommendationAPI.getUsersForGroup(id);
      setRecommendedUsers(usersResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch group details");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (userId) => {
    try {
      await invitationAPI.send({
        studentId: userId,
        groupId: id,
        message: `You are invited to join ${group.title}`,
      });
      setInvitedUsers((prev) => new Set(prev).add(userId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send invitation");
    }
  };

  const normalizeMemberId = (member) => {
    if (!member) return "";
    if (typeof member === "string") return member;
    return member._id || "";
  };

  const normalizeCreatedById = (createdBy) => {
    if (!createdBy) return "";
    if (typeof createdBy === "string") return createdBy;
    return createdBy._id || "";
  };

  const isCurrentUserCreator = group
    ? normalizeCreatedById(group.createdBy)?.toString() ===
      currentUserId.toString()
    : false;

  const isCurrentUserMember = group
    ? (group.members || []).some(
        (member) =>
          normalizeMemberId(member)?.toString() === currentUserId.toString(),
      )
    : false;

  const canOpenChat = isCurrentUserMember || isCurrentUserCreator;

  const handleJoinGroup = async () => {
    setJoinError(null);

    let resolvedUserId = currentUserId;
    if (!resolvedUserId) {
      const token = getAuthToken();
      if (token) {
        try {
          const me = await fetchCurrentUser(token);
          resolvedUserId = me?._id || me?.id || "";
          if (resolvedUserId) {
            localStorage.setItem("userId", resolvedUserId);
            localStorage.setItem("currentUserId", resolvedUserId);
            setCurrentUserId(resolvedUserId);
          }
        } catch (err) {
          console.warn("Could not resolve user during join from details", err);
        }
      }
    }

    if (!resolvedUserId) {
      setJoinError(
        "Unable to join group: missing user session. Please sign in again.",
      );
      return;
    }

    setJoinLoading(true);
    try {
      if (isMockGroupId(id)) {
        const mockGroup = getMockGroupById(id);
        if (mockGroup) {
          const nextMembers = [
            ...(mockGroup.members || []),
            {
              _id: resolvedUserId,
              name:
                localStorage.getItem("userFirstName") ||
                localStorage.getItem("userName") ||
                "Current User",
              role: "Member",
              skills: [],
            },
          ];

          setGroup({ ...mockGroup, members: nextMembers });
          localStorage.setItem("activeGroupId", id);
          globalThis.dispatchEvent(new Event("group-membership-changed"));
          return;
        }
      }

      await groupAPI.joinGroup(id, { userId: resolvedUserId });
      localStorage.setItem("activeGroupId", id);
      globalThis.dispatchEvent(new Event("group-membership-changed"));
      await fetchGroupDetails();
    } catch (err) {
      setJoinError(err.response?.data?.message || "Failed to join group");
    } finally {
      setJoinLoading(false);
    }
  };

  const clearGroupSession = () => {
    localStorage.removeItem("activeGroupId");
    setGroup(null);
    setRecommendedUsers([]);
    setInvitedUsers(new Set());
    setActiveTab("details");
  };

  const handleLeaveGroup = async () => {
    if (
      !globalThis.confirm(
        "Are you sure you want to leave this group? You will no longer be able to view its chat or details.",
      )
    ) {
      return;
    }

    setLeaveError(null);
    setLeaveLoading(true);

    try {
      if (isMockGroupId(id)) {
        clearGroupSession();
        navigate("/dashboard/groups");
        return;
      }

      const memberId =
        currentUserId ||
        localStorage.getItem("userId") ||
        localStorage.getItem("currentUserId");

      if (!memberId) {
        setLeaveError(
          "Unable to leave group: missing user session. Please sign in again.",
        );
        return;
      }

      await leaveGroup(id, memberId);
      clearGroupSession();
      globalThis.dispatchEvent(new Event("group-membership-changed"));
      navigate("/dashboard/groups");
    } catch (err) {
      setLeaveError(err.response?.data?.message || "Failed to leave group");
    } finally {
      setLeaveLoading(false);
    }
  };

  const handleOpenChat = () => {
    localStorage.setItem("activeGroupId", id);
    setIsChatIframeLoading(true);
    setIsChatPreviewOpen(true);
    globalThis.requestAnimationFrame(() => {
      setIsChatPreviewVisible(true);
    });
  };

  const handleCloseChatPreview = () => {
    setIsChatPreviewVisible(false);
  };

  if (loading)
    return (
      <div
        className={`p-6 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
      >
        Loading...
      </div>
    );
  if (error)
    return (
      <div className={`p-6 ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
        {error}
      </div>
    );
  if (!group)
    return (
      <div
        className={`p-6 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
      >
        Group not found
      </div>
    );

  const memberPercentage = (group.members.length / group.memberLimit) * 100;

  return (
    <div className="relative min-h-screen">
      <div
        className={`min-h-screen p-6 transition-all duration-300 ${isDarkMode ? "bg-gradient-to-br from-slate-950 to-slate-900" : "bg-gradient-to-br from-slate-50 to-slate-100"} ${isChatPreviewOpen ? "select-none" : ""}`}
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
            {group.title}
          </h1>
          <p
            className={`mt-2 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
          >
            {group.description}
          </p>
          {canOpenChat ? (
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={handleOpenChat}
                className="px-5 py-2.5 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition"
              >
                Open Group Chat
              </button>
              <button
                onClick={handleLeaveGroup}
                disabled={leaveLoading}
                className={`px-5 py-2.5 rounded-lg font-semibold text-white transition ${leaveLoading ? "bg-red-500/60 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
              >
                {leaveLoading ? "Leaving..." : "Leave Group"}
              </button>
              {leaveError && (
                <p
                  className={`w-full text-sm ${isDarkMode ? "text-red-400" : "text-red-600"}`}
                >
                  {leaveError}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-5">
              <button
                onClick={handleJoinGroup}
                disabled={joinLoading}
                className={`px-5 py-2.5 rounded-lg font-semibold text-white transition ${joinLoading ? "bg-blue-500/60 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {joinLoading ? "Joining..." : "Join Group"}
              </button>
              {joinError && (
                <p
                  className={`mt-2 text-sm ${isDarkMode ? "text-red-400" : "text-red-600"}`}
                >
                  {joinError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Group Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className={`border rounded-lg p-6 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
          >
            <p
              className={`text-sm mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
            >
              Members
            </p>
            <div className="flex items-end justify-between">
              <p
                className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                {group.members.length}/{group.memberLimit}
              </p>
              <div
                className={`w-24 h-2 rounded-full overflow-hidden ${isDarkMode ? "bg-slate-700" : "bg-slate-300"}`}
              >
                <div
                  className={`h-full transition-all ${
                    memberPercentage > 75
                      ? "bg-red-500"
                      : memberPercentage > 50
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(memberPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div
            className={`border rounded-lg p-6 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
          >
            <p
              className={`text-sm mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
            >
              Status
            </p>
            <p
              className={`text-2xl font-bold capitalize ${
                group.status === "active"
                  ? "text-green-500"
                  : group.status === "closed"
                    ? "text-yellow-500"
                    : "text-slate-500"
              }`}
            >
              {group.status}
            </p>
          </div>

          <div
            className={`border rounded-lg p-6 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
          >
            <p
              className={`text-sm mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
            >
              Required Skills
            </p>
            <p
              className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              {group.requiredSkills.length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div
          className={`flex gap-4 mb-6 border-b ${isDarkMode ? "border-slate-700" : "border-slate-300"}`}
        >
          {["details", "members", "recommendations"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold transition border-b-2 ${
                activeTab === tab
                  ? isDarkMode
                    ? "border-blue-500 text-blue-400"
                    : "border-blue-600 text-blue-600"
                  : isDarkMode
                    ? "border-transparent text-slate-400 hover:text-white"
                    : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab === "details"
                ? "Details"
                : tab === "members"
                  ? "Members"
                  : "Recommended"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          className={`border rounded-lg p-6 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
        >
          {/* Details Tab */}
          {activeTab === "details" && (
            <div>
              <h2
                className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Required Skills
              </h2>
              <div className="flex gap-2 flex-wrap">
                {group.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className={`px-4 py-2 rounded-lg ${isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-200 text-blue-700"}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <div>
              <h2
                className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Group Members
              </h2>
              {group.members.length === 0 ? (
                <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
                  No members yet
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.members.map((member) => (
                    <div
                      key={member._id}
                      className={`border rounded-lg p-4 ${isDarkMode ? "bg-slate-700/50 border-slate-600" : "bg-slate-100 border-slate-300"}`}
                    >
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3
                              className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                            >
                              {member.name}
                            </h3>
                            {member.role && (
                              <span
                                className={`text-xs px-2 py-1 rounded ${isDarkMode ? "text-blue-400 bg-blue-500/20" : "text-blue-700 bg-blue-200"}`}
                              >
                                {member.role}
                              </span>
                            )}
                          </div>
                        </div>
                        <p
                          className={`text-xs mt-2 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                        >
                          ID: {member._id}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {member.skills?.map((skill) => (
                          <span
                            key={skill}
                            className={`px-2 py-1 rounded text-xs ${isDarkMode ? "bg-slate-600 text-slate-200" : "bg-slate-300 text-slate-700"}`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === "recommendations" && (
            <div>
              <h2
                className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Recommended Users
              </h2>
              {recommendedUsers.length === 0 ? (
                <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
                  No user recommendations available
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedUsers.map((user) => {
                    const matchScore = user.matchScore || 0;
                    const matchTier =
                      matchScore >= 80
                        ? "Excellent"
                        : matchScore >= 60
                          ? "Good"
                          : matchScore >= 40
                            ? "Fair"
                            : "Poor";
                    const tierColor =
                      matchScore >= 80
                        ? isDarkMode
                          ? "text-green-500 bg-green-500/20"
                          : "text-green-700 bg-green-200"
                        : matchScore >= 60
                          ? isDarkMode
                            ? "text-blue-500 bg-blue-500/20"
                            : "text-blue-700 bg-blue-200"
                          : matchScore >= 40
                            ? isDarkMode
                              ? "text-yellow-500 bg-yellow-500/20"
                              : "text-yellow-700 bg-yellow-200"
                            : isDarkMode
                              ? "text-red-500 bg-red-500/20"
                              : "text-red-700 bg-red-200";

                    return (
                      <div
                        key={user._id}
                        className={`border rounded-lg p-4 ${isDarkMode ? "bg-slate-700/50 border-slate-600" : "bg-slate-100 border-slate-300"}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3
                              className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                            >
                              {user.name}
                            </h3>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded ${tierColor}`}
                            >
                              {matchTier}
                            </span>
                          </div>
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${tierColor}`}
                          >
                            {matchScore}%
                          </div>
                        </div>

                        {/* Analysis Text */}
                        {user.analysis && (
                          <div
                            className={`mb-3 p-2 rounded text-xs ${isDarkMode ? "bg-slate-600/50 text-slate-300" : "bg-slate-300 text-slate-700"}`}
                          >
                            {user.analysis}
                          </div>
                        )}

                        {/* Matched Skills */}
                        {user.matchedSkills &&
                          user.matchedSkills.length > 0 && (
                            <div className="mb-3">
                              <p
                                className={`text-xs mb-1 font-semibold ${isDarkMode ? "text-slate-400 text-green-400" : "text-slate-600 text-green-600"}`}
                              >
                                ✓ Matched ({user.matchedSkills.length})
                              </p>
                              <div className="flex gap-1 flex-wrap">
                                {user.matchedSkills.map((skill) => (
                                  <span
                                    key={skill}
                                    className={`px-2 py-1 rounded text-xs ${isDarkMode ? "bg-green-500/20 text-green-300" : "bg-green-200 text-green-700"}`}
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Missing Skills */}
                        {user.missingSkills &&
                          user.missingSkills.length > 0 && (
                            <div className="mb-3">
                              <p
                                className={`text-xs mb-1 font-semibold ${isDarkMode ? "text-slate-400 text-orange-400" : "text-slate-600 text-orange-600"}`}
                              >
                                ✗ Missing ({user.missingSkills.length})
                              </p>
                              <div className="flex gap-1 flex-wrap">
                                {user.missingSkills.map((skill) => (
                                  <span
                                    key={skill}
                                    className={`px-2 py-1 rounded text-xs ${isDarkMode ? "bg-orange-500/20 text-orange-300" : "bg-orange-200 text-orange-700"}`}
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Recommendation */}
                        {user.recommendation && (
                          <div
                            className={`mb-3 p-2 rounded border text-xs ${isDarkMode ? "bg-blue-500/10 border-blue-500/20 text-slate-300" : "bg-blue-100 border-blue-300 text-slate-700"}`}
                          >
                            <p
                              className={`font-semibold mb-1 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
                            >
                              Rec:
                            </p>
                            {user.recommendation}
                          </div>
                        )}

                        <button
                          onClick={() => handleInviteUser(user._id)}
                          disabled={invitedUsers.has(user._id)}
                          className={`w-full py-2 px-3 rounded-lg font-semibold transition ${
                            invitedUsers.has(user._id)
                              ? isDarkMode
                                ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                                : "bg-slate-400 text-slate-100 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                          }`}
                        >
                          {invitedUsers.has(user._id) ? "Invited" : "Invite"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {isChatPreviewOpen && (
          <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-8">
            <button
              type="button"
              aria-label="Close group chat preview"
              onClick={handleCloseChatPreview}
              className={`absolute inset-0 pointer-events-auto transition-opacity duration-300 ${isChatPreviewVisible ? "opacity-100" : "opacity-0"} ${isDarkMode ? "bg-slate-950/55" : "bg-slate-900/35"} backdrop-blur-sm`}
            />

            <dialog
              open
              className={`relative m-0 p-0 border-0 bg-transparent overflow-visible pointer-events-auto w-[min(100vw,1260px)] aspect-[2/1] h-auto max-h-[102vh] transition-all duration-700 ease-in-out ${isChatPreviewVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[110%]"}`}
              aria-modal="true"
              aria-label="Group chat preview"
              onClose={handleCloseChatPreview}
            >
              <div className="relative h-full w-full rounded-[2.2rem] p-2.5 bg-gradient-to-b from-slate-800 to-slate-950 shadow-[0_20px_60px_rgba(15,23,42,0.45)] ring-1 ring-white/15">
                <div className="absolute left-1/2 top-2.5 -translate-x-1/2 w-24 h-1 rounded-full bg-white/20" />

                <button
                  type="button"
                  onClick={handleCloseChatPreview}
                  className="absolute -right-6 -top-6 z-30 h-9 w-9 rounded-full bg-black/65 text-white text-base font-semibold hover:bg-black/80 shadow-lg transition"
                  aria-label="Close chat panel"
                >
                  ✕
                </button>

                <div className="h-full w-full rounded-[1.8rem] overflow-hidden bg-white border border-white/15">
                  <div className="relative h-full">
                    <iframe
                      title={`Group chat for ${group.title}`}
                      src={`/dashboard/chat?groupId=${encodeURIComponent(id)}&preview=mobile`}
                      className="h-full w-full border-0 overflow-hidden"
                      onLoad={() => setIsChatIframeLoading(false)}
                    />

                    {isChatIframeLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-100">
                        <div className="h-10 w-10 rounded-full border-2 border-slate-300 border-t-emerald-600 animate-spin" />
                        <p className="text-sm font-medium text-slate-600">
                          Loading group chat...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </dialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetailsPage;
