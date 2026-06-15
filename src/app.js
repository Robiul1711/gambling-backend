const express = require("express");
const cors = require("cors");

const blogRoutes = require("./routes/blog.route");
const authRoutes = require("./routes/auth.route");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/blogs", blogRoutes);
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

module.exports = app;