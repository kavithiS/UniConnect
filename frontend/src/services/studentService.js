import axios from "axios";
import { getApiBaseUrl } from "../utils/backendUrl";

const getStudentsApiBase = () => `${getApiBaseUrl()}/students`;

const studentService = {
  // Initialize profile (create if doesn't exist)
  initializeProfile: async (userId, firstName, lastName, email) => {
    try {
      const response = await axios.post(
        `${getStudentsApiBase()}/init-profile`,
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
      const response = await axios.get(`${getStudentsApiBase()}/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update student profile
  updateProfile: async (userId, profileData) => {
    try {
      const response = await axios.put(
        `${getStudentsApiBase()}/update/${userId}`,
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
      const response = await axios.delete(`${getStudentsApiBase()}/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all students
  getAllStudents: async () => {
    try {
      const response = await axios.get(`${getStudentsApiBase()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default studentService;
