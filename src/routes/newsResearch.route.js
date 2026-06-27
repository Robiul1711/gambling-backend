const express = require("express");
const multer = require("multer");
const { protect } = require("../middlewares/auth.middleware");
const {
  getSettings,
  updateSettings,
  getAudioClips,
  createAudioClip,
  updateAudioClip,
  deleteAudioClip,
} = require("../controllers/newsResearch.controller");

const router = express.Router();

// Multer memory storage configuration (increased limit to 20MB for audio uploads)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// Settings routes
router.get("/settings", getSettings);
router.put("/settings", protect, upload.single("image"), updateSettings);

// Audio clips routes
router.get("/audio", getAudioClips);
router.post("/audio", protect, upload.single("audio"), createAudioClip);
router.put("/audio/:id", protect, upload.single("audio"), updateAudioClip);
router.delete("/audio/:id", protect, deleteAudioClip);

module.exports = router;
