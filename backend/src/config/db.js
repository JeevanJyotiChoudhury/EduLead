const dns = require("node:dns");
const mongoose = require("mongoose");

dns.setServers(
  (process.env.MONGODB_DNS_SERVERS || "1.1.1.1,8.8.8.8")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean),
);

const connectDB = async () => {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);

      console.log("MongoDB connected successfully");
      return;
    } catch (error) {
      console.error(
        `MongoDB connection attempt ${attempt} failed:`,
        error.message,
      );

      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  process.exit(1);
};

module.exports = connectDB;
