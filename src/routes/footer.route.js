const express = require("express");
const multer = require("multer");
const { protect } = require("../middlewares/auth.middleware");
const {
  getFooterSettings,
  updateFooterSettings,
} = require("../controllers/footer.controller");

const router = express.Router();

// Multer Memory Storage Configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Public read endpoint
router.get("/", getFooterSettings);

// Protected write endpoint
router.put("/", protect, upload.single("logo"), updateFooterSettings);

module.exports = router;
