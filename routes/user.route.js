const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const playlistController = require("../controllers/playlistController");
const watchLaterController = require("../controllers/watchLaterController");
const { verifyJwt } = require("../middlewares/verifyJwt");

router.route("/createuser").post(userController.createUser);
router.route("/authenticateuser").post(userController.authenticateUser);
router.route("/refresh").get(userController.refresh);
router.route("/logout").get(userController.logout);

router
  .route("/fetchplaylists")
  .get(verifyJwt, playlistController.fetchPlaylists);
router
  .route("/createplaylist")
  .post(verifyJwt, playlistController.createPlaylist);
router
  .route("/deleteplaylist/:playlistName")
  .delete(verifyJwt, playlistController.deletePlaylist);
router
  .route("/addtoplaylist")
  .post(verifyJwt, playlistController.addToPlaylist);
router
  .route("/removefromplaylist")
  .post(verifyJwt, playlistController.removeFromPlaylist);

router
  .route("/fetchwatchlater")
  .get(verifyJwt, watchLaterController.fetchWatchLater);
router
  .route("/addtowatchlater")
  .post(verifyJwt, watchLaterController.addToWatchLater);
router
  .route("/removefromwatchlater")
  .post(verifyJwt, watchLaterController.removeFromWatchLater);

module.exports = router;
