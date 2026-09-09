const Member = require("../models/member.model");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// @desc    Register a new professional member (Status: pending)
// @route   POST /api/member-auth/register
// @access  Public
exports.registerMember = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      organisation,
      role,
      sector,
      sectors,
      membershipNeeds,
      anythingElse,
      agreeTerms,
      newsletterUpdates,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // Check if email already registered
    const existingMember = await Member.findOne({ email: email.toLowerCase() });
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    // Format sectors
    const sectorsArray = Array.isArray(sectors)
      ? sectors
      : Array.isArray(sector)
      ? sector
      : sector && sector !== "Please choose one"
      ? [sector]
      : [];

    const sectorString =
      typeof sector === "string" && sector !== "Please choose one"
        ? sector
        : sectorsArray.length > 0
        ? sectorsArray.join(", ")
        : "Other";

    // Create member in pending status
    const member = await Member.create({
      name,
      email: email.toLowerCase(),
      password,
      organisation: organisation || "",
      role: role || "",
      sector: sectorString,
      sectors: sectorsArray,
      membershipNeeds: membershipNeeds || "",
      anythingElse: anythingElse || "",
      agreeTerms: !!agreeTerms,
      newsletterUpdates: !!newsletterUpdates,
      status: "pending",
    });

    // Send confirmation email acknowledging registration
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
        <h2 style="color: #0093D0;">Gambling Harms UK (GHUK)</h2>
        <p>Hello ${name},</p>
        <p>Thank you for applying for GHUK Professional Membership. We have received your details.</p>
        <p><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">Pending Admin Review</span></p>
        <p>Our team is currently rolling out the members' portal in stages and will review your organization details (${organisation || sector}). You will receive an email once your account has been approved.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">If you did not submit this request, please ignore this email.</p>
      </div>
    `;

    await sendEmail({
      email: member.email,
      subject: "GHUK Membership Application Received (Pending Approval)",
      html: htmlMessage,
    });

    res.status(201).json({
      success: true,
      message:
        "Thank you for registering! Your application has been submitted and is currently pending admin review. A colleague will be in touch soon.",
      data: {
        id: member._id,
        name: member.name,
        email: member.email,
        status: member.status,
      },
    });
  } catch (error) {
    console.error("Member registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit membership registration.",
    });
  }
};

// @desc    Member login
// @route   POST /api/member-auth/login
// @access  Public
exports.loginMember = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email and password.",
      });
    }

    const member = await Member.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!member) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await member.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check Approval Status
    if (member.status === "pending") {
      return res.status(403).json({
        success: false,
        status: "pending",
        message:
          "Your membership application is currently under review by our admin team. You will be able to sign in as soon as it is approved.",
      });
    }

    if (member.status === "rejected") {
      return res.status(403).json({
        success: false,
        status: "rejected",
        message:
          "Your membership application was not approved. Please email hello@gamblingharm.com if you believe this was in error.",
      });
    }

    // Generate JWT token
    const token = member.getJwtToken();

    res.status(200).json({
      success: true,
      message: "Signed in successfully!",
      token,
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        organisation: member.organisation,
        role: member.role,
        sector: member.sector,
        status: member.status,
      },
    });
  } catch (error) {
    console.error("Member login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Sign in failed.",
    });
  }
};

// @desc    Get currently authenticated member
// @route   GET /api/member-auth/me
// @access  Private (Member)
exports.getMe = async (req, res) => {
  try {
    const member = await Member.findById(req.member.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    res.status(200).json({
      success: true,
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        organisation: member.organisation,
        role: member.role,
        sector: member.sector,
        status: member.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch profile.",
    });
  }
};

// @desc    Forgot Password for Member
// @route   POST /api/member-auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email address.",
      });
    }

    const member = await Member.findOne({ email: email.toLowerCase() });
    if (!member) {
      // Don't leak whether user exists for security
      return res.status(200).json({
        success: true,
        message: "If an account exists with that email, a password reset link has been sent.",
      });
    }

    const resetToken = member.getResetPasswordToken();
    await member.save({ validateBeforeSave: false });

    const rawClientUrl =
      process.env.FRONTEND_URL ||
      process.env.MEMBER_CLIENT_URL ||
      "https://gambling-harm-uk.netlify.app";
    const clientUrl = rawClientUrl.replace(/\/+$/, "");
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
        <h2 style="color: #0093D0;">Gambling Harms UK (GHUK)</h2>
        <p>Hello ${member.name},</p>
        <p>You requested a password reset for your GHUK Member account.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #0093D0; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">
            Reset Your Password
          </a>
        </p>
        <p style="font-size: 13px; color: #64748b;">This reset link will expire in 60 minutes. If you did not request a password reset, please ignore this email.</p>
      </div>
    `;

    await sendEmail({
      email: member.email,
      subject: "GHUK Member Password Reset Request",
      html: htmlMessage,
    });

    res.status(200).json({
      success: true,
      message: "If an account exists with that email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process password reset request.",
    });
  }
};

// @desc    Reset Password with token
// @route   POST /api/member-auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const member = await Member.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!member) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token.",
      });
    }

    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    member.password = req.body.password;
    member.resetPasswordToken = undefined;
    member.resetPasswordExpire = undefined;
    await member.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password.",
    });
  }
};
