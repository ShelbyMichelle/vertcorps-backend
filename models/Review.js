// models/Review.js
module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    esmp_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'esmpdistrictuploads',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    reviewer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM('Approved', 'Returned', 'Rejected'),
      allowNull: false
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    annotated_file_path: {
      type: DataTypes.STRING,
      allowNull: true
    },
    annotated_file_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'reviews',
    timestamps: true
  });

  Review.associate = (models) => {
    Review.belongsTo(models.EsmpDistrictUpload, { foreignKey: 'esmp_id' });
    Review.belongsTo(models.User, { foreignKey: 'reviewer_id', as: 'Reviewer' });
  };

  return Review;
};