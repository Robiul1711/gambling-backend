const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
    },
    bio: {
      type: String,
      required: [true, "Bio is required"],
    },
    image: {
      type: String,
      default: "",
    },
    initials: {
      type: String,
      default: "",
    },
    declaredInterests: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
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

// Auto-generate initials if not provided before saving
teamSchema.pre("save", function () {
  if (!this.initials && this.name) {
    const parts = this.name.split(" ").filter(Boolean);
    if (parts.length > 1) {
      this.initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1) {
      this.initials = parts[0].substring(0, 2).toUpperCase();
    }
  }
});

module.exports = mongoose.model("Team", teamSchema);
