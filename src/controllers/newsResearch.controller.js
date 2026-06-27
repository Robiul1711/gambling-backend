const NewsResearchSettings = require("../models/newsResearchSettings.model");
const PhoenixAudio = require("../models/phoenixAudio.model");
const cloudinary = require("../config/cloudinary");

// Upload buffer to Cloudinary and return the secure URL
const uploadToCloudinary = (fileBuffer, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: "website_cms/news_research",
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

// ─── NEWS & RESEARCH SETTINGS ────────────────────────────────────────────────
exports.getSettings = async (req, res) => {
  try {
    let settings = await NewsResearchSettings.findOne({ section: "news_research" });
    
    // Return empty model fallback if not found in database yet
    if (!settings) {
      return res.status(200).json({ 
        success: true, 
        data: {
          section: "news_research",
          title: "What we're publishing.",
          description: "Briefings, working papers, consultation responses, press statements and blog posts. All produced independently of gambling-industry funding.",
          image: "",
          audioTitle: "On PhoenixFM with John Gilham",
          audioDescription: "John Gilham, speaking from lived experience, was interviewed on Phoenix FM's 123 Friday show in May 2026. Five clips from across the conversation, each one a different facet of UK gambling harm.",
          audioDateText: "Audio · May 2026"
        }
      });
    }

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { title, description, audioTitle, audioDescription, audioDateText, image } = req.body;

    const updateData = {
      title: title !== undefined ? title : "What we're publishing.",
      description: description !== undefined ? description : "",
      audioTitle: audioTitle !== undefined ? audioTitle : "On PhoenixFM with John Gilham",
      audioDescription: audioDescription !== undefined ? audioDescription : "",
      audioDateText: audioDateText !== undefined ? audioDateText : "Audio · May 2026",
    };

    // Upload banner image if provided
    if (req.file) {
      updateData.image = await uploadToCloudinary(req.file.buffer, "image");
    } else if (image !== undefined) {
      updateData.image = image;
    }

    const updatedSettings = await NewsResearchSettings.findOneAndUpdate(
      { section: "news_research" },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "News & Research settings updated successfully",
      data: updatedSettings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PHOENIX FM AUDIO CLIPS CRUD ─────────────────────────────────────────────
exports.getAudioClips = async (req, res) => {
  try {
    const clips = await PhoenixAudio.find().sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: clips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAudioClip = async (req, res) => {
  try {
    const { tag, title, displayOrder } = req.body;

    if (!tag || !title) {
      return res.status(400).json({
        success: false,
        message: "Tag/Category and Title are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required",
      });
    }

    const clipData = {
      tag,
      title,
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
    };

    // Upload audio file to Cloudinary with resource_type auto (for audio)
    clipData.audioUrl = await uploadToCloudinary(req.file.buffer, "auto");

    const newClip = await PhoenixAudio.create(clipData);

    res.status(201).json({
      success: true,
      message: "Audio clip uploaded and created successfully",
      data: newClip,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAudioClip = async (req, res) => {
  try {
    const { id } = req.params;
    const { tag, title, displayOrder, audioUrl } = req.body;

    let clip = await PhoenixAudio.findById(id);
    if (!clip) {
      return res.status(404).json({ success: false, message: "Audio clip not found" });
    }

    const updateData = {
      tag: tag !== undefined ? tag : clip.tag,
      title: title !== undefined ? title : clip.title,
      displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : clip.displayOrder,
      audioUrl: audioUrl !== undefined ? audioUrl : clip.audioUrl,
    };

    if (req.file) {
      updateData.audioUrl = await uploadToCloudinary(req.file.buffer, "auto");
    }

    const updatedClip = await PhoenixAudio.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Audio clip updated successfully",
      data: updatedClip,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAudioClip = async (req, res) => {
  try {
    const { id } = req.params;
    const clip = await PhoenixAudio.findById(id);
    
    if (!clip) {
      return res.status(404).json({ success: false, message: "Audio clip not found" });
    }

    await PhoenixAudio.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Audio clip deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
