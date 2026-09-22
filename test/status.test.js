const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("../src/server.js");

let server;
let baseUrl;

before(async () => {
  server = createServer();
  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(() => {
  server?.close();
});

test("GET /status returns the service status payload", async () => {
  const beforeRequest = Date.now();
  const res = await fetch(`${baseUrl}/status`);
  const afterRequest = Date.now();

  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type") || "", /application\/json/);

  const data = await res.json();
  assert.deepEqual(
    { ok: data.ok, service: data.service },
    { ok: true, service: "GrokBot" },
  );
  assert.equal(typeof data.time, "string");
  const parsed = Date.parse(data.time);
  assert.equal(Number.isNaN(parsed), false);
  assert.equal(new Date(data.time).toISOString(), data.time);
  assert.ok(parsed >= beforeRequest - 1000);
  assert.ok(parsed <= afterRequest + 1000);
});
