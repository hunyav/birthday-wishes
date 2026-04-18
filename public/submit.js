const form = document.getElementById('greeting-form');
const statusEl = document.getElementById('status');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  statusEl.textContent = 'Submitting...';

  const formData = new FormData(form);
  const payload = {
    message: String(formData.get('message') || '').trim(),
    name: String(formData.get('name') || '').trim()
  };

  try {
    const response = await fetch('/api/greetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit greeting');
    }

    form.reset();
    statusEl.textContent = 'Thank you! Your greeting was submitted.';
  } catch (error) {
    statusEl.textContent = error.message || 'Submission failed.';
  }
});
