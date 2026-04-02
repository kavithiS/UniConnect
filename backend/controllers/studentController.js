const Student = require("../models/Student");

// @desc    Initialize/Get student profile
// @route   POST /api/students/init-profile
exports.initializeProfile = async (req, res) => {
  try {
    const { userId, firstName, lastName, email } = req.body;

    if (!userId || !firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide userId, firstName, lastName, and email",
      });
    }

    // Use findOneAndUpdate with upsert to avoid race conditions
    const student = await Student.findOneAndUpdate(
      { userId },
      {
        userId,
        firstName,
        lastName,
        email,
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create if doesn't exist
        setDefaultsOnInsert: true, // Apply schema defaults on insert
      },
    );

    const isNewProfile = student.isNew || student.__v === 0;

    res.status(isNewProfile ? 201 : 200).json({
      success: true,
      message: isNewProfile
        ? "Profile created successfully"
        : "Profile already exists",
      data: student,
    });
  } catch (error) {
    // Only log non-duplicate errors
    if (error?.code !== 11000) {
      console.error("Error in initializeProfile:", error);
    }

    // Handle duplicate key error gracefully
    if (error?.code === 11000) {
      const existing = await Student.findOne({
        $or: [{ userId: req.body?.userId }, { email: req.body?.email }],
      });
      if (existing) {
        return res.status(200).json({
          success: true,
          message: "Profile already exists",
          data: existing,
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get student profile by userId
// @route   GET /api/students/:userId
// @access  Public
exports.getStudentProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const student = await Student.findOne({ userId });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Error in getStudentProfile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/update/:userId
// @access  Public
exports.updateStudentProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Find and update the student
    const student = await Student.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error in updateStudentProfile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Delete student profile
// @route   DELETE /api/students/:userId
// @access  Public
exports.deleteStudentProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const student = await Student.findOneAndDelete({ userId });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteStudentProfile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Public
exports.getAllStudents = async (req, res) => {
  try {
    console.log("\n\ud83d\udccb Fetching all students from database...");
    const students = await Student.find({});
    console.log(`\u2705 Found ${students.length} students`);
    if (students.length > 0) {
      console.log(
        "First student:",
        students[0].firstName,
        students[0].lastName,
        `(${students[0].userId})`,
      );
    }

    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("\u274c Error in getAllStudents:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
