// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'district_EDO', 'reviewer'),
      allowNull: false
    },
    district: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  // ✅ Associations
  User.associate = (models) => {
    User.hasMany(models.Notification, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE'
    });

    User.hasMany(models.EsmpDistrictUpload, {
      foreignKey: 'submitted_by'
    });

    User.hasMany(models.Review, {
      foreignKey: 'reviewer_id'
    });

    User.hasMany(models.ReviewerAssignment, {
      foreignKey: 'reviewer_id'
    });
  };

  return User; // 🔴 REQUIRED
};
