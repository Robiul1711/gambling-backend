const Event = require("../models/event.model");
const EventRegistration = require("../models/eventRegistration.model");
const sendEmail = require("../utils/sendEmail");

// Helper: Sync events from Eventbrite API
const syncEventbriteHelper = async () => {
  const token = process.env.EVENTBRITE_API_TOKEN || "FFDOESO7EY52KFRPKZR3";
  const orgId = process.env.EVENTBRITE_ORGANIZER_ID || "119515747671";

  if (!token || !orgId) {
    return { success: false, message: "Eventbrite credentials not configured" };
  }

  try {
    const url = `https://www.eventbriteapi.com/v3/organizers/${orgId}/events/?status=live,started,ended,all&order_by=start_desc`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Eventbrite API responded with status ${response.status}`);
    }

    const data = await response.json();
    const eventbriteEvents = data.events || [];

    const syncedList = [];

    for (const ev of eventbriteEvents) {
      const startDate = new Date(ev.start?.local || ev.start?.utc);
      const endDate = new Date(ev.end?.local || ev.end?.utc);

      const dayStr = isNaN(startDate.getTime())
        ? "DD"
        : startDate.toLocaleDateString("en-GB", { day: "2-digit" });

      const monthStr = isNaN(startDate.getTime())
        ? "MON"
        : startDate.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();

      const fullDateStr = isNaN(startDate.getTime())
        ? "Date TBC"
        : startDate.toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "long",
            year: "numeric",
          });

      const timeStr =
        !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())
          ? `${startDate.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })} to ${endDate.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : "Time TBC";

      const eventPayload = {
        title: ev.name?.text || "Untitled Event",
        category: ev.online_event ? "WEBINAR" : "WORKSHOP",
        day: dayStr,
        month: monthStr,
        date: fullDateStr,
        time: timeStr,
        format: ev.online_event ? "Online" : "In person",
        location: ev.online_event
          ? "Online (Joining link sent on registration)"
          : "In person",
        cost: ev.is_free ? "Free" : "Ticketed",
        whoItIsFor:
          "NHS, local authorities, educators, healthcare teams and anyone affected",
        oneLineDescription:
          ev.summary || ev.description?.text?.slice(0, 160) || "",
        summary: ev.summary || ev.description?.text?.slice(0, 250) || "",
        aboutParagraphs: ev.description?.text
          ? ev.description.text.split("\n\n").filter(Boolean)
          : [ev.summary || "No description provided."],
        howToJoin:
          "Register for free directly on Eventbrite using the booking link below.",
        eventbriteId: ev.id,
        eventbriteUrl: ev.url,
        imageUrl: ev.logo?.original?.url || ev.logo?.url || "",
        status:
          ev.status === "live"
            ? "upcoming"
            : ev.status === "ended"
            ? "completed"
            : "draft",
      };

      const syncedEvent = await Event.findOneAndUpdate(
        { eventbriteId: ev.id },
        { $set: eventPayload },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      syncedList.push(syncedEvent);
    }

    return { success: true, count: syncedList.length, data: syncedList };
  } catch (error) {
    console.error("Eventbrite auto-sync error:", error.message);
    return { success: false, message: error.message };
  }
};

// GET all public events (with automatic background sync if empty or requested)
exports.getEvents = async (req, res) => {
  try {
    const { status = "upcoming", all, sync } = req.query;

    if (sync === "true") {
      await syncEventbriteHelper();
    }

    const query = {};
    if (all !== "true" && status) {
      query.status = status;
    }

    let events = await Event.find(query).sort({ order: 1, createdAt: -1 });

    // If no events in DB yet, attempt a sync from Eventbrite
    if (events.length === 0) {
      await syncEventbriteHelper();
      events = await Event.find(query).sort({ order: 1, createdAt: -1 });
    }

    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Explicit Sync endpoint
exports.syncEventbrite = async (req, res) => {
  try {
    const result = await syncEventbriteHelper();
    if (!result.success) {
      return res.status(500).json(result);
    }
    res.status(200).json({
      success: true,
      message: `Successfully synced ${result.count} events from Eventbrite!`,
      data: result.data,
    });
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
