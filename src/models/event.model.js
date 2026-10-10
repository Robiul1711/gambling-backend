const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["WEBINAR", "TRAINING", "TALK", "WORKSHOP", "CONFERENCE", "OTHER"],
      default: "WEBINAR",
      trim: true,
    },
    day: {
      type: String,
      required: [true, "Day is required"],
      trim: true,
      default: "DD",
    },
    month: {
      type: String,
      required: [true, "Month is required"],
      trim: true,
      default: "MON",
    },
    date: {
      type: String,
      required: [true, "Full date display is required"],
      trim: true,
      default: "[Day, DD Month YYYY]",
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      trim: true,
      default: "[HH:MM to HH:MM]",
    },
    format: {
      type: String,
      required: [true, "Format is required"],
      enum: ["Online", "In person", "Hybrid", "Online (Zoom)", "Online live stream"],
      default: "Online",
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: "[Venue and town, or joining link sent on registration]",
    },
    cost: {
      type: String,
      trim: true,
      default: "Free",
    },
    whoItIsFor: {
      type: String,
      trim: true,
      default: "[e.g. Healthcare professionals, teachers, anyone affected]",
    },
    oneLineDescription: {
      type: String,
      trim: true,
      default: "A one-line description of the event, who it is for and why it matters.",
    },
    summary: {
      type: String,
      trim: true,
      default: "Short one or two sentence summary of the event, who it is for and what people will take away.",
    },
    aboutParagraphs: {
      type: [String],
      default: [
        "[Two or three paragraphs describing the event: what it covers, who is speaking, what people will learn or be able to do afterwards. Keep it plain and specific.]",
        "[Second paragraph.]",
      ],
    },
    howToJoin: {
      type: String,
      trim: true,
      default: "[Explain how to register or attend. If there is a booking link, use the button below.]",
    },
    eventbriteId: {
      type: String,
      trim: true,
      default: "",
    },
    eventbriteUrl: {
      type: String,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    recordingUrl: {
      type: String,
      trim: true,
      default: "",
    },
    slidesUrl: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["upcoming", "completed", "draft"],
      default: "upcoming",
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

eventSchema.index({ status: 1, order: 1, createdAt: -1 });

module.exports = mongoose.model("Event", eventSchema);
