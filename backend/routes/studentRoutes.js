const express = require("express");
const router = express.Router();
const {
  initializeProfile,
  getStudentProfile,
  updateStudentProfile,
  deleteStudentProfile,
  getAllStudents,
} = require("../controllers/studentController");

// Get all students
router.get("/", getAllStudents);

// Initialize/create profile
router.post("/init-profile", initializeProfile);

// Get student profile
router.get("/:userId", getStudentProfile);

// Update student profile
router.put("/update/:userId", updateStudentProfile);

// Delete student profile
router.delete("/:userId", deleteStudentProfile);

module.exports = router;
