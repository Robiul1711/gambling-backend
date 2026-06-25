const express = require("express");
const multer = require("multer");
const {
  createBanner,
  getBanner,
  updateBanner,
} = require("../controllers/banner.controller");

const router = express.Router();

// Multer Memory Storage Configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post("/", upload.single("image"), createBanner);
router.get("/", getBanner);
router.put("/", upload.single("image"), updateBanner);

module.exports = router;
