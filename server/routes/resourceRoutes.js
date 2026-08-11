const express = require('express');
const router = express.Router();
const {
  getResources,
  createResourceNeed,
  contributeResource,
  getNGOResources
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getResources);
router.get('/ngo', protect, authorize('ngo'), getNGOResources);
router.post('/', protect, authorize('ngo'), createResourceNeed);
router.post('/:id/contribute', protect, authorize('volunteer'), contributeResource);

module.exports = router;
