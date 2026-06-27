const mongoose = require("mongoose");

const phoenixAudioSchema = new mongoose.Schema(
  {
    tag: {
      type: String,
      required: [true, "Tag/Category is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    audioUrl: {
      type: String,
      required: [true, "Audio URL is required"],
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PhoenixAudio", phoenixAudioSchema);
