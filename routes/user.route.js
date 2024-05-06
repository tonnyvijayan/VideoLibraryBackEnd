const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const saltRound = 10;
const { logEvents } = require("../middlewares/logger");
const { verifyJwt } = require("../middlewares/verifyJwt");

router.route("/createuser").post(async (req, res) => {
  const userData = req.body;
  if (!userData.name || !userData.password || !userData.email) {
    return res
      .status(400)
      .json({ message: "username,password and email are required" });
  }
  try {
    const hashedPassword = await bcrypt.hash(userData.password, saltRound);
    const accessToken = await jwt.sign(
      { name: userData.name },
      process.env.ACCESS_TOKEN_SIGNING_KEY,
      { expiresIn: "20s" }
    );
    const refreshToken = await jwt.sign(
      { name: userData.name },
      process.env.REFRESH_TOKEN_SIGNING_KEY,
      { expiresIn: "2m" }
    );
    const newUser = {
      ...userData,
      password: hashedPassword,
      refreshToken: refreshToken,
    };
    let newUserDetails = new User(newUser);

    let newUserCreated = await newUserDetails.save();

    logEvents(`${newUserCreated.name} created a new account`, "users.txt");

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      // maxAge: 24 * 60 * 60 * 1000,
      maxAge: 120000,
    });
    res.status(201).json({
      message: `Account for ${newUserCreated.name} created`,
      accessToken: accessToken,
    });
  } catch (error) {
    res
      .status(409)
      .json({ message: "unable to create new user", reason: error.message });
  }
});

router.route("/authenticateuser").post(async (req, res, next) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res
      .status(400)
      .json({ message: "username and password are required" });
  }
  try {
    const [userData] = await User.find({ name: name });
    if (!userData) {
      return res.status(401).json({ message: "User Not Found" });
    }
    const userPasswordHash = userData.password;
    console.log({ password, userPasswordHash });
    const userPasswordCheck = await bcrypt.compare(password, userPasswordHash);

    if (userPasswordCheck) {
      const accessToken = jwt.sign(
        { name: userData.name },
        process.env.ACCESS_TOKEN_SIGNING_KEY,
        {
          expiresIn: "20s",
        }
      );
      const refreshToken = jwt.sign(
        { name: userData.name },
        process.env.REFRESH_TOKEN_SIGNING_KEY,
        {
          expiresIn: "2m",
        }
      );
      console.log({ userData, refreshToken });

      userData.refreshToken = refreshToken;
      await userData.save();

      logEvents(`${userData.name} logged in`, "users.txt");
      res.cookie("jwt", refreshToken, { httpOnly: true, maxAge: 120000 });
      res
        .status(200)
        .json({ userLogin: userPasswordCheck, accessToken: accessToken });
    } else {
      res.status(403).json({ message: "User authentication failed" });
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: err });
  }
});

router.route("/refresh").get(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res
      .status(401)
      .json({ message: "Unauthorized/refreshToken missing" });
  }
  console.log(cookies.jwt);
  let token = cookies.jwt;
  const [getUserByToken] = await User.find({ refreshToken: token });
  console.log({ getUserByToken });
  await jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SIGNING_KEY,
    (err, decoded) => {
      if (err || getUserByToken.name !== decoded.name) {
        return res
          .status(403)
          .json({ message: "forbidden/refreshToken expired" });
      }
      const newAccessToken = jwt.sign(
        { name: decoded.name },
        process.env.ACCESS_TOKEN_SIGNING_KEY,
        { expiresIn: "20s" }
      );
      res.status(201).json({ accessToken: newAccessToken });
    }
  );
});

router.route("/logout").get(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) {
    return res.sendStatus(204);
  }

  const refreshToken = cookies.jwt;
  const [userToBeLoggedOut] = await User.find({ refreshToken: refreshToken });
  if (!userToBeLoggedOut) {
    res.clearCookie("jwt", { httpOnly: true });
    return res.sendStatus(403);
  }
  userToBeLoggedOut.refreshToken = "";
  await userToBeLoggedOut.save();
  res.clearCookie("jwt", { httpOnly: true });
  res.status(200).json({ message: "User Logged out" });
});

router.route("/playlist").get(verifyJwt, (req, res) => {
  res.json({ message: `Here is ${req.user} playlist` });
});

module.exports = router;
