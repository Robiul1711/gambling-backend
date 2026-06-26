const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: [true, "Section identifier is required"],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      default: "",
    },
    subtitle: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    audioTitle: {
      type: String,
      default: "",
    },
    audioSource: {
      type: String,
      default: "",
    },
    audioUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("About", aboutSchema);
