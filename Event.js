// models/Event.js
// Represents a single event that admins create and attendees register for.

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    venue: { type: String, default: '' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    capacity: { type: Number, default: 0 }, // 0 = unlimited
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
