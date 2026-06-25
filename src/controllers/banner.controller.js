const Banner = require("../models/banner.model");
const cloudinary = require("../config/cloudinary");

// Upload buffer to Cloudinary and return the secure URL
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "website_cms" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// Parse multipart array fields (tags sent as JSON string)
const parseRequestBody = (body) => {
  const parsed = { ...body };
  if (parsed.tags && typeof parsed.tags === "string") {
    try {
      parsed.tags = JSON.parse(parsed.tags);
    } catch {
      parsed.tags = parsed.tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
  }
  // Remove empty string image so it doesn't override the existing one
  if (parsed.image === "" || parsed.image === "undefined") {
    delete parsed.image;
  }
  return parsed;
};

// ─── GET /api/banner ────────────────────────────────────────────────────────
exports.getBanner = async (req, res) => {
  try {
    const banner = await Banner.findOne();
    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/banner ───────────────────────────────────────────────────────
// Creates the first banner record (use only once / for initial seed)
exports.createBanner = async (req, res) => {
  try {
    const bodyData = parseRequestBody(req.body);

    if (req.file) {
      bodyData.image = await uploadToCloudinary(req.file.buffer);
    }

    if (!bodyData.image) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const banner = await Banner.create(bodyData);
    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/banner ────────────────────────────────────────────────────────
// Upsert: update existing or create first time.
// If a new image file is uploaded → upload to Cloudinary and replace.
// If no new file → keep whatever image URL already exists in the DB.
exports.updateBanner = async (req, res) => {
  try {
    const bodyData = parseRequestBody(req.body);

    // Upload new image if provided
    if (req.file) {
      bodyData.image = await uploadToCloudinary(req.file.buffer);
    }

    let banner = await Banner.findOne();

    if (banner) {
      // If no new image supplied, keep the existing one
      if (!bodyData.image) {
        bodyData.image = banner.image;
      }

      // Use $set to prevent full-document replacement and avoid runValidators issues
      banner = await Banner.findByIdAndUpdate(
        banner._id,
        { $set: bodyData },
        { new: true, runValidators: false }
      );
    } else {
      // First-time creation via PUT (upsert behaviour)
      if (!bodyData.image) {
        return res.status(400).json({
          success: false,
          message: "Image is required to initialize the banner",
        });
      }
      banner = await Banner.create(bodyData);
    }

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
