const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");

router.route("/").get(videoController.fetchAllVideos);

router.route("/:videoId").get(videoController.fetchVideo);

router.route("/addvideo").post(videoController.addVideo);

module.exports = router;
