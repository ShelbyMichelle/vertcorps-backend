module.exports = (sequelize, DataTypes) => {
  const ReviewerAssignment = sequelize.define('ReviewerAssignment', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    esmp_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'esmpdistrictuploads',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    reviewer_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    deadline: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM('Assigned','Completed','Overdue'),
      defaultValue: 'Assigned'
    }
  }, {
    tableName: 'reviewerassignments',
    timestamps: true
  });

  ReviewerAssignment.associate = (models) => {
    ReviewerAssignment.hasOne(models.ReviewerReview, { foreignKey: 'assignment_id', as: 'review' });
    ReviewerAssignment.belongsTo(models.User, { foreignKey: 'reviewer_id', as: 'reviewer' });
    ReviewerAssignment.belongsTo(models.EsmpDistrictUpload, { foreignKey: 'esmp_id', as: 'esmp' });
  };

  return ReviewerAssignment;
};
