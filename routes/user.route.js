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
      { expiresIn: "2m" }
    );
    const refreshToken = await jwt.sign(
      { name: userData.name },
      process.env.REFRESH_TOKEN_SIGNING_KEY,
      { expiresIn: "6m" }
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
      maxAge: 360000,
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
          expiresIn: "2m",
        }
      );
      const refreshToken = jwt.sign(
        { name: userData.name },
        process.env.REFRESH_TOKEN_SIGNING_KEY,
        {
          expiresIn: "6m",
        }
      );
      console.log({ userData, refreshToken });

      userData.refreshToken = refreshToken;
      await userData.save();

      logEvents(`${userData.name} logged in`, "users.txt");
      res.cookie("jwt", refreshToken, { httpOnly: true, maxAge: 360000 });
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
        { expiresIn: "2m" }
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

//add middle ware to fetch user name after verifying auth header
router.route("/fetchplaylists").get(verifyJwt, async (req, res) => {
  console.log("entered fetchplaylist");
  let user = req.user;
  console.log("user is ", user);
  const [userData] = await User.find({ name: user }).populate(
    "playLists.videos"
  );
  const playListData = userData.playLists;
  res.status(200).json({ playLists: playListData });
});
router.route("/createplaylist").post(verifyJwt, async (req, res) => {
  let user = req.user;
  const { playListName } = req.body;

  let [userToBeUpdated] = await User.find({ name: user });

  const [checkIfPlaylistExist] = userToBeUpdated.playLists.filter((item) => {
    return item.playListName === playListName;
  });

  if (checkIfPlaylistExist) {
    return res
      .status(409)
      .json({ message: `Playlist ${playListName} already exists` });
  }

  userToBeUpdated.playLists.addToSet({
    playListName: playListName,
  });

  const updatedUser = await userToBeUpdated.save();

  const [newPlayList] = updatedUser.playLists.filter((item) => {
    return item.playListName === playListName;
  });

  res.status(201).json({
    message: `${playListName} playlist  created`,
    newPlayList: newPlayList,
  });
});

router
  .route("/deleteplaylist/:playlistName")
  .delete(verifyJwt, async (req, res) => {
    let user = req.user;
    const userParams = req.params;
    const [userToBeUpdated] = await User.find({ name: user });
    const updatedPlaylist = userToBeUpdated.playLists.filter((item) => {
      return item.playListName !== userParams.playlistName;
    });
    userToBeUpdated.playLists = updatedPlaylist;
    const updatedUserDetails = await userToBeUpdated.save();
    res
      .status(200)
      .json({ message: `${userParams.playlistName} playlist deleted` });
  });
router.route("/addtoplaylist").post(verifyJwt, async (req, res) => {
  let user = req.user;
  const { playListName, videoId } = req.body;
  const [userToBeUpdated] = await User.find({ name: user });
  const [playListToBeUpdated] = userToBeUpdated.playLists.filter((item) => {
    return item.playListName === playListName;
  });

  if (playListToBeUpdated.videos.includes(videoId)) {
    return res.status(409).json({ message: "Video already exist in playlist" });
  }
  playListToBeUpdated.videos = [...playListToBeUpdated.videos, videoId];
  const mergedPlaylist = userToBeUpdated.playLists.map((item) => {
    return item.playListName === playListName ? playListToBeUpdated : item;
  });

  userToBeUpdated.playLists = mergedPlaylist;
  const addedToPlaylistDetails = await userToBeUpdated.save();
  console.log("latest playlist", addedToPlaylistDetails);

  res.status(201).json({ message: "Video added to playlist" });
});

router.route("/removefromplaylist").post(verifyJwt, async (req, res) => {
  let user = req.user;
  const { playListName, videoId } = req.body;
  const [userToBeUpdated] = await User.find({ name: user });
  const [playListToBeUpdated] = userToBeUpdated.playLists.filter((item) => {
    return item.playListName === playListName;
  });

  console.log({ playListToBeUpdated });

  const updatedVideolist = playListToBeUpdated.videos.filter((item) => {
    return item.toString() !== videoId;
  });

  console.log({ updatedVideolist });
  playListToBeUpdated.videos = updatedVideolist;

  const mergedPlaylist = userToBeUpdated.playLists.map((item) => {
    return item.playListName === playListName ? playListToBeUpdated : item;
  });

  console.log({ mergedPlaylist });

  userToBeUpdated.playLists = mergedPlaylist;
  const addedToPlaylistDetails = await userToBeUpdated.save();
  console.log("removed from playlist", addedToPlaylistDetails);

  res.status(200).json({ message: "video removed from playlist" });
});

router.route("/fetchwatchlater").get(verifyJwt, async (req, res) => {
  console.log("entered watchlater");

  let user = req.user;
  console.log("requested user is", user);
  const [userData] = await User.find({ name: user }).populate("watchLater");

  console.log({ userData });
  res.status(200).json({ watchLaterVideos: userData.watchLater });
});

router.route("/addtowatchlater").post(async (req, res) => {
  const user = "sula";
  const { videoId } = req.body;

  const [userToBeUpdated] = await User.find({ name: user });
  if (userToBeUpdated.watchLater.includes(videoId)) {
    return res.status(409).json({ message: "Video already exists" });
  }
  userToBeUpdated.watchLater.addToSet(videoId);
  await userToBeUpdated.save();
  res.status(201).json({ message: "Video added to watch later" });
});
router.route("/removefromwatchlater").post(async (req, res) => {
  const user = "sula";
  const { videoId } = req.body;
  const [userToBeUpdated] = await User.find({ name: user });
  const updatedWatchlater = userToBeUpdated.watchLater.filter((item) => {
    return item.toString() !== videoId;
  });

  userToBeUpdated.watchLater = updatedWatchlater;
  await userToBeUpdated.save();
  res.status(200).json({ message: "Video removed from watch later" });
});

module.exports = router;
