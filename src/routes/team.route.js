const express = require("express");
const multer = require("multer");
const { protect } = require("../middlewares/auth.middleware");
const {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} = require("../controllers/team.controller");

const router = express.Router();

// Multer Memory Storage Configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.get("/", getTeamMembers);
router.post("/", protect, upload.single("image"), createTeamMember);
router.put("/:id", protect, upload.single("image"), updateTeamMember);
router.delete("/:id", protect, deleteTeamMember);

module.exports = router;
