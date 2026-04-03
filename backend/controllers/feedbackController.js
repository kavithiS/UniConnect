const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

exports.createFeedback = async (req, res) => {
  try {
    const { targetUser, comment, rating } = req.body;

    if (!targetUser || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Target user and comment are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetUser)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid target user id',
      });
    }

    const exists = await User.findById(targetUser);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found',
      });
    }

    const feedback = await Feedback.create({
      reviewer: req.userId,
      targetUser,
      comment: String(comment).trim(),
      rating: rating || null,
    });

    const populated = await feedback.populate('reviewer', 'fullName name email');

    res.status(201).json({
      success: true,
      message: 'Feedback created successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating feedback',
      error: error.message,
    });
  }
};

exports.getReceivedFeedback = async (req, res) => {
  try {
    const targetId = req.params.userId || req.userId;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id',
      });
    }

    const feedbackList = await Feedback.find({ targetUser: targetId })
      .populate('reviewer', 'fullName name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbackList.length,
      data: feedbackList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message,
    });
  }
};

exports.getGivenFeedback = async (req, res) => {
  try {
    const feedbackList = await Feedback.find({ reviewer: req.userId })
      .populate('targetUser', 'fullName name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbackList.length,
      data: feedbackList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message,
    });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, rating } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback id',
      });
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    if (String(feedback.reviewer) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own feedback',
      });
    }

    feedback.comment = comment !== undefined ? String(comment).trim() : feedback.comment;
    feedback.rating = rating !== undefined ? rating : feedback.rating;
    await feedback.save();

    const populated = await feedback.populate('reviewer', 'fullName name email');

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating feedback',
      error: error.message,
    });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback id',
      });
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    if (String(feedback.reviewer) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own feedback',
      });
    }

    await feedback.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: error.message,
    });
  }
};
