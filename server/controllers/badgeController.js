const Badge = require('../models/Badge');

// @desc    Get all badges
// @route   GET /api/badges
// @access  Public
const getBadges = async (req, res, next) => {
  try {
    const badges = await Badge.find({});
    res.json({
      success: true,
      count: badges.length,
      badges
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBadges };
