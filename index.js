require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { resourceNotFound } = require("./middlewares/resourceNotFound");
const { errorHandler } = require("./middlewares/errorHandler");
// const { logger } = require("./middlewares/logger");
const { corsOptions } = require("./cors/corsOptions");
const { cronJob } = require("./cronjobs/cronJob");
const intializeDbConnection = require("./db/initializeDbConnection");
const videos = require("./routes/videos.route");
const user = require("./routes/user.route");
const PORT = process.env.PORT || 4010;

const app = express();
intializeDbConnection();
cronJob();

// app.use(logger);
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use("/videos", videos);
app.use("/user", user);

app.get("/", (req, res) => {
  res.send("server active");
});

app.use(errorHandler);
app.use(resourceNotFound);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
