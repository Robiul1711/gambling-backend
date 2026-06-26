const express = require("express");
const multer = require("multer");
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  getRegisterStatus,
} = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Public routes
router.get("/register-status", getRegisterStatus);
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Private routes (require JWT)
router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;
