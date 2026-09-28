// api/index.js
// This file is the single entry point for the backend.
//
// On Vercel: any file under /api that exports a function (or an Express
// app, which is itself callable as a request handler) automatically becomes
// a serverless function. vercel.json rewrites every /api/* request here.
//
// Locally: running "node api/index.js" directly starts a normal server on
// PORT, so you can develop exactly like before without the Vercel CLI.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');

const eventRoutes = require('./routes/events');
const attendeeRoutes = require('./routes/attendees');
const checkinRoutes = require('./routes/checkin');
const feedbackRoutes = require('./routes/feedback');
const certificateRoutes = require('./routes/certificate');

const app = express();

app.use(cors());
app.use(express.json());

// Make sure the database is connected before any route handler runs.
// Safe to call on every request — connectDB() reuses a warm connection.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed: ' + err.message });
  }
});

app.use('/api/events', eventRoutes);
app.use('/api/attendees', attendeeRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/certificate', certificateRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Only used for local development. On Vercel, the /public folder is served
// automatically as static files and never reaches this code.
if (require.main === module) {
  app.use(express.static(path.join(__dirname, '..', 'public')));
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
