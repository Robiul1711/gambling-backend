const mongoose = require("mongoose");

const checkInAnalyticsSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: ["checkin_started", "checkin_completed", "helpline_click", "signpost_click", "checkin_saved"],
      index: true,
    },
    path: {
      type: String,
      enum: ["self", "ao", "unsure", null],
      default: null,
    },
    resultBand: {
      type: String,
      default: null,
    },
    score: {
      type: Number,
      default: null,
    },
    action: {
      type: String,
      default: null,
    },
    target: {
      type: String,
      default: null,
    },
    // Strictly zero PII (no IP, no user agent, no cookies, no personal identity)
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model("CheckInAnalytics", checkInAnalyticsSchema);
