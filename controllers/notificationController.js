const { Notification, User } = require('../models');

/**
 * =========================
 * CREATE NOTIFICATION (internal use)
 * =========================
 */
exports.createNotification = async ({
  user_id,
  title,
  message,
  type,
}) => {
  return await Notification.create({
    user_id,
    title,
    message,
    type,
  });
};

/**
 * =========================
 * GET USER NOTIFICATIONS
 * =========================
 */
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * =========================
 * MARK AS READ
 * =========================
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.is_read = true;
    await notification.save();

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * =========================
 * MARK ALL AS READ
 * =========================
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      { is_read: true },
      { where: { user_id: userId } }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
