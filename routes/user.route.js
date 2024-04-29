const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const saltRound = 10;

const verifyUser = (name, password) => {};

router.route("/authenticateuser").post(async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const [userData] = await User.find({ name: name });
    if (!userData) {
      return next("user does not exist");
    }
    const userPasswordHash = userData.password;

    const userPasswordCheck = await bcrypt.compare(password, userPasswordHash);

    if (userPasswordCheck) {
      res.status(200).json({ userLogin: userPasswordCheck });
    } else {
      res.status(401).json({ message: "User authentication failed" });
    }
  } catch (err) {
    console.log(err);

    res.status(401).json({ message: err });
  }
});

router.route("/createuser").post(async (req, res) => {
  const userData = req.body;
  try {
    const hashedPassword = await bcrypt.hash(userData.password, saltRound);
    userData.password = hashedPassword;
    let newUserDetails = new User(userData);
    let newUserCreated = await newUserDetails.save();
    const token = await jwt.sign(
      { id: newUserCreated._id },
      process.env.SIGNING_KEY
    );
    res.json({ userDetails: newUserCreated, accessToken: token });
  } catch (error) {
    res.json({ message: "unable to create new user", reason: error.message });
  }
});

module.exports = router;
