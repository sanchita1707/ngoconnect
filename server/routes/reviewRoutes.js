const express = require('express');
const router = express.Router();
const { createReview, getNGOReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('volunteer'), createReview);
router.get('/ngo/:ngoId', getNGOReviews);

module.exports = router;
