// models/Feedback.js
// Post-event feedback submitted by an attendee.

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendee', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String, default: '' },
  },
  { timestamps: true }
);

// One feedback submission per attendee per event.
feedbackSchema.index({ event: 1, attendee: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
