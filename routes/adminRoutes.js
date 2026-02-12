// routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// All routes are prefixed with /api/admin from server.js

// POST /api/admin/assign-reviewer
router.post('/assign-reviewer', auth, role('admin'), admin.assignReviewer);

// POST /api/admin/update-status
router.post('/update-status', auth, role('admin'), admin.updateEsmpStatus);

// GET /api/admin/esmps
router.get('/esmps', auth, role('admin'), admin.getAllEsmps);

// PATCH /api/admin/users/:user_id/toggle
router.patch('/users/:user_id/toggle', auth, role('admin'), admin.toggleUserStatus);

module.exports = router;