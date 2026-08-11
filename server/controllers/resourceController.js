const ResourceNeed = require('../models/ResourceNeed');
const Notification = require('../models/Notification');
const VolunteerProfile = require('../models/VolunteerProfile');

// @desc    Get all resource needs
// @route   GET /api/resources
// @access  Public
const getResources = async (req, res, next) => {
  try {
    const { status, urgency, category } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }
    if (urgency) {
      query.urgency = urgency;
    }
    if (category) {
      query.category = category;
    }

    const resources = await ResourceNeed.find(query)
      .populate('ngoId', 'name profileImage location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a resource need
// @route   POST /api/resources
// @access  Private (NGO only)
const createResourceNeed = async (req, res, next) => {
  try {
    const { title, description, category, quantityRequired, unit, urgency, location, requiredBy } = req.body;

    const resource = await ResourceNeed.create({
      ngoId: req.user._id,
      title,
      description,
      category,
      quantityRequired,
      unit,
      urgency,
      location,
      requiredBy,
      status: 'Open'
    });

    res.status(201).json({
      success: true,
      message: 'Resource request created',
      resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Contribute to a resource need
// @route   POST /api/resources/:id/contribute
// @access  Private (Volunteer/User)
const contributeResource = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const resource = await ResourceNeed.findById(req.params.id);

    if (!resource) {
      res.status(404);
      throw new Error('Resource need not found');
    }

    if (resource.status === 'Closed' || resource.status === 'Fulfilled') {
      res.status(400);
      throw new Error('This resource need is no longer active');
    }

    // Add contributor
    resource.contributors.push({
      volunteerId: req.user._id,
      quantity: Number(quantity),
      date: Date.now()
    });

    // Update received count
    resource.quantityReceived += Number(quantity);

    // Update status
    if (resource.quantityReceived >= resource.quantityRequired) {
      resource.status = 'Fulfilled';
    } else {
      resource.status = 'Partially Fulfilled';
    }

    await resource.save();

    // Reward Volunteer XP for Resource Support
    const profile = await VolunteerProfile.findOne({ userId: req.user._id });
    if (profile) {
      const xpEarned = Number(quantity) * 50; // 50 XP per item contributed
      profile.xp += xpEarned;
      profile.impactScore += Number(quantity) * 5;
      await profile.save();

      // Send Volunteer notification
      await Notification.create({
        userId: req.user._id,
        title: '❤️ Contribution Recorded',
        message: `Thank you for contributing ${quantity} ${resource.unit} for "${resource.title}"! +${xpEarned} XP awarded.`,
        type: 'contribution'
      });
    }

    // Send NGO Notification
    await Notification.create({
      userId: resource.ngoId,
      title: '🎁 New Resource Contribution',
      message: `${req.user.name} contributed ${quantity} ${resource.unit} to your need: "${resource.title}".`,
      type: 'contribution'
    });

    res.json({
      success: true,
      message: 'Contribution logged successfully',
      resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get resources for NGO
// @route   GET /api/resources/ngo
// @access  Private (NGO only)
const getNGOResources = async (req, res, next) => {
  try {
    const resources = await ResourceNeed.find({ ngoId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      resources
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  createResourceNeed,
  contributeResource,
  getNGOResources
};
