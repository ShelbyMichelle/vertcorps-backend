module.exports = (sequelize, DataTypes) => {
  const EsmpDistrictUpload = sequelize.define('EsmpDistrictUpload', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    esmp_id: DataTypes.STRING,
    project_name: DataTypes.STRING,
    district: DataTypes.STRING,
    subproject: DataTypes.STRING,
    coordinates: DataTypes.STRING,
    sector: DataTypes.STRING,
    cycle: DataTypes.STRING,
    funding_component: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM(
        'Pending',
        'Approved',
        'Rejected',
        'Overdue',
        'Returned'
      ),
      defaultValue: 'Pending'
    },
    file_name: DataTypes.STRING,
    file_path: DataTypes.STRING
  });

  return EsmpDistrictUpload;
};
