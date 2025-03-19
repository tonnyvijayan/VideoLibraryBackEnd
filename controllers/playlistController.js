const User = require("../models/user.model");

const fetchPlaylists = async (req, res) => {
  let user = req.user;

  const [userData] = await User.find({ name: user }).populate(
    "playLists.videos"
  );
  const playListData = userData.playLists;
  res.status(200).json({ playLists: playListData });
};

const createPlaylist = async (req, res) => {
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
};

const deletePlaylist = async (req, res) => {
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
};

const addToPlaylist = async (req, res) => {
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

  res.status(201).json({ message: "Video added to playlist" });
};

const removeFromPlaylist = async (req, res) => {
  let user = req.user;
  const { playListName, videoId } = req.body;
  const [userToBeUpdated] = await User.find({ name: user });
  const [playListToBeUpdated] = userToBeUpdated.playLists.filter((item) => {
    return item.playListName === playListName;
  });

  const updatedVideolist = playListToBeUpdated.videos.filter((item) => {
    return item.toString() !== videoId;
  });

  playListToBeUpdated.videos = updatedVideolist;

  const mergedPlaylist = userToBeUpdated.playLists.map((item) => {
    return item.playListName === playListName ? playListToBeUpdated : item;
  });

  userToBeUpdated.playLists = mergedPlaylist;
  const addedToPlaylistDetails = await userToBeUpdated.save();

  res.status(200).json({ message: "video removed from playlist" });
};

module.exports = {
  fetchPlaylists,
  createPlaylist,
  deletePlaylist,
  addToPlaylist,
  removeFromPlaylist,
};
