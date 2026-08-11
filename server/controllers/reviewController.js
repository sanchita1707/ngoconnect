const Review = require('../models/Review');
const NGOProfile = require('../models/NGOProfile');
const Opportunity = require('../models/Opportunity');

// @desc    Create review for NGO
// @route   POST /api/reviews
// @access  Private (Volunteer only)
const createReview = async (req, res, next) => {
  try {
    const { ngoId, opportunityId, rating, comment } = req.body;

    // Check if review already exists
    const reviewExists = await Review.findOne({
      reviewerId: req.user._id,
      ngoId,
      opportunityId
    });

    if (reviewExists) {
      res.status(400);
      throw new Error('You have already reviewed this opportunity');
    }

    const review = await Review.create({
      reviewerId: req.user._id,
      ngoId,
      opportunityId,
      rating: Number(rating),
      comment
    });

    // Update NGO trustScore
    await recalculateNGOTrustScore(ngoId);

    res.status(201).json({
      success: true,
      message: 'Review posted successfully',
      review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get NGO reviews
// @route   GET /api/reviews/ngo/:ngoId
// @access  Public
const getNGOReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ ngoId: req.params.ngoId })
      .populate('reviewerId', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Dynamically recalculate and update trust score
const recalculateNGOTrustScore = async (ngoUserId) => {
  try {
    const ngo = await NGOProfile.findOne({ userId: ngoUserId });
    if (!ngo) return;

    let score = 0;

    // 1. Verification Bonus (40 pts)
    if (ngo.verificationStatus === 'Verified') {
      score += 40;
    }

    // 2. Volunteers Joined (Max 30 pts)
    // Find opportunities for this NGO
    const opportunities = await Opportunity.find({ ngoId: ngoUserId });
    const totalVolunteers = opportunities.reduce((sum, opp) => sum + (opp.volunteersJoined || 0), 0);
    score += Math.min(totalVolunteers * 2, 30);

    // 3. Average Rating (Max 30 pts)
    const reviews = await Review.find({ ngoId: ngoUserId });
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length;
      score += Math.min(Math.round(avgRating * 6), 30);
    } else {
      score += 20; // Default baseline score for rating when unreviewed
    }

    ngo.trustScore = Math.min(score, 100);
    await ngo.save();
  } catch (error) {
    console.error('Error recalculating trust score:', error);
  }
};

module.exports = {
  createReview,
  getNGOReviews,
  recalculateNGOTrustScore
};
