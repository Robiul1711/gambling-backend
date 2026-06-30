const mongoose = require("mongoose");
const dns = require("dns");

// Set default DNS servers to bypass local/ISP DNS issues with SRV queries
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.warn("Failed to set DNS servers:", e);
}

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    console.log("Database already connected (cached)");
    return;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("CRITICAL ERROR: MONGO_URI is not defined in environment variables!");
    return;
  }

  try {
    console.log("Attempting database connection...");
    const db = await mongoose.connect(uri);
    isConnected = db.connections[0].readyState === 1;
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    isConnected = false;
  }
};

module.exports = connectDB;