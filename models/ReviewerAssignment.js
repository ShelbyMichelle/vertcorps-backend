module.exports = (sequelize, DataTypes) => {
  const ReviewerAssignment = sequelize.define('ReviewerAssignment', {
    deadline: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM('Assigned','Completed','Overdue'),
      defaultValue: 'Assigned',
    },
  });

  ReviewerAssignment.associate = (models) => {
    ReviewerAssignment.belongsTo(models.User, {
      foreignKey: 'reviewer_id',
      as: 'reviewer',
    });

    ReviewerAssignment.belongsTo(models.EsmpDistrictUpload, {
      foreignKey: 'esmp_id',
      as: 'esmp',
    });

    ReviewerAssignment.hasOne(models.ReviewerReview, {
      foreignKey: 'assignment_id',
      as: 'review',
    });
  };

  return ReviewerAssignment;
};
