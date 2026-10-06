const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");
const { protect } = require("../middlewares/auth.middleware");

// Public endpoints
router.get("/", eventController.getEvents);
router.get("/sync-eventbrite", eventController.syncEventbrite);
router.post("/sync-eventbrite", eventController.syncEventbrite);
router.get("/:id", eventController.getEventById);
router.post("/register", eventController.registerForEvent);
router.post("/:id/register", eventController.registerForEvent);

// Admin endpoints (Protected)
router.post("/", protect, eventController.createEvent);
router.put("/:id", protect, eventController.updateEvent);
router.delete("/:id", protect, eventController.deleteEvent);

// Admin Registration endpoints (Protected)
router.get("/admin/registrations", protect, eventController.getEventRegistrations);
router.put("/admin/registrations/:id/status", protect, eventController.updateRegistrationStatus);
router.delete("/admin/registrations/:id", protect, eventController.deleteRegistration);

module.exports = router;
