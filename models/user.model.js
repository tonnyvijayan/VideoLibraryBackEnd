const mongoose = require("mongoose");
const { Schema } = mongoose;
const Video = require("./videos.model.js");

const UserSchema = new Schema({
  name: {
    type: String,
    required: "Please enter your name",
    unique: true,
  },
  email: {
    type: String,
    required: "PLease enter an email",
    unique: true,
  },
  password: {
    type: String,
    required: "Please enter a password",
  },
  likedVideos: [{ type: Schema.Types.ObjectId, ref: "Video" }],
  playLists: [
    {
      playListName: {
        type: String,
        required: "enter a playlist name",
      },
      videos: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    },
  ],

  watchLater: [{ type: Schema.Types.ObjectId, ref: "Video" }],
  refreshToken: { type: String },
});

const User = mongoose.model("User", UserSchema);
User.init();

module.exports = User;
