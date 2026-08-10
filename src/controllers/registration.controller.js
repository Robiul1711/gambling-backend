const Registration = require("../models/registration.model");

// @desc    Submit a new registration / subscription
// @route   POST /api/registrations
// @access  Public
exports.createRegistration = async (req, res) => {
  try {
    const {
      name,
      email,
      tailorCategory,
      newsletterUpdates,
      membershipInterest,
      agreeTerms,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required fields.",
      });
    }

    if (!agreeTerms) {
      return res.status(400).json({
        success: false,
        message: "You must agree to contact terms to register.",
      });
    }

    // Basic email validation regex
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const registration = await Registration.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      tailorCategory: tailorCategory || "Prefer not to say",
      newsletterUpdates: Boolean(newsletterUpdates),
      membershipInterest: Boolean(membershipInterest),
      agreeTerms: Boolean(agreeTerms),
    });

    return res.status(201).json({
      success: true,
      message: "Thank you for registering! Your preferences have been saved.",
      data: registration,
    });
  } catch (error) {
    console.error("Error in createRegistration:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing registration. Please try again later.",
      error: error.message,
    });
  }
};

// @desc    Get all registrations with search, filter, and pagination
// @route   GET /api/registrations
// @access  Private / Admin
exports.getRegistrations = async (req, res) => {
  try {
    const { search = "", category = "", page = 1, limit = 20 } = req.query;

    const query = {};

    // Search filter for name or email
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    // Category filter
    if (category.trim() && category !== "All") {
      query.tailorCategory = category.trim();
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNumber - 1) * limitNumber;

    const [registrations, total] = await Promise.all([
      Registration.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Registration.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNumber) || 1;

    return res.status(200).json({
      success: true,
      data: registrations,
      pagination: {
        total,
        page: pageNumber,
        totalPages,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("Error in getRegistrations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch registrations.",
      error: error.message,
    });
  }
};

// @desc    Get summary statistics for registrations
// @route   GET /api/registrations/stats
// @access  Private / Admin
exports.getRegistrationStats = async (req, res) => {
  try {
    const [total, newsletterCount, membershipCount, categoryStats] =
      await Promise.all([
        Registration.countDocuments(),
        Registration.countDocuments({ newsletterUpdates: true }),
        Registration.countDocuments({ membershipInterest: true }),
        Registration.aggregate([
          {
            $group: {
              _id: "$tailorCategory",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ]),
      ]);

    return res.status(200).json({
      success: true,
      data: {
        total,
        newsletterCount,
        membershipCount,
        categoryBreakdown: categoryStats.map((item) => ({
          category: item._id || "Unspecified",
          count: item.count,
        })),
      },
    });
  } catch (error) {
    console.error("Error in getRegistrationStats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch registration statistics.",
      error: error.message,
    });
  }
};

// @desc    Delete a registration
// @route   DELETE /api/registrations/:id
// @access  Private / Admin
exports.deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findByIdAndDelete(id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Registration deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteRegistration:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete registration.",
      error: error.message,
    });
  }
};

// @desc    Export all registrations as CSV
// @route   GET /api/registrations/export/csv
// @access  Private / Admin
exports.exportRegistrationsCsv = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 }).lean();

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const headers = [
      "ID",
      "Name",
      "Email",
      "Tailor Category",
      "Newsletter Updates",
      "Membership Interest",
      "Agreed to Terms",
      "Date Registered (UTC)",
    ];

    const rows = registrations.map((r) => [
      escapeCsv(r._id),
      escapeCsv(r.name),
      escapeCsv(r.email),
      escapeCsv(r.tailorCategory),
      escapeCsv(r.newsletterUpdates ? "Yes" : "No"),
      escapeCsv(r.membershipInterest ? "Yes" : "No"),
      escapeCsv(r.agreeTerms ? "Yes" : "No"),
      escapeCsv(new Date(r.createdAt).toISOString()),
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\r\n"
    );

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="registered_users_${Date.now()}.csv"`
    );

    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Error in exportRegistrationsCsv:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export CSV file.",
      error: error.message,
    });
  }
};
