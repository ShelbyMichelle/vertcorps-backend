const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Debug (remove after fix)
console.log('adminController loaded:', Object.keys(adminController));

// All routes prefixed with /api/admin

// POST /api/admin/assign-reviewer
router.post('/assign-reviewer', auth, role('admin'), adminController.assignReviewer);

// POST /api/admin/update-status
router.post('/update-status', auth, role('admin'), adminController.updateEsmpStatus);

// GET /api/admin/esmps
router.get('/esmps', auth, role('admin'), adminController.getSubmittedEsmps);  // ← now matches function name

// PATCH /api/admin/users/:user_id/toggle
router.patch('/users/:user_id/toggle', auth, role('admin'), adminController.toggleUserStatus);

module.exports = router;