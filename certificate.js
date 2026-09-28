// certificate.js — triggers a PDF download for a checked-in attendee

const form = document.getElementById('certificate-form');
const statusEl = document.getElementById('certificate-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const ticketCode = document.getElementById('ticketCode').value.trim();
  statusEl.textContent = '';

  try {
    const res = await fetch(`${API_BASE}/certificate/${ticketCode}`);
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Could not generate certificate');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${ticketCode}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    statusEl.textContent = 'Certificate downloaded.';
    statusEl.style.color = 'var(--success)';
  } catch (err) {
    statusEl.textContent = err.message;
    statusEl.style.color = 'var(--danger)';
  }
});
