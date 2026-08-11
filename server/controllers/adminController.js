const User = require('../models/User');
const NGOProfile = require('../models/NGOProfile');
const VolunteerProfile = require('../models/VolunteerProfile');
const Opportunity = require('../models/Opportunity');
const ResourceNeed = require('../models/ResourceNeed');
const Participation = require('../models/Participation');
const Report = require('../models/Report');
const Category = require('../models/Category');

// @desc    Get Admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const volunteersCount = await User.countDocuments({ role: 'volunteer' });
    const ngosCount = await User.countDocuments({ role: 'ngo' });
    const verifiedNgosCount = await NGOProfile.countDocuments({ verificationStatus: 'Verified' });
    const opportunitiesCount = await Opportunity.countDocuments();
    const activeOpportunitiesCount = await Opportunity.countDocuments({ status: 'Open' });

    // Aggregate total volunteer hours and people impacted
    const participationStats = await Participation.aggregate([
      { $match: { verifiedByNGO: true } },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$hours' },
          totalPeopleImpacted: { $sum: '$peopleImpacted' }
        }
      }
    ]);

    const totalHours = participationStats[0]?.totalHours || 0;
    const totalPeopleImpacted = participationStats[0]?.totalPeopleImpacted || 0;

    // Opportunities by Category
    const categoryStats = await Opportunity.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Monthly sign-up statistics (User growth)
    const monthlyUserStats = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        volunteersCount,
        ngosCount,
        verifiedNgosCount,
        opportunitiesCount,
        activeOpportunitiesCount,
        totalHours,
        totalPeopleImpacted,
        categories: categoryStats,
        userGrowth: monthlyUserStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res, next) => {
  try {
    const { search, role, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (suspend / activate)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'active', 'suspended'

    if (!['active', 'suspended'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot suspend an administrator account');
    }

    user.status = status;
    await user.save();

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending NGO verifications
// @route   GET /api/admin/ngos/pending
// @access  Private (Admin only)
const getPendingNGOs = async (req, res, next) => {
  try {
    const ngos = await NGOProfile.find({ verificationStatus: 'Pending' })
      .populate('userId', 'name email createdAt status')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: ngos.length,
      ngos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or Reject NGO Profile
// @route   PUT /api/admin/ngos/:id/verify
// @access  Private (Admin only)
const verifyNGO = async (req, res, next) => {
  try {
    const { status } = req.body; // 'Verified', 'Rejected'

    if (!['Verified', 'Rejected'].includes(status)) {
      res.status(400);
      throw new Error('Invalid verification status');
    }

    const ngo = await NGOProfile.findById(req.params.id);
    if (!ngo) {
      res.status(404);
      throw new Error('NGO profile not found');
    }

    ngo.verificationStatus = status;
    if (status === 'Verified') {
      ngo.trustScore = Math.max(ngo.trustScore, 40); // Base verified trust points
    }
    await ngo.save();

    // Trigger Notification to NGO Owner
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: ngo.userId,
      title: status === 'Verified' ? '✅ Organization Verified!' : '❌ Verification Rejected',
      message: status === 'Verified' 
        ? 'Your NGO registration has been verified! You now have a verified badge.'
        : 'Your NGO registration has been rejected. Please review your registration details or contact support.',
      type: 'verification'
    });

    res.json({
      success: true,
      message: `NGO verification status set to ${status}`,
      ngo
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all content reports
// @route   GET /api/admin/reports
// @access  Private (Admin only)
const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({})
      .populate('reporterId', 'name email')
      .populate('reportedUser', 'name email role')
      .populate('opportunityId', 'title ngoId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve a report
// @route   PUT /api/admin/reports/:id/resolve
// @access  Private (Admin only)
const resolveReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      res.status(404);
      throw new Error('Report not found');
    }

    report.status = 'Resolved';
    await report.save();

    res.json({
      success: true,
      message: 'Report resolved successfully',
      report
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getPendingNGOs,
  verifyNGO,
  getReports,
  resolveReport
};
