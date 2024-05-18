const Video = require("../models/videos.model");

const fetchAllVideos = async (req, res) => {
  try {
    const allVideoData = await Video.find({});
    res.status(200).json({ data: allVideoData });
  } catch (error) {
    res.json(error);
  }
};

const fetchVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const videoData = await Video.find({ _id: videoId });
    res.status(200).json({ video: videoData });
  } catch (error) {
    console.log(error.message);
    res.send("unable to find video");
  }
};

const addVideo = async (req, res) => {
  const videoToBeAdded = req.body;
  console.log(videoToBeAdded);
  try {
    const newVideoModel = new Video(videoToBeAdded);
    const savedVideo = await newVideoModel.save();
    res
      .status(201)
      .json({ message: "Video added successfully", videoDetails: savedVideo });
  } catch (error) {
    console.log(error);
    res.status(500).json("unable to add video");
  }
};

module.exports = { fetchAllVideos, fetchVideo, addVideo };
