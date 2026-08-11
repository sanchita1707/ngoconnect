const express = require('express');
const router = express.Router();
const {
  logParticipation,
  getMyParticipation,
  getNGOParticipation
} = require('../controllers/participationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('ngo', 'admin'), logParticipation);
router.get('/my', protect, authorize('volunteer'), getMyParticipation);
router.get('/ngo', protect, authorize('ngo'), getNGOParticipation);

module.exports = router;
