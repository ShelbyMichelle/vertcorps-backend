const express = require('express');
const router = express.Router();
const stats = require('../controllers/statisticsController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Admin-only statistics
router.get('/dashboard', auth, role('admin'), stats.getDashboardStats);
router.get('/districts', auth, role('admin'), stats.getByDistrict);
router.get('/sectors', auth, role('admin'), stats.getBySector);
router.get('/reviewers', auth, role('admin'), stats.getByReviewer);

module.exports = router;
