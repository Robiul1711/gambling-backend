const mongoose = require("mongoose");

const footerSchema = new mongoose.Schema(
  {
    logo: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    instagramUrl: {
      type: String,
      default: "",
    },
    facebookUrl: {
      type: String,
      default: "",
    },
    xUrl: {
      type: String,
      default: "",
    },
    copyrightText: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Footer", footerSchema);
