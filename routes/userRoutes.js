const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// All routes are already prefixed with /api/users from server.js
// So these paths are relative to that base

// GET /api/users
router.get('/', auth, role('admin'), userController.getAllUsers);

// POST /api/users/add
router.post('/add', auth, role('admin'), userController.addUser);

// PUT /api/users/:id/role
router.put('/:id/role', auth, role('admin'), userController.updateUserRole);

// DELETE /api/users/:id
router.delete('/:id', auth, role('admin'), userController.deleteUser);

// PUT /api/users/reset-password
router.put('/reset-password', auth, userController.resetPassword);

module.exports = router;