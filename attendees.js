// routes/attendees.js
// Handles attendee registration and QR code generation.

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const Attendee = require('../models/Attendee');
const Event = require('../models/Event');
const { sendTicketEmail } = require('../mailer');

// Register an attendee for an event -> returns attendee + QR code (as base64 image)
router.post('/register', async (req, res) => {
  try {
    const { eventId, name, email } = req.body;
    if (!eventId || !name || !email) {
      return res.status(400).json({ error: 'eventId, name and email are required' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Prevent the same person registering twice for the same event —
    // reduces duplicate data entry instead of creating a second record.
    const existing = await Attendee.findOne({ event: eventId, email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'This email is already registered for this event', attendee: existing });
    }

    if (event.capacity > 0) {
      const count = await Attendee.countDocuments({ event: eventId });
      if (count >= event.capacity) {
        return res.status(400).json({ error: 'Event is at full capacity' });
      }
    }

    const ticketCode = uuidv4();
    const attendee = await Attendee.create({ event: eventId, name, email, ticketCode });

    // Encode just the ticketCode into the QR — the scanner reads this string
    // and sends it to /api/checkin.
    const qrDataUrl = await QRCode.toDataURL(ticketCode);

    // Automated confirmation email (communication automation). Silently
    // skipped if SMTP isn't configured — registration still succeeds.
    let emailResult = { sent: false };
    try {
      emailResult = await sendTicketEmail({
        to: attendee.email,
        name: attendee.name,
        eventName: event.name,
        ticketCode,
        qrDataUrl,
      });
    } catch (mailErr) {
      console.error('Email send failed:', mailErr.message);
    }

    res.status(201).json({ attendee, qrCode: qrDataUrl, emailSent: emailResult.sent });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Duplicate ticket code, please try again' });
    }
    res.status(500).json({ error: err.message });
  }
});

// List attendees for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const attendees = await Attendee.find({ event: req.params.eventId }).sort({ createdAt: -1 });
    res.json(attendees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
