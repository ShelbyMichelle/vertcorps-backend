module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define("Review", {
    esmp_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reviewer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "Approved",
        "Approved with Conditions",
        "Returned for Revision",
        "Rejected"
      ),
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
    },
  });

  Review.associate = (models) => {
    Review.belongsTo(models.EsmpDistrictUpload, {
      foreignKey: "esmp_id",
    });

    Review.belongsTo(models.User, {
      foreignKey: "reviewer_id",
    });
  };

  return Review;
};
