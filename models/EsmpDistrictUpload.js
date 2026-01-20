
// models/EsmpDistrictUpload.js
module.exports = (sequelize, DataTypes) => {
  const EsmpDistrictUpload = sequelize.define('EsmpDistrictUpload', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    esmp_id: {
      type: DataTypes.STRING, // Changed from INTEGER to STRING for generated IDs like "ESMP-123456-789"
      allowNull: true
    },
    project_name: DataTypes.STRING,
    district: DataTypes.STRING,
    subproject: DataTypes.STRING,
    coordinates: DataTypes.STRING,
    sector: DataTypes.STRING,
    cycle: DataTypes.STRING,
    funding_component: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('Submitted', 'Pending', 'Approved', 'Rejected', 'Overdue', 'Returned'),
      defaultValue: 'Submitted' // Changed from 'Pending' to 'Submitted'
    },
    submitted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    file_name: DataTypes.STRING,
    file_path: DataTypes.STRING,
    cloudinary_id: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'esmpdistrictuploads',
    timestamps: true
  });

  EsmpDistrictUpload.associate = (models) => {
    EsmpDistrictUpload.belongsTo(models.User, { foreignKey: 'submitted_by' });
    EsmpDistrictUpload.hasMany(models.Review, { foreignKey: 'esmp_id' });
    EsmpDistrictUpload.hasMany(models.ReviewerAssignment, { foreignKey: 'esmp_id' });
  };

  return EsmpDistrictUpload;
};
