# GrokBot

GrokBot is a small Node.js HTTP service that reports whether it is up.

## Run

```bash
npm install
npm start
npm test
```

`npm start` listens on port 3000.

## GET /status

```bash
curl http://localhost:3000/status
```

The response is JSON:

```json
{
  "ok": true,
  "service": "GrokBot",
  "time": "2026-09-22T14:13:00.000Z"
}
```

`ok` is a boolean, `service` is `"GrokBot"`, and `time` is an ISO timestamp.
