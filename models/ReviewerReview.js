
// models/ReviewerReview.js (if you need it)
module.exports = (sequelize, DataTypes) => {
  const ReviewerReview = sequelize.define('ReviewerReview', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    assignment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'reviewer_assignments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    recommendation: {
      type: DataTypes.STRING,
      allowNull: false
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'reviewer_reviews',
    timestamps: true
  });

  ReviewerReview.associate = (models) => {
    ReviewerReview.belongsTo(models.ReviewerAssignment, { foreignKey: 'assignment_id', as: 'assignment' });
  };

  return ReviewerReview;
};