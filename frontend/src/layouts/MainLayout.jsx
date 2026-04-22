import React from "react";
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
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/layout/Header";
import FloatingActionButton from "../components/layout/FloatingActionButton";

function MainLayout({ user, onLogout }) {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const isMobilePreviewMode =
    new URLSearchParams(location.search).get("preview") === "mobile";
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // The "Big 4" Navigation Model
  const navigationSections = [
    {
      section: "Work",
      items: [
        { path: "/dashboard/home", icon: <House size={18} />, label: "Dashboard" },
      ],
    },
    {
      section: "Collaboration",
      items: [
        { path: "/dashboard/groups", icon: <Users size={18} />, label: "Groups" },
        {
          path: "/dashboard/chat",
          icon: <MessageSquare size={18} />,
          label: "Group Chat",
        },
        {
          path: "/dashboard/recommendations",
          icon: <CheckSquare size={18} />,
          label: "Recommendations",
        },
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
        className={`fixed left-0 top-16 bottom-0 transition-all duration-300 ease-in-out z-30 ${
          sidebarOpen ? "w-64" : "w-20"
        } ${
          isDarkMode
            ? "bg-slate-900/95 border-r border-slate-800"
            : "bg-white/95 border-r border-slate-200"
        } backdrop-blur-sm`}
      >
        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute -right-4 top-6 p-1 rounded-full transition-all duration-200 ${
            isDarkMode
              ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
              : "bg-slate-200 hover:bg-slate-300 text-slate-700"
          }`}
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* Logo */}
        <div className={`p-4 border-b ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}>
          <div
            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
              isDarkMode ? "from-indigo-500 to-cyan-600" : "from-blue-500 to-cyan-500"
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
          {navigationSections.map((section, idx) => (
            <div key={idx}>
              {sidebarOpen && (
                <div
                  className={`text-xs uppercase tracking-wider font-semibold mb-3 px-2 ${
                    isDarkMode ? "text-slate-500" : "text-slate-600"
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
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${
                        active
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
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-20"
          } pt-16`}
        >
          <div className="p-8 transition-colors duration-300">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
}

export default MainLayout;
