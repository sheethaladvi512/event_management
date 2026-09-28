// app.js — admin page: create events, list events with quick links

const eventForm = document.getElementById('event-form');
const eventListEl = document.getElementById('event-list');

async function loadEvents() {
  try {
    const res = await fetch(`${API_BASE}/events`);
    const events = await res.json();

    if (!events.length) {
      eventListEl.innerHTML = '<p>No events yet. Create one above.</p>';
      return;
    }

    eventListEl.innerHTML = events
      .map(
        (ev) => `
        <div class="event-list-item">
          <div>
            <strong>${ev.name}</strong><br/>
            <span style="color:var(--muted); font-size:0.85rem;">
              ${new Date(ev.startTime).toLocaleString()} · ${ev.venue || 'No venue set'}
            </span>
          </div>
          <div>
            <a href="register.html?eventId=${ev._id}">Register</a> ·
            <a href="checkin.html?eventId=${ev._id}">Check-in</a> ·
            <a href="dashboard.html?eventId=${ev._id}">Dashboard</a>
          </div>
        </div>`
      )
      .join('');
  } catch (err) {
    eventListEl.innerHTML = `<p style="color:var(--danger)">Failed to load events: ${err.message}</p>`;
  }
}

eventForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById('name').value,
    description: document.getElementById('description').value,
    venue: document.getElementById('venue').value,
    startTime: document.getElementById('startTime').value,
    endTime: document.getElementById('endTime').value,
    capacity: Number(document.getElementById('capacity').value) || 0,
  };

  try {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to create event');

    eventForm.reset();
    loadEvents();
  } catch (err) {
    alert(err.message);
  }
});

loadEvents();
