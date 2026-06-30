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
    // Crisis Header properties
    crisisHeaderShow: {
      type: Boolean,
      default: true,
    },
    crisisHeaderText: {
      type: String,
      default: "In Crisis Or Thinking About Suicide? Call",
    },
    crisisHeaderPhone: {
      type: String,
      default: "Samaritans 116 123",
    },
    crisisHeaderPhoneLink: {
      type: String,
      default: "116123",
    },
    crisisHeaderBtnText: {
      type: String,
      default: "Urgent Help →",
    },
    crisisHeaderBtnLink: {
      type: String,
      default: "/urgent-help",
    },
    crisisHeaderBgColor: {
      type: String,
      default: "#C92525",
    },
    crisisHeaderTextColor: {
      type: String,
      default: "#ffffff",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Footer", footerSchema);
