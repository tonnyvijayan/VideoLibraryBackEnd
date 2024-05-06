require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { resourceNotFound } = require("./middlewares/resourceNotFound");
const { errorHandler } = require("./middlewares/errorHandler");
const { logger } = require("./middlewares/logger");
const intializeDbConnection = require("./db/initializeDbConnection");
const videos = require("./routes/videos.route");
const user = require("./routes/user.route");
const PORT = process.env.PORT;

const app = express();
intializeDbConnection();

const corsOptions = {
  credentials: true,
  origin: "http://localhost:5173",
};
app.use(logger);
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use("/videos", videos);
app.use("/user", user);

app.get("/", (req, res) => {
  res.send("hi");
});

app.use(errorHandler);
app.use(resourceNotFound);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
