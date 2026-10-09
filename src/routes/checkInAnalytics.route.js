const express = require("express");
const router = express.Router();
const checkInAnalyticsController = require("../controllers/checkInAnalytics.controller");

// Public anonymous event ingestion (no cookies, no IP logging)
router.post("/event", checkInAnalyticsController.recordEvent);

// Admin summary endpoint
router.get("/summary", checkInAnalyticsController.getAnalyticsSummary);

module.exports = router;
