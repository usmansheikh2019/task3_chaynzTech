const sequelize = require("../../db/connection");

const userModel = sequelize.import("../../../models/user");
const AuthUserModel = sequelize.import("../../../models/authUsers");
const courseModel = sequelize.import("../../../models/course");
const experienceModel = sequelize.import("../../../models/experience");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// User registration
exports.registerUser = async (req, res) => {
  try {
    // Custom user id
    //const userId = Math.floor(new Date().getTime() + Math.random() * 90000);
    //const deviceId = Math.floor(new Date().getTime() + Math.random() * 90000);
    // console.log(`userId: ${userId}`);
    // console.log(`deviceId: ${deviceId}`);
    const user = await userModel.create(req.body);
    if (user) {
      const userAuth = await AuthUserModel.create({ userId: user.id });
      res.status(200).json({ user, userAuth });
    }
  } catch (e) {
    if (e.errors) {
      // Debugging
      // console.log(e.errors[0]);
      return res.status(400).json({ error: e.errors[0].message });
    }
    res.status(500).json({ error: e.message });
  }
};

// User authentication
exports.authenticateUser = async function (req, res, next) {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decodedToken = jwt.verify(token, "tokenSecretKey");
    const authUser = await AuthUserModel.findOne({
      where: {
        userId: decodedToken.id,
        token: token,
      },
    });
    if (!authUser) {
      // 401 Unauthorized client
      return res.status(401).json({ error: "Please login first" });
    }
    const user = await userModel.findOne({
      where: {
        id: authUser.userId,
      },
    });
    req.authId = authUser.id;
    req.user = user;
    next();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

//  User logout
exports.logoutUser = async (req, res) => {
  try {
    const authId = await req.authId;
    const user = await req.user;
    if (!user) {
      return res.status(401).json({ error: "Please login first" });
    }
    const authUser = await AuthUserModel.findOne({
      where: {
        id: authId,
      },
    });
    await authUser.destroy();
    res
      .status(200)
      .json({ message: `${user.fname} ${user.lname} is logged out` });
  } catch (e) {
    if (e.errors) {
      // Debugging
      // console.log(e.errors[0]);
      return res.status(400).json({ error: e.errors[0].message });
    }
    res.status(500).json({ error: e.message });
  }
};

// User login
exports.loginUser = async (req, res) => {
  try {
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    if (!userEmail) {
      return res.status(400).json({ message: "Please enter your email" });
    }
    if (!userPassword) {
      return res.status(400).json({ message: "Please enter your password" });
    }
    const user = await verifyCredentials(userEmail, userPassword);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const userAuth = await AuthUserModel.create({ userId: user.id });
    res.status(200).json({ user, userAuth });
  } catch (e) {
    if (e.errors) {
      // Debugging
      // console.log(e.errors[0]);
      return res.status(400).json({ error: e.errors[0].message });
    }
    res.status(500).json({ error: e.message });
  }
};

// Verify credentials
async function verifyCredentials(userEmail, userPassword) {
  const user = await userModel.findOne({
    where: {
      email: userEmail,
    },
  });
  if (!user) {
    return false;
  }
  const passwordMatches = await bcrypt.compare(userPassword, user.password);
  if (!passwordMatches) {
    return false;
  } else {
    return user;
  }
}

// Add course
exports.addCourse = async (req, res) => {
  try {
    const user = await req.user;
    if (!user) {
      return res.status(401).json({ error: "Please login first" });
    }
    const courseName = await req.body.courseName;
    const courseExist = await courseModel.findOne({
      where: {
        userId: user.id,
        courseName: courseName,
      },
    });
    if (courseExist) {
      return res.status(403).json({
        message: "You are already enrolled in this course",
        course: {
          courseName: courseExist.courseName,
          creditHours: courseExist.creditHours,
        },
      });
    }
    const course = await courseModel.create({ userId: user.id, ...req.body });
    res.status(201).json(course);
  } catch (e) {
    if (e.errors) {
      // Debugging
      // console.log(e.errors[0]);
      return res.status(400).json({ error: e.errors[0].message });
    }
    res.status(500).json({ error: e.message });
  }
};

// view courses
exports.getCourses = async (req, res) => {
  try {
    const user = await req.user;
    if (!user) {
      return res.status(401).json({ error: "Please login first" });
    }
    const courses = await courseModel.findAll({
      where: {
        userId: user.id,
      },
    });
    if (!courses) {
      return res.status(404).json({ message: "No courses found" });
    }
    const Courses = courses.map(v => {
      return {
        courseName: v.courseName,
        creditHours: v.creditHours,
      };
    });

    res
      .status(200)
      .json({ message: `${courses.length} courses found`, Courses: Courses });
  } catch (e) {
    if (e.errors) {
      // Debugging
      // console.log(e.errors[0]);
      return res.status(400).json({ error: e.errors[0].message });
    }
    res.status(500).json({ error: e.message });
  }
};

// Delete courses
exports.deleteCourse = async (req, res) => {
  try {
    const user = await req.user;
    if (!user) {
      return res.status(401).json({ error: "Please login first" });
    }
    const courseName = await req.body.courseName;
    const courseExist = await courseModel.findOne({
      where: {
        userId: user.id,
        courseName: courseName,
      },
    });
    if (!courseExist) {
      return res
        .status(404)
        .json({ error: `Course: ${courseName}, does not exist ` });
    }
    await courseExist.destroy();
    res.status(200).json({ message: `Course: "${courseName}" is removed` });
  } catch (e) {
    if (e.errors) {
      // Debugging
      // console.log(e.errors[0]);
      return res.status(400).json({ error: e.errors[0].message });
    }
    res.status(500).json({ error: e.message });
  }
};

// Create experience
exports.createExperience = async (req, res) => {
  try {
    const user = await req.user;
    if (!user) {
      return res.status(401).json({ error: "Please login first" });
    }
    const companyName = req.body.companyName;
    const experienceExist = await experienceModel.findOne({
      where: {
        userId: user.id,
        companyName: companyName,
      },
    });
    if (experienceExist) {
      return res.status(403).json({
        message: `Experience already exist`,
        Experience: {
          companyName: experienceExist.companyName,
          years: experienceExist.years,
        },
      });
    }
    const experience = await experienceModel.create({
      userId: user.id,
      ...req.body,
    });
    res.status(201).json(experience);
  } catch (e) {
    if (e.errors) {
      // Debugging
      // console.log(e.errors[0]);
      return res.status(400).json({ error: e.errors[0].message });
    }
    res.status(500).json({ error: e.message });
  }
};

// View experiences
exports.getExperience = async (req, res) => {
  try {
    const user = await req.user;
    if (!user) {
      return res.status(401).json({ error: "Please login first" });
    }
    const experiences = await experienceModel.findAll({
      where: {
        userId: user.id,
      },
    });
    if (!experiences) {
      return res.status(404).json({ message: "No experiences found" });
    }
    const Experiences = experiences.map(v => {
      return {
        companyName: v.companyName,
        years: v.years,
      };
    });

    res.status(200).json({
      message: `${Experiences.length} experiences found`,
      Experiences: Experiences,
    });
  } catch (e) {
    if (e.errors) {
      // Debugging
      // console.log(e.errors[0]);
      return res.status(400).json({ error: e.errors[0].message });
    }
    res.status(500).json({ error: e.message });
  }
};

// Delete experience
exports.deleteExperience = async (req, res) => {
  try {
    const user = await req.user;
    if (!user) {
      return res.status(401).json({ error: "Please login first" });
    }
    const companyName = await req.body.companyName;
    const experienceExist = await experienceModel.findOne({
      where: {
        userId: user.id,
        companyName: companyName,
      },
    });
    if (!experienceExist) {
      return res
        .status(404)
        .json({ error: `Experience with ${companyName}, does not exist ` });
    }
    await experienceExist.destroy();
    res
      .status(200)
      .json({ message: `Experience record with: ${companyName} is removed` });
  } catch (e) {
    if (e.errors) {
      // Debugging
      // console.log(e.errors[0]);
      return res.status(400).json({ error: e.errors[0].message });
    }
    res.status(500).json({ error: e.message });
  }
};
