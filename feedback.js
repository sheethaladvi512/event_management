// feedback.js — submits feedback using just a ticket code

const form = document.getElementById('feedback-form');
const statusEl = document.getElementById('feedback-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    ticketCode: document.getElementById('ticketCode').value.trim(),
    rating: Number(document.getElementById('rating').value),
    comments: document.getElementById('comments').value,
  };

  try {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit feedback');

    statusEl.textContent = 'Thanks — your feedback has been recorded.';
    statusEl.style.color = 'var(--success)';
    form.reset();
  } catch (err) {
    statusEl.textContent = err.message;
    statusEl.style.color = 'var(--danger)';
  }
});
