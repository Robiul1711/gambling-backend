const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const {
  createBooking,
  getBookings,
  updateBookingStatus,
  deleteBooking,
} = require("../controllers/booking.controller");

const router = express.Router();

// Public submission
router.post("/", createBooking);

// Admin routes
router.get("/", protect, getBookings);
router.patch("/:id/status", protect, updateBookingStatus);
router.delete("/:id", protect, deleteBooking);

module.exports = router;
