const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Apply to an opportunity
// @route   POST /api/applications/:opportunityId
// @access  Private (Volunteer only)
const applyToOpportunity = async (req, res, next) => {
  try {
    const { message } = req.body;
    const opportunityId = req.params.opportunityId;
    const volunteerId = req.user._id;

    // Check if opportunity exists and is open
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      res.status(404);
      throw new Error('Opportunity not found');
    }

    if (opportunity.status !== 'Open') {
      res.status(400);
      throw new Error('This opportunity is no longer accepting applications');
    }

    // Check if already applied
    const alreadyApplied = await Application.findOne({ opportunityId, volunteerId });
    if (alreadyApplied) {
      res.status(400);
      throw new Error('You have already applied for this opportunity');
    }

    // Create Application
    const application = await Application.create({
      opportunityId,
      volunteerId,
      message,
      status: 'Pending'
    });

    // Notify the NGO
    await Notification.create({
      userId: opportunity.ngoId,
      title: 'New Opportunity Application',
      message: `${req.user.name} has applied for "${opportunity.title}".`,
      type: 'application'
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (Accept / Reject)
// @route   PUT /api/applications/:id
// @access  Private (NGO only/Admin)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'Accepted', 'Rejected', 'Cancelled'
    
    if (!['Accepted', 'Rejected', 'Cancelled'].includes(status)) {
      res.status(400);
      throw new Error('Invalid application status');
    }

    const application = await Application.findById(req.params.id)
      .populate('opportunityId')
      .populate('volunteerId', 'name email');

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    // Ensure logged in NGO owns the opportunity
    if (application.opportunityId.ngoId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to manage this application');
    }

    application.status = status;
    application.reviewedAt = Date.now();
    await application.save();

    // If accepted, check and increment volunteersJoined
    if (status === 'Accepted') {
      const opportunity = await Opportunity.findById(application.opportunityId._id);
      opportunity.volunteersJoined += 1;
      if (opportunity.volunteersJoined >= opportunity.volunteersNeeded) {
        opportunity.status = 'Full';
      }
      await opportunity.save();
    }

    // Notify Volunteer
    await Notification.create({
      userId: application.volunteerId._id,
      title: `Application ${status}`,
      message: `Your application for "${application.opportunityId.title}" has been ${status.toLowerCase()} by the NGO.`,
      type: 'status_change'
    });

    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current volunteer's applications
// @route   GET /api/applications/my
// @access  Private (Volunteer only)
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ volunteerId: req.user._id })
      .populate({
        path: 'opportunityId',
        populate: { path: 'ngoId', select: 'name profileImage' }
      })
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for NGO's opportunities
// @route   GET /api/applications/ngo
// @access  Private (NGO only)
const getNGOApplications = async (req, res, next) => {
  try {
    // Find opportunities created by NGO
    const opportunities = await Opportunity.find({ ngoId: req.user._id });
    const oppIds = opportunities.map(opp => opp._id);

    const applications = await Application.find({ opportunityId: { $in: oppIds } })
      .populate('opportunityId', 'title date status')
      .populate('volunteerId', 'name email phone profileImage')
      .sort({ appliedAt: -1 });

    // Populate volunteer profiles to show skills & details
    const volunteerIds = applications.map(app => app.volunteerId._id);
    const VolunteerProfile = require('../models/VolunteerProfile');
    const profiles = await VolunteerProfile.find({ userId: { $in: volunteerIds } });

    const formattedApplications = applications.map(app => {
      const profile = profiles.find(p => p.userId.toString() === app.volunteerId._id.toString());
      return {
        ...app.toObject(),
        volunteerProfile: profile || null
      };
    });

    res.json({
      success: true,
      applications: formattedApplications
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToOpportunity,
  updateApplicationStatus,
  getMyApplications,
  getNGOApplications
};
