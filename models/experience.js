const sequelize = require("../src/db/connection");
const User = sequelize.import("./user");

module.exports = (sequelize, DataTypes) => {
  const Experience = sequelize.define("experience", {
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
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Company name is required",
        },
        is: {
          args: /^(?![\s.]+$)[a-zA-Z\s.]*$/,
          msg: "Invalid company name",
        },
        isLowercase: {
          args: true,
          msg: "Company name must be in lowercase",
        },
      },
    },
    years: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: "experience year(s) must be am integer",
        },
        notNull: {
          msg: "Please enter your experience year(s) for the course",
        },
        max: {
          args: 15,
          msg: "Experience years cannot be greater than 15",
        },
        min: {
          args: 1,
          msg: "Experience year(s) should atlease be 1",
        },
      },
    },
  });
  return Experience;
};
