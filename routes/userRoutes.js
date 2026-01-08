const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/add', userController.createUser);
router.get('/', userController.getUsers);

module.exports = router;
