const cron = require("node-cron");

const cronJob = () => {
  return cron.schedule("*/1 * * * *", () => {
    console.log("this is runnign every second");
  });
};

module.exports = { cronJob };
