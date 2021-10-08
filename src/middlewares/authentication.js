const jwt = require("jsonwebtoken");
const sequelize = require("../db/connection");
const userModel = sequelize.import("../../models/user");
const userAuthModel = sequelize.import("../../models/authUsers");
exports.user = async function (req, res, next) {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decodedToken = jwt.verify(token, "tokenSecretKey");
    const authUser = await userAuthModel.findOne({
      where: {
        userId: decodedToken,
        token: token,
      },
    });
    if (!authUser) {
      // 401 Unauthorized client
      return res.status(401).json("Please login first");
    }
    const user = await userModel.findOne({
      where: {
        id: authUser.userId,
      },
    });
    req.token = accessToken;
    req.user = user;
    next();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
