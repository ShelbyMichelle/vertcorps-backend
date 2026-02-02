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
  '/list',  // ✅ Changed from '/esmps' to '/list'
  auth,
  esmpController.getAllEsmps
);

// OR keep both routes if other parts of your app use /esmps
router.get(
  '/esmps',
  auth,
  esmpController.getAllEsmps
);

router.get(
  '/list',  // Add this as an alias
  auth,
  esmpController.getAllEsmps
);

/**
 * Get ESMPs by status
 * Accessible by: Admin & Reviewer
 */
router.get(
  '/status/:status',  // ✅ Changed from '/esmps/status/:status'
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
  '/:esmpId/assign',  // ✅ Changed from '/esmps/:esmpId/assign'
  auth,
  role('admin'),
  esmpController.assignReviewer
);

/**
 * Submit review for ESMP
 * Accessible by: Reviewer only
 */
router.put(
  '/review/:esmpId',  // ✅ Changed from '/esmps/review/:esmpId'
  auth,
  role('reviewer'),
  upload.single('file'),
  esmpController.reviewAction
);

router.get(
  '/reviewers',  // ✅ Changed from '/users/reviewers'
  auth,
  role('admin'),
  esmpController.getReviewers
);

module.exports = router;