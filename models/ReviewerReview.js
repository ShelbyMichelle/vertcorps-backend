module.exports = (sequelize, DataTypes) => {
  const ReviewerReview = sequelize.define('ReviewerReview', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    assignment_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'reviewerassignments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    comments: DataTypes.TEXT,
    recommendation: {
      type: DataTypes.ENUM('Approve','Return','Reject'),
      allowNull: false
    }
  }, {
    tableName: 'reviewerreviews',
    timestamps: true
  });

  ReviewerReview.associate = (models) => {
    ReviewerReview.belongsTo(models.ReviewerAssignment, { foreignKey: 'assignment_id', as: 'assignment' });
  };

  return ReviewerReview;
};
