// routes/events.js
// CRUD endpoints for events. Used by the admin page.

const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Attendee = require('../models/Attendee');
const Feedback = require('../models/Feedback');

// Create a new event
router.post('/', async (req, res) => {
  try {
    const { name, description, venue, startTime, endTime, capacity } = req.body;
    if (!name || !startTime || !endTime) {
      return res.status(400).json({ error: 'name, startTime and endTime are required' });
    }
    const event = await Event.create({ name, description, venue, startTime, endTime, capacity });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ startTime: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single event by id
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an event
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an event and its attendees
router.delete('/:id', async (req, res) => {
  try {
    await Attendee.deleteMany({ event: req.params.id });
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Live stats for the dashboard: total registered vs checked in
router.get('/:id/stats', async (req, res) => {
  try {
    const eventId = req.params.id;
    const total = await Attendee.countDocuments({ event: eventId });
    const checkedIn = await Attendee.countDocuments({ event: eventId, checkedIn: true });
    const recent = await Attendee.find({ event: eventId, checkedIn: true })
      .sort({ checkedInAt: -1 })
      .limit(10)
      .select('name email checkedInAt');

    const feedbackList = await Feedback.find({ event: eventId });
    const averageRating = feedbackList.length
      ? Number((feedbackList.reduce((sum, f) => sum + f.rating, 0) / feedbackList.length).toFixed(2))
      : null;

    res.json({
      total,
      checkedIn,
      remaining: total - checkedIn,
      recent,
      feedbackCount: feedbackList.length,
      averageRating,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Downloadable CSV report: one row per attendee, with check-in status.
// This is the "reporting" automation — organizers get a ready export
// instead of manually compiling one after the event.
router.get('/:id/report.csv', async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const attendees = await Attendee.find({ event: eventId }).sort({ createdAt: 1 });

    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const header = ['Name', 'Email', 'Ticket Code', 'Checked In', 'Checked In At', 'Registered At'];
    const rows = attendees.map((a) =>
      [
        a.name,
        a.email,
        a.ticketCode,
        a.checkedIn ? 'Yes' : 'No',
        a.checkedInAt ? a.checkedInAt.toISOString() : '',
        a.createdAt.toISOString(),
      ]
        .map(escapeCsv)
        .join(',')
    );

    const csv = [header.map(escapeCsv).join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${event.name.replace(/\s+/g, '_')}_report.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
