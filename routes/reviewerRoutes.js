
// ============================================
// routes/reviewerRoutes.js (CREATE THIS FILE)
// ============================================
const express = require('express');
const router = express.Router();
const reviewerController = require('../controllers/reviewerController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Get all submitted ESMPs (for reviewer to see)
router.get(
  '/esmps',
  auth,
  role('reviewer'),
  reviewerController.getSubmittedEsmps
);

// Get specific ESMP details
router.get(
  '/esmps/:id',
  auth,
  role('reviewer'),
  reviewerController.getEsmpDetails
);

// Download ESMP file
router.get(
  '/esmps/:id/download',
  auth,
  role('reviewer'),
  reviewerController.downloadEsmpFile
);

module.exports = router;
