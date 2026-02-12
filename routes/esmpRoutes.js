// routes/esmpRoutes.js
const express = require('express');
const router = express.Router();

const esmpController = require('../controllers/esmpController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');

// ────────────────────────────────────────────────
// ESMP Workflow Routes (authenticated)
// ────────────────────────────────────────────────

// GET /api/esmp/list          → All ESMPs (admin only in controller)
router.get('/list', auth, esmpController.getAllEsmps);

// GET /api/esmp/status/:status → ESMPs by status (admin only in controller)
router.get('/status/:status', auth, esmpController.getEsmpsByStatus);

// ────────────────────────────────────────────────
// Reviewer-only Routes
// ────────────────────────────────────────────────

// GET /api/esmp/my-esmps      → Assigned ESMPs for current reviewer
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

// PUT /api/esmp/review/:esmpId → Submit review + optional file
router.put(
  '/review/:esmpId',
  auth,
  role('reviewer'),
  upload.single('file'),
  esmpController.reviewAction
);

// GET /api/esmp/reviewers     → List of reviewers (still useful for admin dropdown, but move to admin if preferred)
router.get(
  '/reviewers',
  auth,
  role('admin'),
  esmpController.getReviewers
);

module.exports = router;