const Blog = require("../models/blog.model");
const cloudinary = require("../config/cloudinary");

// Upload buffer to Cloudinary and return the secure URL
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "website_cms/resources" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// ─── CREATE BLOG/RESOURCE ────────────────────────────────────────────────────
exports.createBlog = async (req, res) => {
  try {
    const { title, slug, description, content, category, publishDate, status } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const blogData = {
      title,
      slug: slug || undefined, // Mongoose pre-validate hook will generate if undefined
      description,
      content: content || "",
      category: category || "Blog",
      status: status || "published",
    };

    if (publishDate) {
      blogData.publishDate = new Date(publishDate);
    }

    if (req.file) {
      blogData.image = await uploadToCloudinary(req.file.buffer);
    }

    const blog = await Blog.create(blogData);

    res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── GET ALL BLOGS/RESOURCES ─────────────────────────────────────────────────
exports.getBlogs = async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};

    if (category && category !== "All") {
      // Normalize 'Briefings' to 'Briefing' if passed
      if (category === "Briefings") {
        filter.category = "Briefing";
      } else {
        filter.category = category;
      }
    }

    if (status) {
      filter.status = status;
    }

    const blogs = await Blog.find(filter).sort({ publishDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── GET SINGLE BLOG/RESOURCE ────────────────────────────────────────────────
exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── UPDATE BLOG/RESOURCE ────────────────────────────────────────────────────
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, description, content, category, publishDate, status } = req.body;

    let blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    const updateData = {
      title: title !== undefined ? title : blog.title,
      slug: slug !== undefined ? slug : blog.slug,
      description: description !== undefined ? description : blog.description,
      content: content !== undefined ? content : blog.content,
      category: category !== undefined ? category : blog.category,
      status: status !== undefined ? status : blog.status,
    };

    if (publishDate) {
      updateData.publishDate = new Date(publishDate);
    }

    if (req.file) {
      updateData.image = await uploadToCloudinary(req.file.buffer);
    }

    // Auto update slug if title changed and slug is not overridden
    if (title && !slug) {
      updateData.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── DELETE BLOG/RESOURCE ────────────────────────────────────────────────────
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};