const Participation = require('../models/Participation');
const Opportunity = require('../models/Opportunity');
const VolunteerProfile = require('../models/VolunteerProfile');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const Badge = require('../models/Badge');

// @desc    Log and verify volunteer participation
// @route   POST /api/participation
// @access  Private (NGO only/Admin)
const logParticipation = async (req, res, next) => {
  try {
    const { volunteerId, opportunityId, hours, feedback, peopleImpacted } = req.body;

    // Verify opportunity exists
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      res.status(404);
      throw new Error('Opportunity not found');
    }

    // Ensure user is authorized (NGO who created the opportunity or admin)
    if (opportunity.ngoId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to verify participation for this opportunity');
    }

    // Check if participation is already logged
    const existingParticipation = await Participation.findOne({ volunteerId, opportunityId });
    if (existingParticipation) {
      res.status(400);
      throw new Error('Participation already logged for this volunteer and opportunity');
    }

    // Create unique Certificate ID
    const certificateId = `CERT-${opportunityId.toString().substring(18)}-${volunteerId.toString().substring(18)}-${Math.floor(1000 + Math.random() * 9000)}`.toUpperCase();

    // Create Participation record
    const participation = await Participation.create({
      volunteerId,
      opportunityId,
      ngoId: req.user._id,
      hours: Number(hours),
      feedback,
      peopleImpacted: Number(peopleImpacted || 0),
      verifiedByNGO: true,
      certificateId
    });

    // Update application status to Completed
    await Application.findOneAndUpdate(
      { volunteerId, opportunityId },
      { status: 'Completed' }
    );

    // Update Volunteer Profile (Hours, Impact Score, XP, Level, Badges)
    const profile = await VolunteerProfile.findOne({ userId: volunteerId });
    if (profile) {
      // Hours
      profile.volunteerHours += Number(hours);

      // Impact Score = hours * 5 + peopleImpacted * 10
      profile.impactScore += (Number(hours) * 5) + (Number(peopleImpacted || 0) * 10);

      // XP calculation: hours * 100 + urgency bonus + base verified bonus
      let xpEarned = Number(hours) * 100;
      if (opportunity.urgency === 'Urgent' || opportunity.urgency === 'Critical') {
        xpEarned += 150;
      }
      xpEarned += 100; // Verified participation bonus
      profile.xp += xpEarned;

      // Update Levels based on XP
      let oldLevel = profile.level;
      if (profile.xp >= 8000) {
        profile.level = 'Social Hero';
      } else if (profile.xp >= 4000) {
        profile.level = 'Impact Leader';
      } else if (profile.xp >= 2000) {
        profile.level = 'Community Champion';
      } else if (profile.xp >= 1000) {
        profile.level = 'Contributor';
      } else if (profile.xp >= 500) {
        profile.level = 'Helper';
      } else {
        profile.level = 'Newcomer';
      }

      // Check Badges & Award them
      const earnedBadgeIds = profile.badges.map(b => b.toString());
      const allBadges = await Badge.find({});

      for (let badge of allBadges) {
        if (!earnedBadgeIds.includes(badge._id.toString())) {
          let earnsBadge = false;

          if (badge.requirement === 'first_participation') {
            earnsBadge = true;
          } else if (badge.requirement === '10_hours' && profile.volunteerHours >= 10) {
            earnsBadge = true;
          } else if (badge.requirement === '50_hours' && profile.volunteerHours >= 50) {
            earnsBadge = true;
          } else if (badge.requirement === '100_hours' && profile.volunteerHours >= 100) {
            earnsBadge = true;
          } else if (badge.requirement === 'helping_hand' && profile.impactScore >= 200) {
            earnsBadge = true;
          } else if (badge.requirement === 'crisis_supporter' && (opportunity.urgency === 'Urgent' || opportunity.urgency === 'Critical')) {
            earnsBadge = true;
          } else if (badge.requirement === 'green_warrior' && opportunity.category.toLowerCase() === 'environment') {
            earnsBadge = true;
          } else if (badge.requirement === 'education_champion' && opportunity.category.toLowerCase() === 'education') {
            earnsBadge = true;
          }

          if (earnsBadge) {
            profile.badges.push(badge._id);
            profile.xp += badge.xpReward; // Add badge reward XP

            // Notify Volunteer of Badge Unlock
            await Notification.create({
              userId: volunteerId,
              title: '🏆 Badge Unlocked!',
              message: `Congratulations! You unlocked the "${badge.name}" badge.`,
              type: 'badge'
            });
          }
        }
      }

      await profile.save();

      // Notify Level up if changed
      if (oldLevel !== profile.level) {
        await Notification.create({
          userId: volunteerId,
          title: '⚡ Level Up!',
          message: `Awesome! You have leveled up from ${oldLevel} to ${profile.level}!`,
          type: 'level_up'
        });
      }

      // Notify Volunteer of verified participation
      await Notification.create({
        userId: volunteerId,
        title: '⭐ Hours Verified',
        message: `Your participation in "${opportunity.title}" has been verified. +${hours} hours, +${xpEarned} XP awarded!`,
        type: 'participation'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Participation verified successfully. Volunteer stats updated.',
      participation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current volunteer's participation list
// @route   GET /api/participation/my
// @access  Private (Volunteer only)
const getMyParticipation = async (req, res, next) => {
  try {
    const participations = await Participation.find({ volunteerId: req.user._id })
      .populate('opportunityId', 'title category urgency date')
      .populate('ngoId', 'name')
      .sort({ activityDate: -1 });

    res.json({
      success: true,
      participations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get NGO's verification records
// @route   GET /api/participation/ngo
// @access  Private (NGO only)
const getNGOParticipation = async (req, res, next) => {
  try {
    const participations = await Participation.find({ ngoId: req.user._id })
      .populate('opportunityId', 'title category date')
      .populate('volunteerId', 'name email')
      .sort({ activityDate: -1 });

    res.json({
      success: true,
      participations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  logParticipation,
  getMyParticipation,
  getNGOParticipation
};
