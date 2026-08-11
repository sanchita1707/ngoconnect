const User = require('../models/User');
const VolunteerProfile = require('../models/VolunteerProfile');
const Participation = require('../models/Participation');

// @desc    Get volunteer profile by User ID (mainly for NGO reviews)
// @route   GET /api/volunteers/:id
// @access  Private (NGO/Admin only)
const getVolunteerProfileById = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('Volunteer not found');
    }

    const profile = await VolunteerProfile.findOne({ userId }).populate('badges');
    if (!profile) {
      res.status(404);
      throw new Error('Volunteer profile details not found');
    }

    // Fetch verified participations to show history
    const participations = await Participation.find({ volunteerId: userId, verifiedByNGO: true })
      .populate('opportunityId', 'title category date')
      .populate('ngoId', 'name');

    res.json({
      success: true,
      user,
      profile,
      participations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle saving of opportunity
// @route   POST /api/volunteers/saved/:oppId
// @access  Private (Volunteer only)
const toggleSaveOpportunity = async (req, res, next) => {
  try {
    const profile = await VolunteerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error('Volunteer profile not found');
    }

    const oppId = req.params.oppId;
    const isSaved = profile.savedOpportunities.includes(oppId);

    if (isSaved) {
      profile.savedOpportunities = profile.savedOpportunities.filter(id => id.toString() !== oppId);
      await profile.save();
      res.json({ success: true, message: 'Opportunity removed from saved list', saved: false });
    } else {
      profile.savedOpportunities.push(oppId);
      await profile.save();
      res.json({ success: true, message: 'Opportunity saved successfully', saved: true });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get saved opportunities list
// @route   GET /api/volunteers/saved
// @access  Private (Volunteer only)
const getSavedOpportunities = async (req, res, next) => {
  try {
    const profile = await VolunteerProfile.findOne({ userId: req.user._id })
      .populate({
        path: 'savedOpportunities',
        populate: { path: 'ngoId', select: 'name profileImage' }
      });

    if (!profile) {
      res.status(404);
      throw new Error('Volunteer profile not found');
    }

    res.json({
      success: true,
      opportunities: profile.savedOpportunities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public leaderboard
// @route   GET /api/volunteers/leaderboard
// @access  Public
const getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await VolunteerProfile.find({})
      .populate('userId', 'name profileImage')
      .sort({ xp: -1 })
      .limit(20);

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVolunteerProfileById,
  toggleSaveOpportunity,
  getSavedOpportunities,
  getLeaderboard
};
