/**
 * Grok client wrapper.
 *
 * When XAI_API_KEY is present, requests are sent to the xAI Grok API
 * (OpenAI-compatible chat completions endpoint). When it is absent, a
 * deterministic offline "mock" reply is returned instead, so the app and its
 * tests can run end-to-end without any credentials or network access.
 */

const DEFAULT_BASE_URL = "https://api.x.ai/v1";
const DEFAULT_MODEL = "grok-2-latest";

export function isMockMode(env = process.env) {
  return !env.XAI_API_KEY;
}

/**
 * Produce a deterministic mock reply. Kept intentionally simple and pure so it
 * is easy to assert on in tests and predictable in demos.
 */
export function mockReply(message) {
  const text = String(message ?? "").trim();
  if (!text) {
    return "Hey, I'm GrokBot (offline mock mode). Ask me something!";
  }
  const words = text.split(/\s+/).filter(Boolean).length;
  return (
    `GrokBot (offline mock) heard you say "${text}". ` +
    `That was ${words} word${words === 1 ? "" : "s"}. ` +
    `Set XAI_API_KEY to chat with the real Grok model.`
  );
}

/**
 * Get a chat reply for a single user message.
 * @param {string} message
 * @param {object} [options]
 * @param {NodeJS.ProcessEnv} [options.env]
 * @param {typeof fetch} [options.fetchImpl]
 * @returns {Promise<{reply: string, mode: "mock"|"live", model: string|null}>}
 */
export async function getReply(message, options = {}) {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;

  if (isMockMode(env)) {
    return { reply: mockReply(message), mode: "mock", model: null };
  }

  const baseUrl = env.XAI_BASE_URL || DEFAULT_BASE_URL;
  const model = env.GROK_MODEL || DEFAULT_MODEL;

  const response = await fetchImpl(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are GrokBot, a helpful and witty assistant." },
        { role: "user", content: String(message ?? "") },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`xAI API error ${response.status}: ${detail.slice(0, 500)}`);
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error("xAI API returned an empty response");
  }
  return { reply, mode: "live", model };
}
