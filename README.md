# GrokBot

A minimal chat bot web app powered by [xAI's Grok API](https://docs.x.ai/). It
ships with a clean chat UI, a small Express backend, and a **deterministic
offline mock mode** so it runs end-to-end without any credentials.

## Features

- Modern single-page chat UI (`public/`)
- Express JSON API: `POST /api/chat`, `GET /api/health`
- Talks to the real Grok model when `XAI_API_KEY` is set
- Falls back to a deterministic mock reply when no key is present (great for local dev, CI, and demos)
- Zero-config tests via the Node.js built-in test runner

## Requirements

- Node.js >= 20 (developed against Node 22)

## Getting started

```bash
npm install
npm start            # serves http://localhost:3000
```

Open http://localhost:3000 and start chatting. The badge in the top-right shows
whether you are in **Offline mock** or **Live Grok** mode.

### Using the real Grok API

```bash
cp .env.example .env
# edit .env and set XAI_API_KEY=...
export XAI_API_KEY=your-key-here
npm start
```

Optional environment variables:

| Variable       | Default                 | Purpose                          |
| -------------- | ----------------------- | -------------------------------- |
| `XAI_API_KEY`  | _(unset → mock mode)_   | xAI API key                      |
| `XAI_BASE_URL` | `https://api.x.ai/v1`   | API base URL                     |
| `GROK_MODEL`   | `grok-2-latest`         | Model name                       |
| `PORT`         | `3000`                  | HTTP port                        |

## Development

```bash
npm run dev    # start with file watching
npm test       # run the test suite
```

## Project layout

```
src/grok.js       Grok client wrapper + mock fallback
src/server.js     Express app (API + static hosting)
public/           Chat UI (HTML/CSS/JS)
test/             Node test-runner suites
```
