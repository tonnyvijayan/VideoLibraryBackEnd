const User = require("../models/user.model");

const fetchWatchLater = async (req, res) => {
  let user = req.user;

  const [userData] = await User.find({ name: user }).populate("watchLater");

  res.status(200).json({ watchLaterVideos: userData.watchLater });
};

const addToWatchLater = async (req, res) => {
  const user = req.user;
  const { videoId } = req.body;

  const [userToBeUpdated] = await User.find({ name: user });
  if (userToBeUpdated.watchLater.includes(videoId)) {
    return res.status(409).json({ message: "Video already exists" });
  }
  userToBeUpdated.watchLater.addToSet(videoId);
  await userToBeUpdated.save();
  res.status(201).json({ message: "Video added to watch later" });
};

const removeFromWatchLater = async (req, res) => {
  const user = req.user;
  const { videoId } = req.body;
  const [userToBeUpdated] = await User.find({ name: user });
  const updatedWatchlater = userToBeUpdated.watchLater.filter((item) => {
    return item.toString() !== videoId;
  });

  userToBeUpdated.watchLater = updatedWatchlater;
  await userToBeUpdated.save();
  res.status(200).json({ message: "Video removed from watch later" });
};

module.exports = { fetchWatchLater, addToWatchLater, removeFromWatchLater };
