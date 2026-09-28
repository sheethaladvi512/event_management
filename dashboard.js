// dashboard.js — polls the stats endpoint every few seconds for a "live" feel

const params = new URLSearchParams(window.location.search);
const eventId = params.get('eventId');

const nameLabel = document.getElementById('event-name-label');
const totalEl = document.getElementById('stat-total');
const checkedInEl = document.getElementById('stat-checked-in');
const remainingEl = document.getElementById('stat-remaining');
const recentListEl = document.getElementById('recent-list');
const ratingEl = document.getElementById('stat-rating');
const reportLink = document.getElementById('report-link');

const POLL_INTERVAL_MS = 3000;

if (eventId) {
  reportLink.href = `${API_BASE}/events/${eventId}/report.csv`;
}

async function loadEventName() {
  if (!eventId) {
    nameLabel.textContent = 'No event selected. Go back to Admin and pick an event.';
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}`);
    const event = await res.json();
    nameLabel.textContent = event.name;
  } catch {
    nameLabel.textContent = 'Event not found';
  }
}

async function refreshStats() {
  if (!eventId) return;
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}/stats`);
    const stats = await res.json();

    totalEl.textContent = stats.total;
    checkedInEl.textContent = stats.checkedIn;
    remainingEl.textContent = stats.remaining;
    ratingEl.textContent = stats.averageRating !== null ? `${stats.averageRating} / 5` : '—';

    recentListEl.innerHTML = stats.recent.length
      ? stats.recent
          .map(
            (a) => `
        <div class="attendee-row">
          <span>${a.name} (${a.email})</span>
          <span>${new Date(a.checkedInAt).toLocaleTimeString()}</span>
        </div>`
          )
          .join('')
      : 'No check-ins yet.';
  } catch (err) {
    console.error('Failed to refresh stats:', err.message);
  }
}

loadEventName();
refreshStats();
setInterval(refreshStats, POLL_INTERVAL_MS);
