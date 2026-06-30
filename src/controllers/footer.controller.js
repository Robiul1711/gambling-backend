const Footer = require("../models/footer.model");
const cloudinary = require("../config/cloudinary");

// Upload buffer to Cloudinary and return the secure URL
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "website_cms/footer" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// ─── GET FOOTER SETTINGS ─────────────────────────────────────────────────────
exports.getFooterSettings = async (req, res) => {
  try {
    let settings = await Footer.findOne();
    
    // Return default values if not initialized in database
    if (!settings) {
      return res.status(200).json({
        success: true,
        data: {
          logo: "",
          description: "An independent UK organisation working to reduce the harm caused by gambling, through support, advocacy and research. We do not accept gambling-industry funding.",
          instagramUrl: "#instagram",
          facebookUrl: "#facebook",
          xUrl: "#x",
          copyrightText: "Gambling Harm UK (GHUK).",
          crisisHeaderShow: true,
          crisisHeaderText: "In Crisis Or Thinking About Suicide? Call",
          crisisHeaderPhone: "Samaritans 116 123",
          crisisHeaderPhoneLink: "116123",
          crisisHeaderBtnText: "Urgent Help →",
          crisisHeaderBtnLink: "/urgent-help",
          crisisHeaderBgColor: "#C92525",
          crisisHeaderTextColor: "#ffffff",
        }
      });
    }

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE FOOTER SETTINGS ──────────────────────────────────────────────────
exports.updateFooterSettings = async (req, res) => {
  try {
    const {
      description,
      instagramUrl,
      facebookUrl,
      xUrl,
      copyrightText,
      logo,
      crisisHeaderShow,
      crisisHeaderText,
      crisisHeaderPhone,
      crisisHeaderPhoneLink,
      crisisHeaderBtnText,
      crisisHeaderBtnLink,
      crisisHeaderBgColor,
      crisisHeaderTextColor,
    } = req.body;

    const updateData = {
      description: description !== undefined ? description : "",
      instagramUrl: instagramUrl !== undefined ? instagramUrl : "",
      facebookUrl: facebookUrl !== undefined ? facebookUrl : "",
      xUrl: xUrl !== undefined ? xUrl : "",
      copyrightText: copyrightText !== undefined ? copyrightText : "",
      crisisHeaderShow: crisisHeaderShow !== undefined ? (crisisHeaderShow === "true" || crisisHeaderShow === true) : true,
      crisisHeaderText: crisisHeaderText !== undefined ? crisisHeaderText : "",
      crisisHeaderPhone: crisisHeaderPhone !== undefined ? crisisHeaderPhone : "",
      crisisHeaderPhoneLink: crisisHeaderPhoneLink !== undefined ? crisisHeaderPhoneLink : "",
      crisisHeaderBtnText: crisisHeaderBtnText !== undefined ? crisisHeaderBtnText : "",
      crisisHeaderBtnLink: crisisHeaderBtnLink !== undefined ? crisisHeaderBtnLink : "",
      crisisHeaderBgColor: crisisHeaderBgColor !== undefined ? crisisHeaderBgColor : "#C92525",
      crisisHeaderTextColor: crisisHeaderTextColor !== undefined ? crisisHeaderTextColor : "#ffffff",
    };

    // Upload new logo image if provided
    if (req.file) {
      updateData.logo = await uploadToCloudinary(req.file.buffer);
    }

    let settings = await Footer.findOne();

    if (settings) {
      // If no new logo supplied, keep the existing one
      if (!updateData.logo) {
        updateData.logo = logo !== undefined ? logo : settings.logo;
      }

      settings = await Footer.findByIdAndUpdate(
        settings._id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } else {
      // Initial seed
      settings = await Footer.create(updateData);
    }

    res.status(200).json({
      success: true,
      message: "Footer settings updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
