// models/Notification.js
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'notifications',
    timestamps: true
  });

  // ✅ Associations ONLY here
  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE'
    });
  };

  // After creating a notification in the DB, emit it over sockets and send email to the user
  Notification.afterCreate(async (notification, options) => {
    try {
      // Emit via sockets
      const socketService = require('../services/socket');
      const io = socketService.getIO();
      if (io) {
        io.to(`user_${notification.user_id}`).emit('notification', notification);
      }

      // Send email notification
      try {
        const { User } = require('../models');
        const user = await User.findByPk(notification.user_id);
        if (user) {
          const { sendNotificationEmail } = require('../services/notificationEmailService');
          const portalUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          const portalLink = `${portalUrl}/notifications`;
          await sendNotificationEmail(user, notification.title, notification.message, portalLink);
        }
      } catch (emailErr) {
        console.error('Failed to send notification email:', emailErr.message);
      }
    } catch (err) {
      console.error('Failed to emit notification via socket:', err);
    }
  });

  return Notification;
};
