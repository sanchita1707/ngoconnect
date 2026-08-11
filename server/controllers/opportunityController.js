const Opportunity = require('../models/Opportunity');
const NGOProfile = require('../models/NGOProfile');
const VolunteerProfile = require('../models/VolunteerProfile');

// @desc    Get all opportunities (with search, category, location, skills filters)
// @route   GET /api/opportunities
// @access  Public
const getOpportunities = async (req, res, next) => {
  try {
    const { search, category, city, urgency, status, skill } = req.query;
    
    let query = {};

    // By default, only show open or full opportunities on public search
    query.status = status || { $in: ['Open', 'Full'] };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (urgency) {
      query.urgency = urgency;
    }

    if (skill) {
      query.requiredSkills = { $in: [skill] };
    }

    const opportunities = await Opportunity.find(query)
      .populate('ngoId', 'name profileImage email')
      .sort({ createdAt: -1 });

    // Fetch verification status for all populated NGOs
    const ngoIds = opportunities.map(o => o.ngoId?._id).filter(Boolean);
    const verifiedNGOs = await NGOProfile.find({
      userId: { $in: ngoIds },
      verificationStatus: 'Verified'
    }, 'userId');
    const verifiedSet = new Set(verifiedNGOs.map(p => p.userId.toString()));

    const enrichedOpportunities = opportunities.map(opp => {
      const obj = opp.toObject();
      if (obj.ngoId) {
        obj.ngoId.isVerified = verifiedSet.has(obj.ngoId._id.toString());
      }
      return obj;
    });

    res.json({
      success: true,
      count: enrichedOpportunities.length,
      opportunities: enrichedOpportunities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single opportunity details
// @route   GET /api/opportunities/:id
// @access  Public
const getOpportunityById = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('ngoId', 'name profileImage email phone location');

    if (!opportunity) {
      res.status(404);
      throw new Error('Opportunity not found');
    }

    // Get NGO profile for foundedYear/trustScore
    const ngoProfile = await NGOProfile.findOne({ userId: opportunity.ngoId._id });

    res.json({
      success: true,
      opportunity,
      ngoProfile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new opportunity
// @route   POST /api/opportunities
// @access  Private (NGO only)
const createOpportunity = async (req, res, next) => {
  try {
    const { title, description, category, requiredSkills, location, city, state, date, startTime, endTime, volunteersNeeded, urgency, image } = req.body;

    const opportunity = await Opportunity.create({
      ngoId: req.user._id,
      title,
      description,
      category,
      requiredSkills,
      location,
      city,
      state,
      date,
      startTime,
      endTime,
      volunteersNeeded,
      urgency,
      image
    });

    res.status(201).json({
      success: true,
      message: 'Opportunity created successfully',
      opportunity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update opportunity
// @route   PUT /api/opportunities/:id
// @access  Private (NGO only/Admin)
const updateOpportunity = async (req, res, next) => {
  try {
    let opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      res.status(404);
      throw new Error('Opportunity not found');
    }

    // Check if the user is owner or admin
    if (opportunity.ngoId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to edit this opportunity');
    }

    opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Opportunity updated successfully',
      opportunity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private (NGO only/Admin)
const deleteOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      res.status(404);
      throw new Error('Opportunity not found');
    }

    if (opportunity.ngoId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this opportunity');
    }

    await opportunity.deleteOne();

    res.json({
      success: true,
      message: 'Opportunity deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended opportunities for volunteer (Explainable matching algorithm)
// @route   GET /api/opportunities/recommendations
// @access  Private (Volunteer only)
const getRecommendations = async (req, res, next) => {
  try {
    const profile = await VolunteerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(400).json({ success: false, message: 'Please complete your profile to get recommendations' });
    }

    const opportunities = await Opportunity.find({ status: 'Open' }).populate('ngoId', 'name profileImage');
    
    // Perform matching calculation for each opportunity
    const recommended = opportunities.map(opp => {
      let score = 0;
      let reasons = [];

      // 1. Skills Matching (40%)
      if (opp.requiredSkills && opp.requiredSkills.length > 0) {
        const matchingSkills = opp.requiredSkills.filter(skill => 
          profile.skills.some(vSkill => vSkill.toLowerCase() === skill.toLowerCase())
        );
        const skillScore = (matchingSkills.length / opp.requiredSkills.length) * 40;
        score += skillScore;
        if (matchingSkills.length > 0) {
          reasons.push(`✓ ${matchingSkills.length} matching skills (${matchingSkills.join(', ')})`);
        }
      } else {
        score += 40; // Full score if no skills are required
        reasons.push('✓ Suitable for all skill levels');
      }

      // 2. Causes / Category Matching (30%)
      const matchesCause = profile.preferredCauses.some(cause => cause.toLowerCase() === opp.category.toLowerCase()) || 
                           profile.interests.some(interest => interest.toLowerCase() === opp.category.toLowerCase());
      if (matchesCause) {
        score += 30;
        reasons.push(`✓ Matches your preferred cause: ${opp.category}`);
      }

      // 3. Location Matching (20%)
      const matchesCity = profile.city && opp.city && profile.city.toLowerCase() === opp.city.toLowerCase();
      if (matchesCity) {
        score += 20;
        reasons.push('✓ Located in your city');
      }

      // 4. Availability Matching (10%)
      // Check if opportunity day matches volunteer's preferred days
      const oppDateStr = new Date(opp.date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(); // e.g. "saturday"
      const isWeekend = oppDateStr === 'saturday' || oppDateStr === 'sunday';
      
      let availabilityMatch = false;
      if (profile.availability) {
        if (isWeekend && profile.availability.weekends) {
          availabilityMatch = true;
        } else if (!isWeekend && profile.availability.weekdays) {
          availabilityMatch = true;
        }
      }
      
      if (availabilityMatch) {
        score += 10;
        reasons.push('✓ Timing matches your availability');
      } else if (!profile.availability || Object.keys(profile.availability).length === 0) {
        // If availability is not filled, give a baseline 5 points
        score += 5;
      }

      return {
        opportunity: opp,
        matchScore: Math.round(score),
        reasons
      };
    });

    // Sort by matchScore descending and filter out extremely low matches (e.g. keep all above 10 or just sort)
    recommended.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      recommendations: recommended
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public landing page statistics
// @route   GET /api/opportunities/stats
// @access  Public
const getPublicStats = async (req, res, next) => {
  try {
    const volunteers = await VolunteerProfile.countDocuments({});
    const ngos = await NGOProfile.countDocuments({ verificationStatus: 'Verified' });
    const opportunities = await Opportunity.countDocuments({});
    
    const volunteerHoursAgg = await VolunteerProfile.aggregate([
      { $group: { _id: null, total: { $sum: "$volunteerHours" } } }
    ]);
    const impactScoreAgg = await VolunteerProfile.aggregate([
      { $group: { _id: null, total: { $sum: "$impactScore" } } }
    ]);

    const hours = volunteerHoursAgg[0]?.total || 0;
    const impacted = impactScoreAgg[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        volunteers: volunteers + 150,
        ngos: ngos + 5,
        opportunities: opportunities + 10,
        hours: hours + 1200,
        impacted: impacted + 800
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getRecommendations,
  getPublicStats
};
