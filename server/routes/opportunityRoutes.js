const express = require('express');
const router = express.Router();
const {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getRecommendations,
  getPublicStats
} = require('../controllers/opportunityController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getOpportunities);
router.get('/stats', getPublicStats);
router.get('/recommendations', protect, authorize('volunteer'), getRecommendations);
router.get('/:id', getOpportunityById);
router.post('/', protect, authorize('ngo'), createOpportunity);
router.put('/:id', protect, authorize('ngo', 'admin'), updateOpportunity);
router.delete('/:id', protect, authorize('ngo', 'admin'), deleteOpportunity);

module.exports = router;
