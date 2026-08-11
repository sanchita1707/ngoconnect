const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getPendingNGOs,
  verifyNGO,
  getReports,
  resolveReport
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/ngos/pending', getPendingNGOs);
router.put('/ngos/:id/verify', verifyNGO);
router.get('/reports', getReports);
router.put('/reports/:id/resolve', resolveReport);

module.exports = router;
