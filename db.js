// db.js
// On Vercel, this file can be invoked many times across separate serverless
// requests. We cache the connection on the global object so a warm function
// instance reuses it instead of opening a new MongoDB connection every time.

const mongoose = require('mongoose');

let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event_management';
    cached.promise = mongoose.connect(uri).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

module.exports = connectDB;
