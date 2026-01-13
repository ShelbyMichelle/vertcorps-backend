module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('admin', 'district', 'reviewer'),
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  User.associate = (models) => {
    User.hasMany(models.EsmpDistrictUpload, { foreignKey: 'submitted_by' });
    User.hasMany(models.Notification, { foreignKey: 'user_id' });
    User.hasMany(models.Review, { foreignKey: 'reviewer_id' });
    User.hasMany(models.ReviewerAssignment, { foreignKey: 'reviewer_id' });
  };

  return User;
};
