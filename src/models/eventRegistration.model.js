const mongoose = require("mongoose");

const eventRegistrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: false,
    },
    eventTitle: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
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
    organisation: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      trim: true,
      default: "",
    },
    places: {
      type: String,
      default: "1",
    },
    describeYou: {
      type: String,
      default: "Prefer not to say",
    },
    hearAbout: {
      type: String,
      default: "Please select",
    },
    accessRequirements: {
      type: String,
      trim: true,
      default: "",
    },
    agreeContact: {
      type: Boolean,
      required: [true, "Consent is required"],
      default: false,
    },
    newsletter: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

eventRegistrationSchema.index({ eventId: 1, email: 1 });
eventRegistrationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("EventRegistration", eventRegistrationSchema);
