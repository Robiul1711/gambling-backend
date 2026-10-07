const express = require("express");
const multer = require("multer");
const {
  getAboutSections,
  getAboutSection,
  updateAboutSection,
} = require("../controllers/about.controller");

const router = express.Router();

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for media
});

const cpUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "audio", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

router.get("/", getAboutSections);
router.get("/:section", getAboutSection);
router.put("/:section", cpUpload, updateAboutSection);
router.post("/:section", cpUpload, updateAboutSection);

module.exports = router;
