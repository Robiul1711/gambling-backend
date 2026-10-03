const LibraryResource = require("../models/libraryResource.model");

// GET all library resources (Public / Members)
exports.getResources = async (req, res) => {
  try {
    const { sectionTag } = req.query;
    const query = {};
    if (sectionTag) {
      query.sectionTag = sectionTag;
    }
    const resources = await LibraryResource.find(query).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE new resource (Admin)
exports.createResource = async (req, res) => {
  try {
    const resource = await LibraryResource.create(req.body);
    res.status(201).json({
      success: true,
      data: resource,
      message: "Resource added successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// UPDATE resource (Admin)
exports.updateResource = async (req, res) => {
  try {
    const resource = await LibraryResource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }
    res.status(200).json({
      success: true,
      data: resource,
      message: "Resource updated successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE resource (Admin)
exports.deleteResource = async (req, res) => {
  try {
    const resource = await LibraryResource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }
    res.status(200).json({ success: true, message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
