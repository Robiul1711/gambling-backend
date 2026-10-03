const Event = require("../models/event.model");
const EventRegistration = require("../models/eventRegistration.model");
const sendEmail = require("../utils/sendEmail");

// GET all public events (upcoming or filtered by status)
exports.getEvents = async (req, res) => {
  try {
    const { status = "upcoming", all } = req.query;
    const query = {};
    if (all !== "true" && status) {
      query.status = status;
    }
    const events = await Event.find(query).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single event by id
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE new event (Admin)
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, data: event, message: "Event created successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// UPDATE event (Admin)
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.status(200).json({ success: true, data: event, message: "Event updated successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE event (Admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// REGISTER for an event (Public)
exports.registerForEvent = async (req, res) => {
  try {
    const {
      eventId,
      eventTitle,
      name,
      email,
      phone,
      organisation,
      role,
      places,
      describeYou,
      hearAbout,
      accessRequirements,
      agreeContact,
      newsletter,
    } = req.body;

    if (!name || !email || !agreeContact) {
      return res.status(400).json({
        success: false,
        message: "Name, email and consent agreement are required.",
      });
    }

    const registration = await EventRegistration.create({
      eventId: eventId || null,
      eventTitle: eventTitle || "General Event",
      name,
      email,
      phone: phone || "",
      organisation: organisation || "",
      role: role || "",
      places: places || "1",
      describeYou: describeYou || "Prefer not to say",
      hearAbout: hearAbout || "Please select",
      accessRequirements: accessRequirements || "",
      agreeContact: Boolean(agreeContact),
      newsletter: Boolean(newsletter),
      status: "confirmed",
    });

    // Send confirmation email asynchronously
    try {
      await sendEmail({
        email: email,
        subject: `Confirmation: Your place at ${eventTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
            <div style="background-color: #F0F7FB; padding: 24px; border-radius: 12px; border: 1px solid #DDEAF2; margin-bottom: 24px;">
              <p style="color: #0093D0; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 1px;">Gambling Harm UK — Event Registration</p>
              <h1 style="color: #0F172A; font-size: 22px; margin: 0 0 12px 0;">Registration Confirmed</h1>
              <p style="margin: 0; color: #475569; font-size: 14px;">Hi <strong>${name}</strong>, thank you for registering. Your place has been saved.</p>
            </div>
            <div style="padding: 16px; background-color: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0; margin-bottom: 20px;">
              <h2 style="font-size: 16px; margin: 0 0 10px 0; color: #0F172A;">${eventTitle}</h2>
              <p style="margin: 4px 0; font-size: 13px; color: #64748B;"><strong>Places Booked:</strong> ${places || "1"}</p>
              ${organisation ? `<p style="margin: 4px 0; font-size: 13px; color: #64748B;"><strong>Organisation:</strong> ${organisation}</p>` : ""}
            </div>
            <div style="margin-bottom: 24px; font-size: 13px; color: #475569;">
              <h3 style="font-size: 14px; color: #0F172A; margin: 0 0 8px 0;">What happens next?</h3>
              <p style="margin: 0 0 8px 0;">For online events, the joining link (Zoom/Live stream) will be sent closer to the event date. If you can no longer attend, simply reply to this email so we can offer the place to someone else.</p>
            </div>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
            <p style="font-size: 11px; color: #94A3B8; margin: 0;">We never sell your details, and we never accept gambling-industry funding. Gambling Harm UK.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Confirmation email error:", emailErr);
    }

    res.status(201).json({
      success: true,
      data: registration,
      message: "Registration successful",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET all event registrations (Admin)
exports.getEventRegistrations = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, eventId, status } = req.query;
    const query = {};

    if (eventId && eventId !== "All") {
      query.eventId = eventId;
    }
    if (status && status !== "All") {
      query.status = status;
    }
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
        { organisation: { $regex: s, $options: "i" } },
        { eventTitle: { $regex: s, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await EventRegistration.countDocuments(query);
    const registrations = await EventRegistration.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: registrations,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE registration status (Admin)
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const registration = await EventRegistration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }
    res.status(200).json({
      success: true,
      data: registration,
      message: `Status updated to ${status}`,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE registration (Admin)
exports.deleteRegistration = async (req, res) => {
  try {
    const registration = await EventRegistration.findByIdAndDelete(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }
    res.status(200).json({ success: true, message: "Registration deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
