const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    tags: {
      type: [String],
      default: ["Independent", "Public-health-led", "Lived-experience-informed"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    primaryBtnText: {
      type: String,
      default: "Get Help",
    },
    primaryBtnLink: {
      type: String,
      default: "/get-help",
    },
    secondaryBtnText: {
      type: String,
      default: "I'm worried about someone",
    },
    secondaryBtnLink: {
      type: String,
      default: "/get-help/family-friends",
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    statTitle: {
      type: String,
      default: "~1 In 5",
    },
    statDescription: {
      type: String,
      default: "UK adults were harmed by gambling in the past year, counting both people who gamble and those around them.",
    },
    statLinkText: {
      type: String,
      default: "Read the burden of harm",
    },
    statLinkUrl: {
      type: String,
      default: "#burden-of-harm",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Banner", bannerSchema);
