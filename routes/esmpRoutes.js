// routes/esmpRoutes.js
const express = require('express');
const router = express.Router();
const esmpController = require('../controllers/esmpController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');

// ==============================
// ADMIN & REVIEWER ROUTES
// ==============================

/**
 * Get ALL ESMPs
 * Accessible by: Admin & Reviewer
 */
router.get(
  '/esmps',
  auth,
  esmpController.getAllEsmps
);

/**
 * Get ESMPs by status
 * Accessible by: Admin & Reviewer
 */
router.get(
  '/esmps/status/:status',
  auth,
  esmpController.getEsmpsByStatus
);

/**
 * Get Admin Dashboard Statistics
 * Accessible by: Admin only
 */
router.get(
  '/admin/dashboard-stats',
  auth,
  role('admin'),
  esmpController.getAdminDashboardStats
);

/**
 * Get Reviewer Dashboard Statistics
 * Accessible by: Reviewer only
 */
router.get(
  '/reviewer/dashboard-stats',
  auth,
  role('reviewer'),
  esmpController.getReviewerDashboardStats
);

/**
 * Assign reviewer to ESMP
 * Accessible by: Admin only
 */
router.put(
  '/esmps/:esmpId/assign',
  auth,
  role('admin'),
  esmpController.assignReviewer
);

/**
 * Submit review for ESMP
 * Accessible by: Reviewer only
 */
router.put(
  '/esmps/review/:esmpId',
  auth,
  role('reviewer'),
  upload.single('file'),
  esmpController.reviewAction
);

router.get(
  '/users/reviewers',
  auth,
  role('admin'),
  esmpController.getReviewers
);

module.exports = router;
