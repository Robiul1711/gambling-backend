const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "Invalid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    organisation: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      default: "",
      trim: true,
    },
    sector: {
      type: String,
      default: "Other",
      trim: true,
    },
    sectors: {
      type: [String],
      default: [],
    },
    membershipNeeds: {
      type: String,
      default: "",
      trim: true,
    },
    anythingElse: {
      type: String,
      default: "",
      trim: true,
    },
    agreeTerms: {
      type: Boolean,
      required: [true, "Agreement to privacy terms is required"],
      default: false,
    },
    newsletterUpdates: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
memberSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
memberSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token for member
memberSchema.methods.getJwtToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: "member", status: this.status },
    process.env.JWT_SECRET || "ghuk_super_secret_jwt_key_2026",
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

// Generate password reset token
memberSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 60 minutes

  return resetToken;
};

// Indexes
memberSchema.index({ email: 1 });
memberSchema.index({ status: 1 });
memberSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Member", memberSchema);
