const form = document.getElementById('wishForm');
const statusElement = document.getElementById('status');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = {
    name: String(formData.get('name') || '').trim(),
    message: String(formData.get('message') || '').trim()
  };

  statusElement.textContent = 'Sending your wish...';

  try {
    const response = await fetch('/api/greetings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unable to submit your wish.');
    }

    form.reset();
    statusElement.textContent = 'Your wish was sent! Thank you for celebrating Ramona. 💜';
  } catch (error) {
    statusElement.textContent = error.message;
  }
});
