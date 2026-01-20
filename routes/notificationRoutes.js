const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

/**
 * GET /api/notifications
 */
router.get('/', auth, getMyNotifications);

/**
 * PUT /api/notifications/:id/read
 */
router.put('/:id/read', auth, markAsRead);

/**
 * PUT /api/notifications/read-all
 */
router.put('/read-all', auth, markAllAsRead);

module.exports = router;
