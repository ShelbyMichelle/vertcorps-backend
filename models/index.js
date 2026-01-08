const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const User = require('./User')(sequelize, DataTypes);
const EsmpDistrictUpload = require('./EsmpDistrictUpload')(sequelize, DataTypes);
const Notification = require('./Notification')(sequelize, DataTypes);
const Review = require('./Review')(sequelize, DataTypes);

// Relationships
User.hasMany(EsmpDistrictUpload, { foreignKey: 'submitted_by' });
EsmpDistrictUpload.belongsTo(User, { foreignKey: 'submitted_by' });

User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Review, { foreignKey: 'reviewer_id' });
Review.belongsTo(User, { foreignKey: 'reviewer_id' });

EsmpDistrictUpload.hasMany(Review, { foreignKey: 'esmp_id' });
Review.belongsTo(EsmpDistrictUpload, { foreignKey: 'esmp_id' });

module.exports = {
  sequelize,
  User,
  EsmpDistrictUpload,
  Notification,
  Review
};
