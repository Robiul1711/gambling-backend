const CheckInAnalytics = require("../models/checkInAnalytics.model");

// Record an anonymous check-in telemetry event (Strictly Zero-PII)
exports.recordEvent = async (req, res) => {
  try {
    const { eventType, path, resultBand, score, action, target } = req.body;

    if (!eventType) {
      return res.status(400).json({ success: false, message: "eventType is required" });
    }

    // Do NOT capture req.ip, req.headers['user-agent'], or any session identifiers
    await CheckInAnalytics.create({
      eventType,
      path: path || null,
      resultBand: resultBand || null,
      score: typeof score === "number" ? score : null,
      action: action || null,
      target: target || null,
      createdAt: new Date(),
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error logging anonymous check-in event:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get aggregated anonymous analytics summary for Admin Dashboard
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const totalStarted = await CheckInAnalytics.countDocuments({ eventType: "checkin_started" });
    const totalCompleted = await CheckInAnalytics.countDocuments({ eventType: "checkin_completed" });
    const totalHelplineClicks = await CheckInAnalytics.countDocuments({ eventType: "helpline_click" });
    const totalSaved = await CheckInAnalytics.countDocuments({ eventType: "checkin_saved" });

    // Path breakdown
    const pathBreakdown = await CheckInAnalytics.aggregate([
      { $match: { eventType: "checkin_started" } },
      { $group: { _id: "$path", count: { $sum: 1 } } },
    ]);

    // Results breakdown
    const resultsBreakdown = await CheckInAnalytics.aggregate([
      { $match: { eventType: "checkin_completed" } },
      { $group: { _id: { path: "$path", resultBand: "$resultBand" }, count: { $sum: 1 } } },
    ]);

    // Helpline clicks breakdown
    const helplineBreakdown = await CheckInAnalytics.aggregate([
      { $match: { eventType: "helpline_click" } },
      { $group: { _id: "$action", count: { $sum: 1 } } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalStarted,
        totalCompleted,
        totalHelplineClicks,
        totalSaved,
        pathBreakdown,
        resultsBreakdown,
        helplineBreakdown,
      },
    });
  } catch (error) {
    console.error("Error fetching check-in analytics summary:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
