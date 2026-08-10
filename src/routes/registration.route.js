const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const {
  createRegistration,
  getRegistrations,
  getRegistrationStats,
  deleteRegistration,
  exportRegistrationsCsv,
} = require("../controllers/registration.controller");

const router = express.Router();

// Public submission route
router.post("/", createRegistration);

// Admin protected routes
router.get("/", protect, getRegistrations);
router.get("/stats", protect, getRegistrationStats);
router.get("/export/csv", protect, exportRegistrationsCsv);
router.delete("/:id", protect, deleteRegistration);

module.exports = router;
