import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Users,
  ClipboardList,
  LayoutDashboard,
  FolderPlus,
  MessageSquare,
  CheckSquare,
  House,
  Star,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/layout/Header";
import FloatingActionButton from "../components/layout/FloatingActionButton";

const CHAT_OVERLAY_ANIMATION_MS = 320;

function MainLayout({ user, onLogout }) {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const isMobilePreviewMode =
    new URLSearchParams(location.search).get("preview") === "mobile";
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // Group Chats overlay state
  const [isChatOverlayOpen, setIsChatOverlayOpen] = React.useState(false);
  const [isChatOverlayVisible, setIsChatOverlayVisible] = React.useState(false);
  const [isChatIframeLoading, setIsChatIframeLoading] = React.useState(false);

  const handleOpenGroupChats = () => {
    setIsChatIframeLoading(true);
    setIsChatOverlayOpen(true);
    globalThis.requestAnimationFrame(() => {
      setIsChatOverlayVisible(true);
    });
  };

  const handleCloseGroupChats = () => {
    setIsChatOverlayVisible(false);
  };

  // Close overlay after exit animation
  useEffect(() => {
    if (isChatOverlayVisible || !isChatOverlayOpen) return undefined;
    const id = globalThis.setTimeout(() => {
      setIsChatOverlayOpen(false);
    }, CHAT_OVERLAY_ANIMATION_MS);
    return () => globalThis.clearTimeout(id);
  }, [isChatOverlayOpen, isChatOverlayVisible]);

  // Escape key + postMessage close
  useEffect(() => {
    if (!isChatOverlayOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (e) => {
      if (e.key === "Escape") setIsChatOverlayVisible(false);
    };
    const handleMessage = (e) => {
      if (e.origin !== globalThis.location.origin) return;
      if (e.data?.type === "close-group-chat-preview") setIsChatOverlayVisible(false);
    };

    globalThis.addEventListener("keydown", handleEscape);
    globalThis.addEventListener("message", handleMessage);
    return () => {
      document.body.style.overflow = previousOverflow;
      globalThis.removeEventListener("keydown", handleEscape);
      globalThis.removeEventListener("message", handleMessage);
    };
  }, [isChatOverlayOpen]);

  // The "Big 4" Navigation Model
  // navigationSections excludes "Collaboration" — those items (Groups, Group Chats, Recommendations)
  // are rendered manually in the sidebar to accommodate the Group Chats overlay button.
  const navigationSections = [
    {
      section: "Work",
      items: [
        { path: "/dashboard/home", icon: <House size={18} />, label: "Dashboard" },
      ],
    },
    {
      section: "Projects",
      items: [
        {
          path: "/dashboard/project-dashboard",
          icon: <LayoutDashboard size={18} />,
          label: "Projects",
        },
        {
          path: "/dashboard/tasks",
          icon: <ClipboardList size={18} />,
          label: "Task Board",
        },
        {
          path: "/dashboard/add-project",
          icon: <FolderPlus size={18} />,
          label: "Add Project",
        },
      ],
    },
    {
      section: "Community",
      items: [
        {
          path: "/dashboard/feedback",
          icon: <Star size={18} />,
          label: "Feedback",
        },
      ],
    },
  ];

  if (isMobilePreviewMode) {
    return (
      <main className="h-screen w-screen overflow-hidden">
        <Outlet />
      </main>
    );
  }

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-slate-950" : "bg-slate-50"}`}
    >
      {/* Minimalist Sidebar - Collapsed by default */}
      <div
        className={`fixed left-0 top-16 bottom-0 transition-all duration-300 ease-in-out z-30 ${sidebarOpen ? "w-64" : "w-20"
          } ${isDarkMode
            ? "bg-slate-900/95 border-r border-slate-800"
            : "bg-white/95 border-r border-slate-200"
          } backdrop-blur-sm`}
      >
        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute -right-4 top-6 p-1 rounded-full transition-all duration-200 ${isDarkMode
            ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
            : "bg-slate-200 hover:bg-slate-300 text-slate-700"
            }`}
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* Logo */}
        <div className={`p-4 border-b ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}>
          <div
            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${isDarkMode ? "from-indigo-500 to-cyan-600" : "from-blue-500 to-cyan-500"
              }`}
          />
          {sidebarOpen && (
            <p className={`text-xs font-semibold mt-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
              UniConnect
            </p>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-120px)]">
          {/* Work section — rendered first to preserve original order */}
          {navigationSections.slice(0, 1).map((section, idx) => (
            <div key={idx}>
              {sidebarOpen && (
                <div
                  className={`text-xs uppercase tracking-wider font-semibold mb-3 px-2 ${isDarkMode ? "text-slate-500" : "text-slate-600"
                    }`}
                >
                  {section.section}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive: active }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${active
                        ? isDarkMode
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          : "bg-blue-100 text-blue-700 border border-blue-200"
                        : isDarkMode
                          ? "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      } ${!sidebarOpen ? "justify-center" : ""}`
                    }
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    {item.icon}
                    {sidebarOpen && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {/* Collaboration section — manual block to include Group Chats overlay button */}
          <div>
            {sidebarOpen && (
              <div
                className={`text-xs uppercase tracking-wider font-semibold mb-3 px-2 ${isDarkMode ? "text-slate-500" : "text-slate-600"
                  }`}
              >
                Collaboration
              </div>
            )}
            <div className="space-y-1">
              {/* Groups NavLink */}
              <NavLink
                to="/dashboard/groups"
                className={({ isActive: active }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${active
                    ? isDarkMode
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                    : isDarkMode
                      ? "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  } ${!sidebarOpen ? "justify-center" : ""}`
                }
                title={!sidebarOpen ? "Groups" : undefined}
              >
                <Users size={18} />
                {sidebarOpen && <span>Groups</span>}
              </NavLink>

              {/* Group Chats — opens overlay modal */}
              <button
                id="sidebar-group-chats-btn"
                onClick={handleOpenGroupChats}
                title={!sidebarOpen ? "Group Chats" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isDarkMode
                  ? "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  } ${!sidebarOpen ? "justify-center" : ""}`}
              >
                <MessageSquare size={18} />
                {sidebarOpen && <span>Group Chats</span>}
              </button>

              {/* Recommendations NavLink */}
              <NavLink
                to="/dashboard/recommendations"
                className={({ isActive: active }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${active
                    ? isDarkMode
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                    : isDarkMode
                      ? "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  } ${!sidebarOpen ? "justify-center" : ""}`
                }
                title={!sidebarOpen ? "Recommendations" : undefined}
              >
                <CheckSquare size={18} />
                {sidebarOpen && <span>Recommendations</span>}
              </NavLink>

              <NavLink
                to="/dashboard/requests"
                className={({ isActive: active }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${active
                    ? isDarkMode
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                    : isDarkMode
                      ? "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  } ${!sidebarOpen ? "justify-center" : ""}`
                }
                title={!sidebarOpen ? "Requests & Invites" : undefined}
              >
                <Mail size={18} />
                {sidebarOpen && <span>Requests & Invites</span>}
              </NavLink>
            </div>
          </div>

          {/* Projects & Community sections */}
          {navigationSections.slice(1).map((section, idx) => (
            <div key={idx}>
              {sidebarOpen && (
                <div
                  className={`text-xs uppercase tracking-wider font-semibold mb-3 px-2 ${isDarkMode ? "text-slate-500" : "text-slate-600"
                    }`}
                >
                  {section.section}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive: active }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${active
                        ? isDarkMode
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          : "bg-blue-100 text-blue-700 border border-blue-200"
                        : isDarkMode
                          ? "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      } ${!sidebarOpen ? "justify-center" : ""}`
                    }
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    {item.icon}
                    {sidebarOpen && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header user={user} onLogout={onLogout} />

        {/* Page Content */}
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"
            } pt-16`}
        >
          <div className="p-8 transition-colors duration-300">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* ===== Group Chats Overlay ===== */}
      {isChatOverlayOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-8">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close group chat overlay"
            onClick={handleCloseGroupChats}
            className={`absolute inset-0 pointer-events-auto transition-opacity duration-300 ${isChatOverlayVisible ? "opacity-100" : "opacity-0"
              } ${isDarkMode ? "bg-slate-950/55" : "bg-slate-900/35"
              } backdrop-blur-sm`}
          />

          {/* Smartphone-style dialog frame — identical to GroupDetailsPage */}
          <dialog
            open
            className={`relative m-0 p-0 border-0 bg-transparent overflow-visible pointer-events-auto w-[min(100vw,1260px)] aspect-[2/1] h-auto max-h-[102vh] transition-all duration-700 ease-in-out ${isChatOverlayVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-[110%]"
              }`}
            aria-modal="true"
            aria-label="Group chat overlay"
            onClose={handleCloseGroupChats}
          >
            <div className="relative h-full w-full rounded-[2.2rem] p-2.5 bg-gradient-to-b from-slate-800 to-slate-950 shadow-[0_20px_60px_rgba(15,23,42,0.45)] ring-1 ring-white/15">
              {/* Top handle decoration */}
              <div className="absolute left-1/2 top-2.5 -translate-x-1/2 w-24 h-1 rounded-full bg-white/20" />

              {/* Close button */}
              <button
                type="button"
                onClick={handleCloseGroupChats}
                className="absolute -right-6 -top-6 z-30 h-9 w-9 rounded-full bg-black/65 text-white text-base font-semibold hover:bg-black/80 shadow-lg transition"
                aria-label="Close chat panel"
              >
                ✕
              </button>

              <div className="h-full w-full rounded-[1.8rem] overflow-hidden bg-white border border-white/15">
                <div className="relative h-full">
                  <iframe
                    title="Group Chats"
                    src={`/dashboard/chat?preview=mobile`}
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
  );
}

export default MainLayout;