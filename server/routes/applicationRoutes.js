const express = require('express');
const router = express.Router();
const {
  applyToOpportunity,
  updateApplicationStatus,
  getMyApplications,
  getNGOApplications
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/:opportunityId', protect, authorize('volunteer'), applyToOpportunity);
router.put('/:id', protect, authorize('ngo', 'admin'), updateApplicationStatus);
router.get('/my', protect, authorize('volunteer'), getMyApplications);
router.get('/ngo', protect, authorize('ngo'), getNGOApplications);

module.exports = router;
