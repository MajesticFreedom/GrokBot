const http = require("node:http");

function createServer() {
  return http.createServer((req, res) => {
    const pathname = (req.url || "/").split("?")[0];
    if (req.method === "GET" && pathname === "/status") {
      const body = JSON.stringify({
        ok: true,
        service: "GrokBot",
        time: new Date().toISOString(),
      });
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(body),
      });
      res.end(body);
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false }));
  });
}

module.exports = { createServer };

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, () => {
    console.log(`GrokBot listening on http://localhost:${port}`);
  });
}
