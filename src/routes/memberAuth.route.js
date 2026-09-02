const express = require("express");
const {
  registerMember,
  loginMember,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/memberAuth.controller");
const { protectMember } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", registerMember);
router.post("/login", loginMember);
router.get("/me", protectMember, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
