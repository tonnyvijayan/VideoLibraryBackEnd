const cron = require("node-cron");
const axios = require("axios");
const cronJob = () => {
  return cron.schedule("*/13 * * * *", async () => {
    try {
      const response = await axios.get(
        "https://finviewserver.onrender.com/serveractivate"
      );
      console.log("Server Activated");
    } catch (error) {
      console.log(error);
    }
  });
};

module.exports = { cronJob };
