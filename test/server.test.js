const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs/promises');
const os = require('os');

const tempDir = path.join(os.tmpdir(), `birthday-wishes-test-${process.pid}`);
const dataFile = path.join(tempDir, 'greetings.json');
process.env.GREETINGS_FILE = dataFile;

const { createServer } = require('../server');

let server;
let baseUrl;

test.before(async () => {
  await fs.mkdir(tempDir, { recursive: true });
  await fs.writeFile(dataFile, '[]\n', 'utf8');

  server = createServer();
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('POST then GET returns greeting', async () => {
  const postResponse = await fetch(`${baseUrl}/api/greetings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Happy birthday!', name: 'Alex' })
  });

  assert.equal(postResponse.status, 201);

  const getResponse = await fetch(`${baseUrl}/api/greetings`);
  assert.equal(getResponse.status, 200);

  const data = await getResponse.json();
  assert.equal(data.greetings.length, 1);
  assert.equal(data.greetings[0].message, 'Happy birthday!');
  assert.equal(data.greetings[0].name, 'Alex');
  assert.ok(data.greetings[0].createdAt);
});

test('POST rejects empty message', async () => {
  const response = await fetch(`${baseUrl}/api/greetings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '   ' })
  });

  assert.equal(response.status, 400);
});
