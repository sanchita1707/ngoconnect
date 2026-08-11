const express = require('express');
const router = express.Router();
const {
  getEvents,
  createEvent,
  joinEvent,
  getNGOEvents
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getEvents);
router.get('/ngo', protect, authorize('ngo'), getNGOEvents);
router.post('/', protect, authorize('ngo'), createEvent);
router.post('/:id/join', protect, authorize('volunteer'), joinEvent);

module.exports = router;
