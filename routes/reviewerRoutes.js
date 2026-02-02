const express = require('express');
const router = express.Router();
const reviewerController = require('../controllers/reviewerController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// All routes are prefixed with /api/reviewer from server.js

// GET /api/reviewer/esmps (Get all submitted ESMPs for reviewer)
router.get(
  '/esmps',
  auth,
  role('reviewer'),
  reviewerController.getSubmittedEsmps
);

// GET /api/reviewer/esmps/:id (Get specific ESMP details)
router.get(
  '/esmps/:id',
  auth,
  role('reviewer'),
  reviewerController.getEsmpDetails
);

// GET /api/reviewer/esmps/:id/download (Download ESMP file)
router.get(
  '/esmps/:id/download',
  auth,
  role('reviewer'),
  reviewerController.downloadEsmpFile
);

module.exports = router;