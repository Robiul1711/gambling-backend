const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

// Configure multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Upload endpoint supporting both "image", "file" or any field name
router.post("/", upload.any(), async (req, res) => {
  try {
    const uploadedFile =
      req.file || (req.files && req.files.length > 0 ? req.files[0] : null);

    if (!uploadedFile) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Helper promise function to pipe the buffer directly to Cloudinary
    const uploadStream = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "website_cms",
            resource_type: "auto", // supports images, PDFs, raw documents, videos, etc.
            public_id: `${Date.now()}_${uploadedFile.originalname.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")}`,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(uploadedFile.buffer);
      });
    };

    const result = await uploadStream();

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      url: result.secure_url || result.url,
      data: {
        url: result.secure_url || result.url,
        format: result.format,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload file to storage",
    });
  }
});

module.exports = router;
