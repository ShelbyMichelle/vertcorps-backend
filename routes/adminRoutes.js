const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Admin only
router.post('/assign-reviewer', auth, role('admin'), admin.assignReviewer);
router.post('/update-status', auth, role('admin'), admin.updateEsmpStatus);
router.get('/esmps', auth, role('admin'), admin.getAllEsmps);
router.patch('/users/:user_id/toggle', auth, role('admin'), admin.toggleUserStatus);

module.exports = router;
