const mongoose = require("mongoose");
const dns = require("dns");

// Set default DNS servers to bypass local/ISP DNS issues with SRV queries
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.warn("Failed to set DNS servers:", e);
}

const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Database connected");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;