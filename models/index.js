const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database'); // your database.js

const User = require('./User')(sequelize, DataTypes);
const EsmpDistrictUpload = require('./EsmpDistrictUpload')(sequelize, DataTypes);
const Notification = require('./Notification')(sequelize, DataTypes);
const Review = require('./Review')(sequelize, DataTypes);
const ReviewerAssignment = require('./ReviewerAssignment')(sequelize, DataTypes);
const ReviewerReview = require('./ReviewerReview')(sequelize, DataTypes);

// Associations
User.hasMany(EsmpDistrictUpload, { foreignKey: 'submitted_by' });
EsmpDistrictUpload.belongsTo(User, { foreignKey: 'submitted_by' });

User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Review, { foreignKey: 'reviewer_id' });
Review.belongsTo(User, { foreignKey: 'reviewer_id' });

EsmpDistrictUpload.hasMany(Review, { foreignKey: 'esmp_id' });
Review.belongsTo(EsmpDistrictUpload, { foreignKey: 'esmp_id' });

ReviewerAssignment.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });
ReviewerAssignment.belongsTo(EsmpDistrictUpload, { foreignKey: 'esmp_id', as: 'esmp' });
ReviewerAssignment.hasOne(ReviewerReview, { foreignKey: 'assignment_id', as: 'review' });

ReviewerReview.belongsTo(ReviewerAssignment, { foreignKey: 'assignment_id', as: 'assignment' });

module.exports = {
  sequelize,
  User,
  EsmpDistrictUpload,
  Notification,
  Review,
  ReviewerAssignment,
  ReviewerReview
};
