const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const app = express();
const port = Number.parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || '0.0.0.0';
const maxGreetings = Number.parseInt(process.env.MAX_GREETINGS || '200', 10);
const dataFile = process.env.GREETINGS_FILE || path.join(__dirname, 'data', 'greetings.json');

app.use(express.json({ limit: '250kb' }));
app.use(express.static(path.join(__dirname, 'public')));

async function ensureDataFile() {
  const dir = path.dirname(dataFile);
  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, '[]\n', 'utf8');
  }
}

async function readGreetings() {
  await ensureDataFile();
  const raw = await fs.readFile(dataFile, 'utf8');

  if (!raw.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeGreetings(greetings) {
  const normalized = greetings.slice(0, maxGreetings);
  await fs.writeFile(dataFile, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
}

function sanitizeGreeting(input) {
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const message = typeof input.message === 'string' ? input.message.trim() : '';

  if (!name || !message) {
    return { error: 'Name and message are required.' };
  }

  if (name.length > 80) {
    return { error: 'Name is too long (max 80 characters).' };
  }

  if (message.length > 500) {
    return { error: 'Message is too long (max 500 characters).' };
  }

  return {
    greeting: {
      id: crypto.randomUUID(),
      name,
      message,
      createdAt: new Date().toISOString()
    }
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get('/api/greetings', async (_req, res) => {
  const greetings = await readGreetings();

  greetings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ greetings });
});

app.post('/api/greetings', async (req, res) => {
  const { greeting, error } = sanitizeGreeting(req.body || {});

  if (error) {
    return res.status(400).json({ error });
  }

  const greetings = await readGreetings();
  greetings.unshift(greeting);
  await writeGreetings(greetings);

  return res.status(201).json({ greeting });
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/submit', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'submit.html'));
});

app.listen(port, host, () => {
  console.log(`Birthday wishes app running at http://${host}:${port}`);
  console.log(`Using greetings file: ${dataFile}`);
});
