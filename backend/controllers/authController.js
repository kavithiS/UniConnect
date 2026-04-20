const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "dev_jwt_secret_change_me",
    { expiresIn: "7d" },
  );
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      profileCompleted: false,
      name: normalizedEmail.split("@")[0],
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error during registration",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const storedSecret = user.passwordHash || user.password || "";

    if (!storedSecret) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const looksHashed =
      typeof storedSecret === "string" && storedSecret.startsWith("$2");
    const isValid = looksHashed
      ? await bcrypt.compare(password, storedSecret)
      : password === storedSecret;

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Auto-migrate legacy plain-text passwords to bcrypt hash.
    if (!looksHashed) {
      const migratedPasswordHash = await bcrypt.hash(password, 10);
      await User.findByIdAndUpdate(user._id, {
        $set: { passwordHash: migratedPasswordHash },
      });
    }

    const token = signToken(user._id);

    const safeUser = {
      ...user,
      passwordHash: undefined,
      password: undefined,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error during login",
      error: error.message,
    });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching current user",
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      fullName,
      name,
      registrationNumber,
      year,
      semester,
      enrolledYear,
      skills,
      about,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (name) updateData.name = name;
    if (registrationNumber !== undefined)
      updateData.registrationNumber = registrationNumber;
    if (year !== undefined) updateData.year = year;
    if (semester !== undefined) updateData.semester = semester;
    if (enrolledYear !== undefined) updateData.enrolledYear = enrolledYear;
    if (skills) updateData.skills = skills;
    if (about !== undefined) updateData.about = about;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};
