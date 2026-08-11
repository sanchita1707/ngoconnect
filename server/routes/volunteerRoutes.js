const express = require('express');
const router = express.Router();
const { 
  getVolunteerProfileById, 
  toggleSaveOpportunity, 
  getSavedOpportunities,
  getLeaderboard
} = require('../controllers/volunteerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/leaderboard', getLeaderboard);
router.get('/saved', protect, authorize('volunteer'), getSavedOpportunities);
router.post('/saved/:oppId', protect, authorize('volunteer'), toggleSaveOpportunity);
router.get('/:id', protect, authorize('ngo', 'admin'), getVolunteerProfileById);

module.exports = router;
