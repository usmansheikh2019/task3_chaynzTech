const jwt = require("jsonwebtoken");
const sequelize = require("../src/db/connection");
const User = sequelize.import("./user");
module.exports = (sequelize, DataTypes) => {
  const AuthUser = sequelize.define("authUser", {
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
    // For production
    // accessToken: {
    //   type: DataTypes.STRING,
    // },
    // refreshToken: {
    //   type: DataTypes.STRING,
    // },

    //For testing, i have only used a single token which only expires on logout
    token: {
      type: DataTypes.STRING,
    },
  });
  AuthUser.beforeCreate(async (authUser, options) => {
    // For production
    // const accessToken = jwt.sign({}, "accessTokenSecretKey");
    // const refreshToken = jwt.sign({}, "refreshTokenSecretKey");
    // authUser.accessToken = accessToken;
    // authUser.refreshToken = refreshToken;

    // For testing purpose
    const token = jwt.sign(
      { id: authUser.userId.toString() },
      "tokenSecretKey"
    );
    authUser.token = token;
  });
  return AuthUser;
};
