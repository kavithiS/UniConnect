const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    birthday: {
      type: Date,
    },
    university: {
      type: String,
      trim: true,
    },
    degree: {
      type: String,
      trim: true,
    },
    currentYear: {
      type: Number,
      min: 1,
      max: 5,
    },
    currentSemester: {
      type: Number,
      min: 1,
      max: 2,
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4,
    },
    skills: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    interests: {
      type: [String],
      default: [],
    },
    profilePicture: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Student", studentSchema);
