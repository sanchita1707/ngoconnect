const Story = require('../models/Story');

// @desc    Get all stories
// @route   GET /api/stories
// @access  Public
const getStories = async (req, res, next) => {
  try {
    const stories = await Story.find({})
      .populate('authorId', 'name profileImage')
      .populate('ngoId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: stories.length,
      stories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a success story
// @route   POST /api/stories
// @access  Private
const createStory = async (req, res, next) => {
  try {
    const { title, description, image, category, volunteersCount, hours, peopleImpacted, ngoId } = req.body;

    const story = await Story.create({
      authorId: req.user._id,
      ngoId: ngoId || (req.user.role === 'ngo' ? req.user._id : undefined),
      title,
      description,
      image,
      category,
      volunteersCount: Number(volunteersCount || 0),
      hours: Number(hours || 0),
      peopleImpacted: Number(peopleImpacted || 0)
    });

    res.status(201).json({
      success: true,
      message: 'Success story shared!',
      story
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStories,
  createStory
};
