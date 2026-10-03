const mongoose = require("mongoose");

const libraryResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    sectionTag: {
      type: String,
      required: [true, "Section Tag is required"],
      enum: [
        "TOOLKITS & GUIDES",
        "BRIEFINGS & POLICY",
        "RESEARCH & EVIDENCE",
        "TRAINING & SLIDES",
        "OTHER",
      ],
      default: "TOOLKITS & GUIDES",
    },
    fileType: {
      type: String,
      required: [true, "File type is required (e.g. PDF, DOCX, PPTX, XLSX)"],
      uppercase: true,
      trim: true,
      default: "PDF",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    fileSize: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isMembersOnly: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

libraryResourceSchema.index({ sectionTag: 1, order: 1 });

module.exports = mongoose.model("LibraryResource", libraryResourceSchema);
