import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Header from "./components/Header";
import StudentProfile from "./pages/profile_page/StudentProfile";
import GroupChat from "./pages/chat_area_page/GroupChat";

function App() {
  return (
    <ThemeProvider>
      <Header />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route
            path="/login"
            element={
              <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    Login Page
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    This is a placeholder login page
                  </p>
                </div>
              </div>
            }
          />
          <Route path="/chat" element={<GroupChat />} />
          <Route
            path="/groups"
            element={
              <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    My Groups
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Coming soon...
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
