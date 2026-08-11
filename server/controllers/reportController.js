const Report = require('../models/Report');

// @desc    Create a moderation report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res, next) => {
  try {
    const { reportedUser, opportunityId, reason, description } = req.body;

    const report = await Report.create({
      reporterId: req.user._id,
      reportedUser,
      opportunityId,
      reason,
      description,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your report. The admin will review it shortly.',
      report
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReport };
