const Campaign = require('../models/Campaign');

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Public
const getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({ status: 'Active' })
      .populate('ngoId', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: campaigns.length,
      campaigns
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a campaign
// @route   POST /api/campaigns
// @access  Private (NGO only)
const createCampaign = async (req, res, next) => {
  try {
    const { title, description, goal, startDate, endDate, image } = req.body;

    const campaign = await Campaign.create({
      ngoId: req.user._id,
      title,
      description,
      goal,
      startDate,
      endDate,
      image,
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      campaign
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get campaigns for NGO
// @route   GET /api/campaigns/ngo
// @access  Private (NGO only)
const getNGOCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({ ngoId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      campaigns
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCampaigns,
  createCampaign,
  getNGOCampaigns
};
