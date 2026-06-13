const express = require("express");
const cors = require("cors");

const blogRoutes = require("./routes/blog.route");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/blogs", blogRoutes);

module.exports = app;