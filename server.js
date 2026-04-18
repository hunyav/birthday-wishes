const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const DATA_FILE = process.env.GREETINGS_FILE || path.join(__dirname, 'data', 'greetings.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT || 3000);
const QR_CODE_IMAGE_URL = process.env.QR_CODE_IMAGE_URL || '/assets/qr-code.svg';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

async function ensureDataFile() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]\n', 'utf8');
  }
}

async function readGreetings() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

async function writeGreetings(greetings) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, `${JSON.stringify(greetings, null, 2)}\n`, 'utf8');
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

async function parseJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function handleApi(req, res) {
  if (req.method === 'GET' && req.url === '/api/greetings') {
    const greetings = await readGreetings();
    return sendJson(res, 200, { greetings });
  }

  if (req.method === 'POST' && req.url === '/api/greetings') {
    let body;
    try {
      body = await parseJsonBody(req);
    } catch {
      return sendJson(res, 400, { error: 'Invalid JSON body' });
    }

    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!message) {
      return sendJson(res, 400, { error: 'Greeting message is required' });
    }

    const greeting = {
      message: message.slice(0, 500),
      name: name.slice(0, 100),
      createdAt: new Date().toISOString()
    };

    const greetings = await readGreetings();
    greetings.push(greeting);
    await writeGreetings(greetings);

    return sendJson(res, 201, { greeting });
  }

  return false;
}

function safeStaticPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^([.][.][/\\])+/, '');
  const candidate = normalized === '/' ? '/index.html' : normalized;
  const fullPath = path.join(PUBLIC_DIR, candidate);

  if (!fullPath.startsWith(PUBLIC_DIR)) {
    return null;
  }

  return fullPath;
}

async function handleStatic(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    res.end();
    return;
  }

  let urlPath = req.url;
  if (urlPath === '/submit') {
    urlPath = '/submit.html';
  }

  const fullPath = safeStaticPath(urlPath);
  if (!fullPath) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  try {
    const content = await fs.readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      if (req.url === '/api/config' && req.method === 'GET') {
        return sendJson(res, 200, { qrCodeImageUrl: QR_CODE_IMAGE_URL });
      }

      const apiHandled = await handleApi(req, res);
      if (apiHandled !== false) {
        return;
      }

      await handleStatic(req, res);
    } catch (error) {
      sendJson(res, 500, { error: 'Internal server error' });
    }
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`Birthday wishes app running at http://localhost:${PORT}`);
  });
}

module.exports = {
  createServer,
  readGreetings,
  writeGreetings
};
