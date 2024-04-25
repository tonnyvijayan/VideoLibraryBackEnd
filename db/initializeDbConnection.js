const mongoose = require("mongoose");

const dbUrl = process.env.MONGO_DB_URL;

const intializeDbConnection = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connection to db successfull");
  } catch (error) {
    console.log("connection to db failed", error.stack);
  }
};

module.exports = intializeDbConnection;
