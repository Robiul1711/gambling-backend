const express = require("express");
const multer = require("multer");
const { protect } = require("../middlewares/auth.middleware");
const {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blog.controller");

const router = express.Router();

// Multer Memory Storage Configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Public GET routes
router.get("/", getBlogs);
router.get("/:id", getBlog);

// Protected write routes
router.post("/", protect, upload.single("image"), createBlog);
router.put("/:id", protect, upload.single("image"), updateBlog);
router.delete("/:id", protect, deleteBlog);

module.exports = router;