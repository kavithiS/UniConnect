import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const studentService = {
  // Initialize profile (create if doesn't exist)
  initializeProfile: async (userId, firstName, lastName, email) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/students/init-profile`,
        {
          userId,
          firstName,
          lastName,
          email,
        },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get student profile
  getProfile: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update student profile
  updateProfile: async (userId, profileData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/students/update/${userId}`,
        profileData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete student profile
  deleteProfile: async (userId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/students/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all students
  getAllStudents: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default studentService;
