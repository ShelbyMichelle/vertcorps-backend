module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
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
    comments: DataTypes.TEXT,
    recommendation: DataTypes.ENUM('Approve', 'Return')
  }, {
    tableName: 'reviews',
    timestamps: true
  });

  Review.associate = (models) => {
    Review.belongsTo(models.User, { foreignKey: 'reviewer_id' });
    Review.belongsTo(models.EsmpDistrictUpload, { foreignKey: 'esmp_id' });
  };

  return Review;
};
