// models/ESMP.js
module.exports = (sequelize, DataTypes) => {
  const ESMP = sequelize.define('ESMP', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    submittedBy: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    submittedDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('Unassigned', 'Pending', 'Approved', 'Return for revision', 'Rejected'),
      defaultValue: 'Unassigned'
    },
    assignedReviewerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assignedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reviewerName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    reviewComments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reviewRecommendation: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    reviewStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reviewSubmittedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reviewedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'esmp_files', // actual table in DB
    timestamps: true
  });

  // Define associations here if needed
  ESMP.associate = (models) => {
    // Example: if you need to associate with User model
    // ESMP.belongsTo(models.User, { foreignKey: 'assignedReviewerId', as: 'Reviewer' });
  };

  return ESMP;
};