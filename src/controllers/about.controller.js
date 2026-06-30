const About = require("../models/about.model");
const cloudinary = require("../config/cloudinary");

// Upload buffer to Cloudinary and return the secure URL
const uploadToCloudinary = (fileBuffer, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: "website_cms/about",
        resource_type: resourceType 
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// ─── GET ALL SECTIONS ────────────────────────────────────────────────────────
exports.getAboutSections = async (req, res) => {
  try {
    const sections = await About.find();
    res.status(200).json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SINGLE SECTION ──────────────────────────────────────────────────────
exports.getAboutSection = async (req, res) => {
  try {
    const { section } = req.params;
    const aboutSection = await About.findOne({ section });
    
    // Return empty model fallback if not found in database yet
    if (!aboutSection) {
      return res.status(200).json({ 
        success: true, 
        data: {
          section,
          title: "",
          subtitle: "",
          description: "",
          image: "",
          audioTitle: "",
          audioSource: "",
          audioUrl: "",
          videoUrl: ""
        }
      });
    }

    res.status(200).json({ success: true, data: aboutSection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE/UPSERT SECTION ───────────────────────────────────────────────────
exports.updateAboutSection = async (req, res) => {
  try {
    const { section } = req.params;
    const { title, subtitle, description, audioTitle, audioSource, image, audioUrl, videoUrl } = req.body;

    const updateData = {
      title: title !== undefined ? title : "",
      subtitle: subtitle !== undefined ? subtitle : "",
      description: description !== undefined ? description : "",
      audioTitle: audioTitle !== undefined ? audioTitle : "",
      audioSource: audioSource !== undefined ? audioSource : "",
    };

    // Upload files if provided
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        updateData.image = await uploadToCloudinary(req.files.image[0].buffer, "image");
      }
      if (req.files.audio && req.files.audio[0]) {
        updateData.audioUrl = await uploadToCloudinary(req.files.audio[0].buffer, "auto");
      }
      if (req.files.video && req.files.video[0]) {
        updateData.videoUrl = await uploadToCloudinary(req.files.video[0].buffer, "auto");
      }
    }

    // Keep existing URL paths if no new file is uploaded and no string value overrides
    let existingSection = await About.findOne({ section });
    if (existingSection) {
      if (!updateData.image) {
        updateData.image = image !== undefined ? image : existingSection.image;
      }
      if (!updateData.audioUrl) {
        updateData.audioUrl = audioUrl !== undefined ? audioUrl : existingSection.audioUrl;
      }
      if (!updateData.videoUrl) {
        updateData.videoUrl = videoUrl !== undefined ? videoUrl : existingSection.videoUrl;
      }
    }

    const updatedSection = await About.findOneAndUpdate(
      { section },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `${section} settings updated successfully`,
      data: updatedSection,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
