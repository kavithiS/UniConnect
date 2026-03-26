import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar_components/Sidebar";
import ProfileCard from "../../components/profile_page_components/ProfileCard";
import ProfileForm from "../../components/profile_page_components/ProfileForm";
import Toast from "../../components/Toast";
import studentService from "../../services/studentService";

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userId, setUserId] = useState(null);

  // Fetch first student from database and load their profile
  useEffect(() => {
    const fetchAndLoadProfile = async () => {
      try {
        setLoading(true);
        const response = await studentService.getAllStudents();
        console.log("getAllStudents response:", response);
        const students = response.data || [];
        console.log("Students array:", students, "- Length:", students.length);

        if (students.length > 0) {
          const firstStudent = students[0];

          // Set user info
          setUserId(firstStudent.userId);

          // Load the full profile data
          setProfile(firstStudent);

          // Save to localStorage
          localStorage.setItem("userId", firstStudent.userId);
          localStorage.setItem("userEmail", firstStudent.email);
          localStorage.setItem("userFirstName", firstStudent.firstName);
          localStorage.setItem("userLastName", firstStudent.lastName);
          if (firstStudent.profilePicture) {
            localStorage.setItem(
              "userProfilePicture",
              firstStudent.profilePicture,
            );
          }

          console.log(
            "✓ Loaded User Profile:",
            `${firstStudent.firstName} ${firstStudent.lastName}`,
          );
        } else {
          showToast(
            "No students found. Please run backend seed script.",
            "error",
          );
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        showToast("Failed to load user data.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAndLoadProfile();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      console.log("Updating profile with data:", {
        hasImage: !!updatedData.profilePicture,
        imageSize: updatedData.profilePicture?.length,
      });
      const response = await studentService.updateProfile(userId, updatedData);
      console.log("Update response:", response);

      // Extract the actual student data from the response
      const studentData = response.data || response;
      console.log("Setting profile with data:", {
        firstName: studentData.firstName,
        hasImage: !!studentData.profilePicture,
        imageSize: studentData.profilePicture?.length,
      });

      setProfile(studentData);

      // Update localStorage with new profile data
      if (studentData.firstName) {
        localStorage.setItem("userFirstName", studentData.firstName);
      }
      if (studentData.lastName) {
        localStorage.setItem("userLastName", studentData.lastName);
      }
      if (studentData.email) {
        localStorage.setItem("userEmail", studentData.email);
      }
      if (studentData.profilePicture) {
        localStorage.setItem("userProfilePicture", studentData.profilePicture);
      } else {
        localStorage.removeItem("userProfilePicture");
      }

      showToast("Profile updated successfully!", "success");
      setShowForm(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      showToast(err.message || "Failed to update profile", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar
          key={profile?.profilePicture || "no-picture"}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
        <div
          className={`flex-1 flex items-center justify-center transition-all duration-300 ${
            isSidebarOpen ? "ml-64" : "ml-8"
          }`}
        >
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-lg text-gray-700 dark:text-gray-300 font-medium mt-4">
              Loading your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        key={profile?.profilePicture || "no-picture"}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Main Content */}
      <div
        className={`app-scrollbar flex-1 overflow-y-auto p-8 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-8"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                Student Profile
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your personal and academic information
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="transition-all duration-300">
            {showForm ? (
              <ProfileForm
                profile={profile}
                onUpdate={handleUpdateProfile}
                onReset={() => setShowForm(false)}
              />
            ) : (
              <ProfileCard profile={profile} onEdit={() => setShowForm(true)} />
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center text-gray-400 dark:text-gray-500 text-xs">
            <p>© 2026 UniGroup Finder - Student Portal</p>
            <p className="mt-1">
              Need help? Contact support@unigroupfinder.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
