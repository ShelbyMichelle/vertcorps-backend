module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    esmp_id: DataTypes.INTEGER,
    reviewer_id: DataTypes.INTEGER,
    comments: DataTypes.TEXT,
    recommendation: DataTypes.ENUM('Approve', 'Return')
  });

  return Review;
};
