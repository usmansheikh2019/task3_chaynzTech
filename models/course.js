const sequelize = require("../src/db/connection");
const User = sequelize.import("./user");

module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define("course", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Course name is required",
        },
        is: {
          args: /^(?![\s.]+$)[a-zA-Z\s.]*$/,
          msg: "Invalid course name",
        },
        isLowercase: {
          args: true,
          msg: "Course name must be in lowercase",
        },
      },
    },
    creditHours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: "Credit hours must be am integer",
        },
        notNull: {
          msg: "Please enter credit-hours for the course",
        },
        max: {
          args: 5,
          msg: "Credit hours cannot be greater than 5",
        },
        min: {
          args: 1,
          msg: "Credit hours should atlease be 1",
        },
      },
    },
  });
  return Course;
};
