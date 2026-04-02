const mongoose = require('mongoose');

/**
 * User Schema
 * Stores user profile with name, skills, and role
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
      type: String,
      trim: true,
      default: ''
    },
    skills: {
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

module.exports = mongoose.model('User', userSchema);
