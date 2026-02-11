// routes/esmpRoutes.js
const express = require('express');
const router = express.Router();

const esmpController = require('../controllers/esmpController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');

// ────────────────────────────────────────────────
// Public / Authenticated Routes (no role restriction)
// ────────────────────────────────────────────────

// GET /api/esmp/list          → All ESMPs (admin only in controller)
router.get('/list', auth, esmpController.getAllEsmps);

// GET /api/esmp/status/:status → ESMPs filtered by status (admin only in controller)
router.get('/status/:status', auth, esmpController.getEsmpsByStatus);

// ────────────────────────────────────────────────
// Admin-only Routes
// ────────────────────────────────────────────────

// GET /api/esmp/admin/dashboard-stats
router.get(
  '/admin/dashboard-stats',
  auth,
  role('admin'),
  esmpController.getAdminDashboardStats
);

// PUT /api/esmp/:esmpId/assign
router.put(
  '/:esmpId/assign',
  auth,
  role('admin'),
  esmpController.assignReviewer
);

// GET /api/esmp/reviewers     → List of reviewers for assignment dropdown
router.get(
  '/reviewers',
  auth,
  role('admin'),
  esmpController.getReviewers
);

// ────────────────────────────────────────────────
// Reviewer-only Routes
// ────────────────────────────────────────────────

// GET /api/esmp/my-esmps      → Only ESMPs assigned to current reviewer
router.get(
  '/my-esmps',
  auth,
  role('reviewer'),
  esmpController.getMyAssignedEsmps
);

// GET /api/esmp/reviewer/dashboard-stats
router.get(
  '/reviewer/dashboard-stats',
  auth,
  role('reviewer'),
  esmpController.getReviewerDashboardStats
);

// PUT /api/esmp/review/:esmpId → Submit review + optional annotated file
router.put(
  '/review/:esmpId',
  auth,
  role('reviewer'),
  upload.single('file'),           // 'file' matches FormData key in frontend
  esmpController.reviewAction
);

// ────────────────────────────────────────────────
// Optional: Single ESMP detail (useful for both roles)
// ────────────────────────────────────────────────
// GET /api/esmp/:id
// router.get('/:id', auth, esmpController.getSingleEsmp);  // Uncomment if you add the controller method

module.exports = router;