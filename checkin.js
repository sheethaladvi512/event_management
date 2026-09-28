// checkin.js — runs the camera QR scanner and posts scanned codes to /api/checkin

const statusEl = document.getElementById('scan-status');

let isProcessing = false; // prevents firing the same scan multiple times in a row

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = type; // 'success' | 'error' | 'idle'
}

async function handleScan(decodedText) {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const res = await fetch(`${API_BASE}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketCode: decodedText }),
    });
    const data = await res.json();

    if (data.status === 'success') {
      setStatus(`✅ ${data.message}`, 'success');
    } else if (data.status === 'duplicate') {
      setStatus(`⚠️ ${data.message}`, 'error');
    } else {
      setStatus(`❌ ${data.message || 'Invalid ticket'}`, 'error');
    }
  } catch (err) {
    setStatus(`❌ Network error: ${err.message}`, 'error');
  }

  // Allow the next scan after a short cooldown so the same code isn't
  // processed repeatedly while it's still in view of the camera.
  setTimeout(() => {
    isProcessing = false;
  }, 2500);
}

const html5QrCode = new Html5Qrcode('reader');
Html5Qrcode.getCameras()
  .then((cameras) => {
    if (!cameras.length) {
      setStatus('No camera found on this device', 'error');
      return;
    }
    html5QrCode.start(
      cameras[0].id,
      { fps: 10, qrbox: 250 },
      (decodedText) => handleScan(decodedText),
      () => {} // ignore per-frame scan failures, expected while aiming
    );
  })
  .catch((err) => setStatus(`Camera access error: ${err}`, 'error'));
