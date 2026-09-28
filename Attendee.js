// models/Attendee.js
// Represents a person registered for an event. Each attendee gets a unique
// ticketCode which is encoded into their QR code and used for check-in.

const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    ticketCode: { type: String, required: true, unique: true }, // encoded in QR
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendee', attendeeSchema);
