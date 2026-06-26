require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const blogRoutes = require("./routes/blog.route");
const authRoutes = require("./routes/auth.route");
const bannerRoutes = require("./routes/banner.route");
const uploadRoutes = require("./routes/upload.route");
const teamRoutes = require("./routes/team.route");
const aboutRoutes = require("./routes/about.route");
const footerRoutes = require("./routes/footer.route");

const app = express();

// Connect to Database
connectDB();

app.use(cors());
app.use(express.json());

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/blogs", blogRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/footer", footerRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

module.exports = app;