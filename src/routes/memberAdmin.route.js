const express = require("express");
const {
  getMembers,
  getMemberStats,
  updateMemberStatus,
  deleteMember,
} = require("../controllers/memberAdmin.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

// Protected admin routes
router.get("/", protect, getMembers);
router.get("/stats", protect, getMemberStats);
router.patch("/:id/status", protect, updateMemberStatus);
router.delete("/:id", protect, deleteMember);

module.exports = router;
