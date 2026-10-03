const express = require("express");
const router = express.Router();
const libraryResourceController = require("../controllers/libraryResource.controller");
const { protect } = require("../middlewares/auth.middleware");

// Public / Members endpoints
router.get("/", libraryResourceController.getResources);

// Admin endpoints (Protected)
router.post("/", protect, libraryResourceController.createResource);
router.put("/:id", protect, libraryResourceController.updateResource);
router.delete("/:id", protect, libraryResourceController.deleteResource);

module.exports = router;
