// mailer.js
// Sends the automated registration confirmation email (with the QR ticket
// attached) when SMTP settings are provided in .env. If they're not set,
// this silently skips sending instead of crashing the app — handy for
// running the project without email set up yet.

const nodemailer = require('nodemailer');

function isConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// qrDataUrl is a base64 data URL like "data:image/png;base64,...."
async function sendTicketEmail({ to, name, eventName, ticketCode, qrDataUrl }) {
  if (!isConfigured()) {
    console.log(`[mailer] SMTP not configured — skipping email to ${to}`);
    return { sent: false, reason: 'SMTP not configured' };
  }

  const transporter = getTransporter();
  const base64 = qrDataUrl.split(',')[1];

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Dr AIT Event Mgmt <no-reply@example.com>',
    to,
    subject: `Your ticket for ${eventName}`,
    html: `
      <p>Hi ${name},</p>
      <p>You're registered for <strong>${eventName}</strong>. Your ticket code is <strong>${ticketCode}</strong>.</p>
      <p>Show the attached QR code at the entrance for check-in.</p>
    `,
    attachments: [
      {
        filename: 'ticket-qr.png',
        content: base64,
        encoding: 'base64',
        cid: 'ticketqr',
      },
    ],
  });

  return { sent: true };
}

module.exports = { sendTicketEmail, isConfigured };
