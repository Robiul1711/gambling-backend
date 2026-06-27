const mongoose = require("mongoose");

const newsResearchSettingsSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: [true, "Section identifier is required"],
      unique: true,
      default: "news_research",
      trim: true,
    },
    title: {
      type: String,
      default: "What we're publishing.",
    },
    description: {
      type: String,
      default: "Briefings, working papers, consultation responses, press statements and blog posts. All produced independently of gambling-industry funding.",
    },
    image: {
      type: String,
      default: "",
    },
    audioTitle: {
      type: String,
      default: "On PhoenixFM with John Gilham",
    },
    audioDescription: {
      type: String,
      default: "John Gilham, speaking from lived experience, was interviewed on Phoenix FM's 123 Friday show in May 2026. Five clips from across the conversation, each one a different facet of UK gambling harm.",
    },
    audioDateText: {
      type: String,
      default: "Audio · May 2026",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("NewsResearchSettings", newsResearchSettingsSchema);
