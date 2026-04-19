const User = require('../models/User');

exports.setupProfile = async (req, res) => {
  try {
    const {
      fullName,
      registrationNumber,
      year,
      semester,
      enrolledYear,
      skills,
      achievements,
      about,
    } = req.body;

    if (!fullName || !registrationNumber || !year || !semester || !enrolledYear) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required profile fields',
      });
    }

    const normalizedSkills = Array.isArray(skills)
      ? skills.map((skill) => String(skill).trim()).filter(Boolean)
      : [];

    const normalizedAchievements = Array.isArray(achievements)
      ? achievements.map((achievement) => String(achievement).trim()).filter(Boolean)
      : [];

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        fullName: String(fullName).trim(),
        name: String(fullName).trim(),
        registrationNumber: String(registrationNumber).trim(),
        year: String(year).trim(),
        semester: String(semester).trim(),
        enrolledYear: String(enrolledYear).trim(),
        skills: normalizedSkills,
        achievements: normalizedAchievements,
        about: String(about || '').trim(),
        profileCompleted: true,
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile setup completed',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting up profile',
      error: error.message,
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};
