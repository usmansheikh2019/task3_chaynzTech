require("./db/connection");
const express = require("express");
const app = express();
const sequelize = require("./db/connection");
const db = require("../models");
const User = sequelize.import("../models/user");
const userController = require("./controllers/user/controller");
app.use(express.json());
//const User = db.import("user", require("../models/user"));
//const { User } = require("../models");

app.post("/user/register", userController.registerUser);
// app.delete("/dropUserTable", async (req, res) => {
//   try {
//     await User.drop();
//     res.status(200).json("user table deleted");
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });
app.post(
  "/user/logout",
  userController.authenticateUser,
  userController.logoutUser
);

app.post(
  "/user/addCourse",
  userController.authenticateUser,
  userController.addCourse
);

app.post("/user/login", userController.loginUser);

app.get(
  "/user/courses",
  userController.authenticateUser,
  userController.getCourses
);

app.delete(
  "/user/deleteCourse",
  userController.authenticateUser,
  userController.deleteCourse
);

app.post(
  "/user/addExperience",
  userController.authenticateUser,
  userController.createExperience
);

app.get(
  "/user/experiences",
  userController.authenticateUser,
  userController.getExperience
);

app.delete(
  "/user/deleteExperience",
  userController.authenticateUser,
  userController.deleteExperience
);

db.sequelize
  .sync()
  .then(req => {
    app.listen(3000, () => {
      console.log("listening on port 3000...");
    });
  })
  .catch(e => {
    console.log({ error: e.message });
  });
