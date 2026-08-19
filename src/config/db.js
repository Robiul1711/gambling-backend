const mongoose = require("mongoose");
const dns = require("dns");

// Set default DNS servers to bypass local/ISP DNS issues with SRV queries in development
if (process.env.NODE_ENV !== "production") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (e) {
    console.warn("Failed to set DNS servers:", e);
  }
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("CRITICAL ERROR: MONGO_URI is not defined in environment variables!");
    throw new Error("MONGO_URI is not defined");
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongooseInstance) => {
        console.log("Database connected successfully");
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error("Database connection failed:", err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;