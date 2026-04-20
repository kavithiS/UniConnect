import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Sun, Moon, Users, User, MessageCircle, ClipboardList, FolderPlus, LayoutDashboard, MessageSquare, CheckSquare, House, Star, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function MainLayout({ user, onLogout }) {
  const { isDarkMode, toggleTheme } = useTheme();

  const menuItems = [
    { path: '/dashboard/home', icon: <House size={18} />, label: 'Home' },
    { path: '/dashboard/groups', icon: <Users size={18} />, label: 'Groups' },
    { path: '/dashboard/requests', icon: <MessageSquare size={18} />, label: 'Requests & Invites' },
    { path: '/dashboard/recommendations', icon: <CheckSquare size={18} />, label: 'Recommendations' },
    { path: '/dashboard/feedback', icon: <Star size={18} />, label: 'Feedback' },
    { path: '/dashboard/profile', icon: <User size={18} />, label: 'Profile' },
    { path: '/dashboard/chat', icon: <MessageCircle size={18} />, label: 'Chat' },
    { path: '/dashboard/tasks', icon: <ClipboardList size={18} />, label: 'Task Board' },
    { path: '/dashboard/project-dashboard', icon: <LayoutDashboard size={18} />, label: 'Projects' },
    { path: '/dashboard/add-project', icon: <FolderPlus size={18} />, label: 'Add Project' },
  ];

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Sidebar */}
      <div className={`w-[250px] flex-shrink-0 border-r p-6 flex flex-col gap-8 backdrop-blur-md transition-colors duration-300 ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-white/50'}`}>
        {/* Logo */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${isDarkMode ? 'from-slate-500 to-slate-600' : 'from-blue-400 to-blue-500'}`}></div>
          <span className={`text-sm font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Uni Connect</span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className={`px-3 text-xs uppercase tracking-widest font-medium mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
            Navigation
          </div>
          <nav className="space-y-1">
            {menuItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard/home'}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${
                  isActive
                    ? isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-950'
                    : isDarkMode ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Theme Toggle - Bottom */}
        <div className={`mt-auto pt-6 border-t space-y-2 flex-shrink-0 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          {user && (
            <div className={`px-3 py-2 text-xs rounded-lg ${isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
              Signed in as {user.fullName || user.name || user.email}
            </div>
          )}

          <button
            onClick={onLogout}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              isDarkMode
                ? 'bg-rose-900/40 hover:bg-rose-900/60 text-rose-200'
                : 'bg-rose-100 hover:bg-rose-200 text-rose-700'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>

          <button
            onClick={toggleTheme}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4" />
                <span className="text-sm">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span className="text-sm">Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="py-8 px-12 transition-colors duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
