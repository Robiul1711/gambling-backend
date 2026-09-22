const Booking = require("../models/booking.model");

// @desc    Submit a new booking request for session or workshop
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      organisationName,
      organisationType,
      role,
      sessionTypes,
      numberOfPeople,
      format,
      venueLocation,
      preferredTime,
      preferredDates,
      additionalInfo,
      newsletterUpdates,
      agreeTerms,
    } = req.body;

    if (!name || !email || !organisationName || !organisationType || !numberOfPeople || !format) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields marked with *",
      });
    }

    if (!agreeTerms) {
      return res.status(400).json({
        success: false,
        message: "You must agree to GHUK contacting you regarding this request.",
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const booking = await Booking.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      organisationName: organisationName.trim(),
      organisationType: organisationType.trim(),
      role: role ? role.trim() : "",
      sessionTypes: Array.isArray(sessionTypes) ? sessionTypes : [],
      numberOfPeople: numberOfPeople.trim(),
      format: format.trim(),
      venueLocation: venueLocation ? venueLocation.trim() : "",
      preferredTime: preferredTime || "No preference",
      preferredDates: preferredDates ? preferredDates.trim() : "",
      additionalInfo: additionalInfo ? additionalInfo.trim() : "",
      newsletterUpdates: Boolean(newsletterUpdates),
      agreeTerms: Boolean(agreeTerms),
    });

    return res.status(201).json({
      success: true,
      message: "Thank you for your booking request! A member of our team will be in touch shortly.",
      data: booking,
    });
  } catch (error) {
    console.error("Error in createBooking:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing booking request. Please try again later.",
      error: error.message,
    });
  }
};

// @desc    Get all booking requests (Admin)
// @route   GET /api/bookings
// @access  Private / Admin
exports.getBookings = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 20 } = req.query;

    const query = {};

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { organisationName: searchRegex },
      ];
    }

    if (status.trim() && status !== "All") {
      query.status = status.trim();
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNumber - 1) * limitNumber;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Booking.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNumber) || 1;

    return res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: pageNumber,
        totalPages,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("Error in getBookings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking requests.",
      error: error.message,
    });
  }
};

// @desc    Update booking request status
// @route   PATCH /api/bookings/:id/status
// @access  Private / Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "contacted", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value.",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully.",
      data: booking,
    });
  } catch (error) {
    console.error("Error in updateBookingStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update booking status.",
      error: error.message,
    });
  }
};

// @desc    Delete a booking request
// @route   DELETE /api/bookings/:id
// @access  Private / Admin
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking request deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteBooking:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete booking request.",
      error: error.message,
    });
  }
};
