module.exports = (sequelize, DataTypes) => {
  const ReviewerReview = sequelize.define('ReviewerReview', {
    comments: DataTypes.TEXT,
    recommendation: {
      type: DataTypes.ENUM('Approve','Return','Reject'),
      allowNull: false,
    },
  });

  ReviewerReview.associate = (models) => {
    ReviewerReview.belongsTo(models.ReviewerAssignment, {
      foreignKey: 'assignment_id',
      as: 'assignment',
    });
  };

  return ReviewerReview;
};
