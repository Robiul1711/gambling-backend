const Team = require("../models/team.model");
const cloudinary = require("../config/cloudinary");

// Upload buffer to Cloudinary and return the secure URL
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "website_cms/team" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// ─── GET ALL TEAM MEMBERS ───────────────────────────────────────────────────
exports.getTeamMembers = async (req, res) => {
  try {
    const members = await Team.find().sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CREATE TEAM MEMBER ──────────────────────────────────────────────────────
exports.createTeamMember = async (req, res) => {
  try {
    const { name, role, bio, initials, declaredInterests, email, displayOrder } = req.body;

    if (!name || !role || !bio) {
      return res.status(400).json({
        success: false,
        message: "Name, role, and biography are required",
      });
    }

    const memberData = {
      name,
      role,
      bio,
      initials,
      declaredInterests,
      email,
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
    };

    if (req.file) {
      memberData.image = await uploadToCloudinary(req.file.buffer);
    }

    const newMember = await Team.create(memberData);

    res.status(201).json({
      success: true,
      message: "Team member created successfully",
      data: newMember,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE TEAM MEMBER ──────────────────────────────────────────────────────
exports.updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, bio, initials, declaredInterests, email, displayOrder } = req.body;

    let member = await Team.findById(id);
    if (!member) {
      return res.status(404).json({ success: false, message: "Team member not found" });
    }

    const updateData = {
      name: name !== undefined ? name : member.name,
      role: role !== undefined ? role : member.role,
      bio: bio !== undefined ? bio : member.bio,
      initials: initials !== undefined ? initials : member.initials,
      declaredInterests: declaredInterests !== undefined ? declaredInterests : member.declaredInterests,
      email: email !== undefined ? email : member.email,
      displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : member.displayOrder,
    };

    if (req.file) {
      updateData.image = await uploadToCloudinary(req.file.buffer);
    }

    const updatedMember = await Team.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Team member updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE TEAM MEMBER ──────────────────────────────────────────────────────
exports.deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Team.findById(id);
    
    if (!member) {
      return res.status(404).json({ success: false, message: "Team member not found" });
    }

    await Team.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
