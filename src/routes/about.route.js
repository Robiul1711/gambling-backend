const express = require("express");
const multer = require("multer");
const { protect } = require("../middlewares/auth.middleware");
const {
  getAboutSections,
  getAboutSection,
  updateAboutSection,
} = require("../controllers/about.controller");

const router = express.Router();

// Multer memory storage configuration (increased limit to 15MB for audio uploads)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 },
});

// Configure upload fields for image and audio files
const aboutUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "audio", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

// Public routes
router.get("/", getAboutSections);
router.get("/:section", getAboutSection);

// Protected routes
router.put("/:section", protect, aboutUpload, updateAboutSection);

module.exports = router;
