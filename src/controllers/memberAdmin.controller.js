const Member = require("../models/member.model");
const sendEmail = require("../utils/sendEmail");

// @desc    Get all members with filters & search
// @route   GET /api/members
// @access  Private (Admin)
exports.getMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const query = {};

    // Status filter
    if (req.query.status && req.query.status !== "all") {
      query.status = req.query.status;
    }

    // Sector filter
    if (req.query.sector && req.query.sector !== "all") {
      query.sector = req.query.sector;
    }

    // Search query
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { organisation: searchRegex },
        { role: searchRegex },
        { sector: searchRegex },
      ];
    }

    const total = await Member.countDocuments(query);
    const members = await Member.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: members,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Get members error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch members list.",
    });
  }
};

// @desc    Get member statistics for dashboard cards
// @route   GET /api/members/stats
// @access  Private (Admin)
exports.getMemberStats = async (req, res) => {
  try {
    const total = await Member.countDocuments();
    const pending = await Member.countDocuments({ status: "pending" });
    const approved = await Member.countDocuments({ status: "approved" });
    const rejected = await Member.countDocuments({ status: "rejected" });

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
      },
    });
  } catch (error) {
    console.error("Get member stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load member statistics.",
    });
  }
};

// @desc    Update member status (Approve or Reject)
// @route   PATCH /api/members/:id/status
// @access  Private (Admin)
exports.updateMemberStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'pending', 'approved', or 'rejected'.",
      });
    }

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    member.status = status;
    if (status === "approved") {
      member.approvedAt = new Date();
      member.approvedBy = req.user ? req.user._id : undefined;
    }

    await member.save();

    // Send email notification based on status
    const rawClientUrl =
      process.env.FRONTEND_URL ||
      process.env.MEMBER_CLIENT_URL ||
      "https://gambling-harm-uk.netlify.app";
    const clientUrl = rawClientUrl.replace(/\/+$/, "");

    if (status === "approved") {
      const signInUrl = `${clientUrl}/sign-in`;
      const libraryUrl = `${clientUrl}/members-library`;

      const htmlMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
          <h2 style="color: #0093D0;">Gambling Harms UK (GHUK)</h2>
          <p>Hello ${member.name},</p>
          <p>We are pleased to inform you that your <strong>GHUK Professional Membership</strong> has been approved!</p>
          <p>You can now sign in to access the exclusive <strong>Members Library</strong>, training packages, safeguarding materials, and evidence modelling tools.</p>
          
          <div style="margin: 28px 0;">
            <a href="${signInUrl}" style="background-color: #0093D0; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">
              Sign In to Your Account
            </a>
          </div>

          <p>Or browse the library directly: <a href="${libraryUrl}" style="color: #0093D0;">${libraryUrl}</a></p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #64748b;">If you need assistance or have questions, contact us at hello@gamblingharm.com</p>
        </div>
      `;

      await sendEmail({
        email: member.email,
        subject: "🎉 Your GHUK Professional Membership is Approved!",
        html: htmlMessage,
      });
    } else if (status === "rejected") {
      const htmlMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
          <h2 style="color: #0093D0;">Gambling Harms UK (GHUK)</h2>
          <p>Hello ${member.name},</p>
          <p>Thank you for your interest in GHUK Professional Membership. At this stage, our team was unable to approve your application.</p>
          <p>If you believe this was in error or your organization details have changed, please contact us at <a href="mailto:hello@gamblingharm.com" style="color: #0093D0;">hello@gamblingharm.com</a>.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #64748b;">Gambling Harms UK Team</p>
        </div>
      `;

      await sendEmail({
        email: member.email,
        subject: "Update Regarding Your GHUK Membership Application",
        html: htmlMessage,
      });
    }

    res.status(200).json({
      success: true,
      message: `Member status updated to '${status}' successfully.`,
      data: member,
    });
  } catch (error) {
    console.error("Update member status error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update member status.",
    });
  }
};

// @desc    Delete a member record
// @route   DELETE /api/members/:id
// @access  Private (Admin)
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Member record deleted successfully.",
    });
  } catch (error) {
    console.error("Delete member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete member.",
    });
  }
};
