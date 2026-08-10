const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
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
    tailorCategory: {
      type: String,
      default: "Prefer not to say",
      trim: true,
    },
    newsletterUpdates: {
      type: Boolean,
      default: false,
    },
    membershipInterest: {
      type: Boolean,
      default: false,
    },
    agreeTerms: {
      type: Boolean,
      required: [true, "Agreement to contact terms is required"],
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast search and sorting
registrationSchema.index({ email: 1 });
registrationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Registration", registrationSchema);
