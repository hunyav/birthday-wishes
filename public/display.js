const greetingText = document.getElementById('greeting-text');
const greetingMeta = document.getElementById('greeting-meta');
const qrImage = document.getElementById('qr-code');

let queue = [];
let currentIndex = 0;

function shuffle(items) {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function renderCurrentGreeting() {
  if (queue.length === 0) {
    greetingText.textContent = 'No greetings yet — be the first to submit one!';
    greetingMeta.textContent = '';
    return;
  }

  const greeting = queue[currentIndex % queue.length];
  greetingText.textContent = `“${greeting.message}”`;
  greetingMeta.textContent = greeting.name ? `— ${greeting.name}` : '';
  currentIndex += 1;
}

async function refreshGreetings() {
  try {
    const response = await fetch('/api/greetings');
    if (!response.ok) {
      throw new Error('Failed to load greetings');
    }

    const data = await response.json();
    queue = shuffle(Array.isArray(data.greetings) ? data.greetings : []);
    currentIndex = 0;
    renderCurrentGreeting();
  } catch {
    greetingText.textContent = 'Could not fetch greetings right now.';
    greetingMeta.textContent = '';
  }
}

async function loadConfig() {
  try {
    const response = await fetch('/api/config');
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    if (data.qrCodeImageUrl) {
      qrImage.src = data.qrCodeImageUrl;
    }
  } catch {
    // Ignore config fetch failures and keep defaults.
  }
}

loadConfig();
refreshGreetings();

setInterval(renderCurrentGreeting, 8000);
setInterval(refreshGreetings, 2 * 60 * 1000);
