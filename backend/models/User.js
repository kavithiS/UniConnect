const mongoose = require('mongoose');

/**
 * User Schema
 * Stores user profile with name, skills, and role
 */
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      default: ''
    },
    name: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      default: undefined
    },
    passwordHash: {
      type: String,
      default: ''
    },
    registrationNumber: {
      type: String,
      trim: true,
      default: ''
    },
    year: {
      type: String,
      trim: true,
      default: ''
    },
    semester: {
      type: String,
      trim: true,
      default: ''
    },
    enrolledYear: {
      type: String,
      trim: true,
      default: ''
    },
    about: {
      type: String,
      trim: true,
      default: ''
    },
    profileCompleted: {
      type: Boolean,
      default: false
    },
    skills: {
      type: [String],
      default: [],
      trim: true
    },
    achievements: {
      type: [String],
      default: [],
      trim: true
    },
    role: {
      type: String,
      enum: ['Developer', 'Designer', 'Manager', 'Leader', 'Student'],
      default: 'Developer'
    }
  },
  { timestamps: true }
);

userSchema.pre('save', function userPreSave() {
  if (!this.name && this.fullName) {
    this.name = this.fullName;
  }
  if (!this.fullName && this.name) {
    this.fullName = this.name;
  }
});

userSchema.methods.toJSON = function userToJSON() {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

module.exports = mongoose.model('User', userSchema);
