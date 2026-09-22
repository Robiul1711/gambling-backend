const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    organisationName: {
      type: String,
      required: [true, "Organisation name is required"],
      trim: true,
    },
    organisationType: {
      type: String,
      required: [true, "Organisation type is required"],
      trim: true,
    },
    role: {
      type: String,
      trim: true,
      default: "",
    },
    sessionTypes: {
      type: [String],
      default: [],
    },
    numberOfPeople: {
      type: String,
      required: [true, "Approximate number of people is required"],
      trim: true,
    },
    format: {
      type: String,
      required: [true, "Format is required"],
      trim: true,
    },
    venueLocation: {
      type: String,
      trim: true,
      default: "",
    },
    preferredTime: {
      type: String,
      default: "No preference",
      trim: true,
    },
    preferredDates: {
      type: String,
      trim: true,
      default: "",
    },
    additionalInfo: {
      type: String,
      trim: true,
      default: "",
    },
    newsletterUpdates: {
      type: Boolean,
      default: false,
    },
    agreeTerms: {
      type: Boolean,
      required: [true, "Agreement to contact terms is required"],
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ email: 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
