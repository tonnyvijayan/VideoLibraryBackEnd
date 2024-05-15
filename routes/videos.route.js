const express = require("express");
const router = express.Router();
const Video = require("../models/videos.model");

router.route("/").get(async (req, res) => {
  try {
    const allVideoData = await Video.find({});
    res.json({ data: allVideoData });
  } catch (error) {
    res.json(error);
  }
});

router.route("/:videoId").get(async (req, res) => {
  try {
    const { videoId } = req.params;
    const videoData = await Video.find({ _id: videoId });
    res.send(videoData);
  } catch (error) {
    console.log(error.message);
    res.send("unable to find video");
  }
});

router.route("/addvideo").post(async (req, res) => {
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
    res.status(501).json("unable to add video");
  }
});

module.exports = router;
