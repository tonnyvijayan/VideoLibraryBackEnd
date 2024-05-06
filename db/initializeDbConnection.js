const mongoose = require("mongoose");
const { logEvents } = require("../middlewares/logger");

const dbUrl = process.env.MONGO_DB_URL;

const intializeDbConnection = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connection to db successfull");
    logEvents("Connection to db successfull", "dblogs");
  } catch (error) {
    console.log("connection to db failed", error.stack);
    logEvents("Connection to db failed", "dblogs");
  }
};

module.exports = intializeDbConnection;
