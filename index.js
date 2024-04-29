require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const resourceNotFound = require("./middlewares/resourceNotFound");
const errorHandler = require("./middlewares/errorHandler");
const intializeDbConnection = require("./db/initializeDbConnection");
const videos = require("./routes/videos.route");
const user = require("./routes/user.route");

const app = express();
intializeDbConnection();
app.use(cors());
app.use(bodyParser.json());
app.use("/videos", videos);
app.use("/user", user);

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("hi");
});

app.use(errorHandler);
app.use(resourceNotFound);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
