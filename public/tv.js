const listElement = document.getElementById('wishesList');
const refreshIntervalMs = Number.parseInt(window.BANNER_REFRESH_MS || '180000', 10);

function renderGreetings(greetings) {
  listElement.innerHTML = '';

  if (!greetings.length) {
    const item = document.createElement('li');
    item.innerHTML = '<p class="message">No wishes yet. Be the first to send one!</p>';
    listElement.appendChild(item);
    return;
  }

  greetings.forEach((greeting) => {
    const item = document.createElement('li');
    const safeMessage = escapeHtml(greeting.message || '');
    const safeName = escapeHtml(greeting.name || 'Anonymous');
    const created = new Date(greeting.createdAt);
    const timestamp = Number.isNaN(created.getTime()) ? '' : ` · ${created.toLocaleString()}`;

    item.innerHTML = `
      <p class="message">${safeMessage}</p>
      <p class="sender">— ${safeName}${timestamp}</p>
    `;
    listElement.appendChild(item);
  });
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function loadGreetings() {
  try {
    const response = await fetch('/api/greetings', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load greetings (${response.status})`);
    }

    const data = await response.json();
    renderGreetings(data.greetings || []);
  } catch (error) {
    listElement.innerHTML = '<li><p class="message">Unable to load greetings. Retrying...</p></li>';
    console.error(error);
  }
}

loadGreetings();
setInterval(loadGreetings, refreshIntervalMs);
