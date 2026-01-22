const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// All routes require admin role
router.get('/users', auth, role('admin'), userController.getAllUsers);
router.post('/users/add', auth, role('admin'), userController.addUser);
router.put('/users/:id/role', auth, role('admin'), userController.updateUserRole);
router.delete('/users/:id', auth, role('admin'), userController.deleteUser);
router.put("/users/reset-password", auth, userController.resetPassword);


module.exports = router;
