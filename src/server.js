import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getReply, isMockMode } from "./grok.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", mode: isMockMode() ? "mock" : "live" });
  });

  app.post("/api/chat", async (req, res) => {
    const message = req.body?.message;
    if (typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "Field 'message' is required and must be a non-empty string." });
      return;
    }
    try {
      const result = await getReply(message);
      res.json(result);
    } catch (err) {
      res.status(502).json({ error: err.message });
    }
  });

  return app;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const port = Number(process.env.PORT) || 3000;
  const app = createApp();
  app.listen(port, () => {
    const mode = isMockMode() ? "offline mock" : "live xAI Grok";
    console.log(`GrokBot listening on http://localhost:${port} (${mode} mode)`);
  });
}
