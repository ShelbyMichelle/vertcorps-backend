
// models/ReviewerAssignment.js
module.exports = (sequelize, DataTypes) => {
  const ReviewerAssignment = sequelize.define('ReviewerAssignment', {
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
    assigned_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'reviewer_assignments',
    timestamps: true
  });

  ReviewerAssignment.associate = (models) => {
    ReviewerAssignment.belongsTo(models.EsmpDistrictUpload, { foreignKey: 'esmp_id' });
    ReviewerAssignment.belongsTo(models.User, { foreignKey: 'reviewer_id', as: 'Reviewer' });
    ReviewerAssignment.belongsTo(models.User, { foreignKey: 'assigned_by', as: 'AssignedBy' });
  };

  return ReviewerAssignment;
};
