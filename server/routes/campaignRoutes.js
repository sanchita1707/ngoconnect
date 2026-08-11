const express = require('express');
const router = express.Router();
const {
  getCampaigns,
  createCampaign,
  getNGOCampaigns
} = require('../controllers/campaignController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getCampaigns);
router.get('/ngo', protect, authorize('ngo'), getNGOCampaigns);
router.post('/', protect, authorize('ngo'), createCampaign);

module.exports = router;
