require("dotenv").config();
const express = require("express");
const resourceNotFound = require("./middlewares/resourceNotFound");
const errorHandler = require("./middlewares/errorHandler");
const app = express();
const intializeDbConnection = require("./db/initializeDbConnection");
intializeDbConnection();

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("hi");
});

app.use(errorHandler);
app.use(resourceNotFound);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
