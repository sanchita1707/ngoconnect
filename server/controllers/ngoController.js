const User = require('../models/User');
const NGOProfile = require('../models/NGOProfile');
const Opportunity = require('../models/Opportunity');
const Campaign = require('../models/Campaign');
const Event = require('../models/Event');
const Review = require('../models/Review');
const Participation = require('../models/Participation');

// @desc    Get all verified NGOs for the directory
// @route   GET /api/ngos
// @access  Public
const getNGOs = async (req, res, next) => {
  try {
    const { search, cause, city } = req.query;
    let query = { verificationStatus: 'Verified' };

    if (search) {
      query.organizationName = { $regex: search, $options: 'i' };
    }
    if (cause) {
      query.causes = { $in: [cause] };
    }
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    const ngos = await NGOProfile.find(query)
      .populate('userId', 'name email profileImage location')
      .sort({ trustScore: -1 });

    res.json({
      success: true,
      count: ngos.length,
      ngos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single NGO details by public user ID (NGO profile)
// @route   GET /api/ngos/:id
// @access  Public
const getNGOById = async (req, res, next) => {
  try {
    const ngoUserId = req.params.id;

    // Get NGO profile
    const ngo = await NGOProfile.findOne({ userId: ngoUserId }).populate('userId', 'name email profileImage phone location');
    if (!ngo) {
      res.status(404);
      throw new Error('NGO profile not found');
    }

    // Get opportunities
    const opportunities = await Opportunity.find({ ngoId: ngoUserId, status: 'Open' });

    // Get campaigns
    const campaigns = await Campaign.find({ ngoId: ngoUserId, status: 'Active' });

    // Get events
    const events = await Event.find({ ngoId: ngoUserId });

    // Get reviews
    const reviews = await Review.find({ ngoId: ngoUserId }).populate('reviewerId', 'name profileImage');

    // Aggregate stats (Volunteers and hours completed)
    const participationStats = await Participation.aggregate([
      { $match: { ngoId: ngoUserId, verifiedByNGO: true } },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$hours' },
          totalVolunteers: { $addToSet: '$volunteerId' },
          totalPeopleImpacted: { $sum: '$peopleImpacted' }
        }
      }
    ]);

    const stats = {
      totalHours: participationStats[0]?.totalHours || 0,
      totalVolunteersCount: participationStats[0]?.totalVolunteers?.length || 0,
      totalPeopleImpacted: participationStats[0]?.totalPeopleImpacted || 0,
      activitiesCount: opportunities.length + campaigns.length + events.length
    };

    res.json({
      success: true,
      ngo,
      opportunities,
      campaigns,
      events,
      reviews,
      stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNGOs,
  getNGOById
};
