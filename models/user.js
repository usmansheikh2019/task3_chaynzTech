const Sequelize = require("sequelize");
const sequelize = require("../src/db/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    fname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isAlpha: {
          msg: "Invalid first name",
        },
        notNull: {
          msg: "First name is required",
        },
      },
    },
    lname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isAlpha: {
          msg: "Invalid last name",
        },
        notNull: {
          msg: "Last name is required",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: {
          msg: "Invalid email",
        },
        notNull: {
          msg: "Email is required",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [8, 16],
          msg: "Password between 8 to 16 characters is acceptable",
        },
        notNull: {
          msg: "Password is required",
        },
      },
    },
  });

  //Hashing password before saving
  User.beforeCreate(async (user, options) => {
    if (user.changed("password")) {
      user.password = await bcrypt.hash(user.password, 8);
    }
  });
  return User;
};

function lettersandSpacesOnly(value) {
  var pattern = /^(?![\s.]+$)[a-zA-Z\s.]*$/;
  return pattern.test(value);
}
function isEmail(value) {
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(String(value).toLowerCase());
}
