// register.js — reads ?eventId= from the URL, submits registration, shows QR

const params = new URLSearchParams(window.location.search);
const eventId = params.get('eventId');

const nameLabel = document.getElementById('event-name-label');
const form = document.getElementById('register-form');
const qrResult = document.getElementById('qr-result');
const qrImage = document.getElementById('qr-image');
const ticketCodeEl = document.getElementById('ticket-code');

async function loadEvent() {
  if (!eventId) {
    nameLabel.textContent = 'No event selected. Go back to Admin and pick an event.';
    form.style.display = 'none';
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}`);
    if (!res.ok) throw new Error('Event not found');
    const event = await res.json();
    nameLabel.textContent = `Registering for: ${event.name}`;
  } catch (err) {
    nameLabel.textContent = err.message;
    form.style.display = 'none';
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    eventId,
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
  };

  try {
    const res = await fetch(`${API_BASE}/attendees/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    qrImage.src = data.qrCode;
    ticketCodeEl.textContent = `Ticket: ${data.attendee.ticketCode}`;
    qrResult.style.display = 'block';
    form.style.display = 'none';
  } catch (err) {
    alert(err.message);
  }
});

loadEvent();
