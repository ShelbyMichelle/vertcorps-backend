const express = require('express');
const router = express.Router();
const esmpController = require('../controllers/esmpController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');

// All routes are prefixed with /api/esmp from server.js

// GET /api/esmp/list (Get ALL ESMPs)
router.get('/list', auth, esmpController.getAllEsmps);

// GET /api/esmp/status/:status (Get ESMPs by status)
router.get('/status/:status', auth, esmpController.getEsmpsByStatus);

// GET /api/esmp/admin/dashboard-stats (Admin Dashboard Statistics)
router.get(
  '/admin/dashboard-stats',
  auth,
  role('admin'),
  esmpController.getAdminDashboardStats
);

// GET /api/esmp/reviewer/dashboard-stats (Reviewer Dashboard Statistics)
router.get(
  '/reviewer/dashboard-stats',
  auth,
  role('reviewer'),
  esmpController.getReviewerDashboardStats
);

// PUT /api/esmp/:esmpId/assign (Assign reviewer to ESMP)
router.put(
  '/:esmpId/assign',
  auth,
  role('admin'),
  esmpController.assignReviewer
);

// PUT /api/esmp/review/:esmpId (Submit review for ESMP)
router.put(
  '/review/:esmpId',
  auth,
  role('reviewer'),
  upload.single('file'),
  esmpController.reviewAction
);

// GET /api/esmp/reviewers (Get all reviewers)
router.get(
  '/reviewers',
  auth,
  role('admin'),
  esmpController.getReviewers
);

module.exports = router;