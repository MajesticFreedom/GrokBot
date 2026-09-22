import { test } from "node:test";
import assert from "node:assert/strict";
import { getReply, isMockMode, mockReply } from "../src/grok.js";

test("isMockMode is true when XAI_API_KEY is missing", () => {
  assert.equal(isMockMode({}), true);
  assert.equal(isMockMode({ XAI_API_KEY: "" }), true);
  assert.equal(isMockMode({ XAI_API_KEY: "sk-test" }), false);
});

test("mockReply is deterministic and echoes the message", () => {
  const reply = mockReply("hello world");
  assert.match(reply, /hello world/);
  assert.match(reply, /2 words/);
  assert.equal(reply, mockReply("hello world"));
});

test("mockReply handles empty input gracefully", () => {
  assert.match(mockReply(""), /offline mock mode/);
});

test("getReply returns a mock result when no API key is set", async () => {
  const result = await getReply("ping", { env: {} });
  assert.equal(result.mode, "mock");
  assert.equal(result.model, null);
  assert.match(result.reply, /ping/);
});

test("getReply calls the xAI API when a key is present", async () => {
  let capturedUrl;
  let capturedInit;
  const fakeFetch = async (url, init) => {
    capturedUrl = url;
    capturedInit = init;
    return {
      ok: true,
      json: async () => ({ choices: [{ message: { content: "  live reply  " } }] }),
    };
  };

  const result = await getReply("hi", {
    env: { XAI_API_KEY: "sk-test", GROK_MODEL: "grok-2-latest" },
    fetchImpl: fakeFetch,
  });

  assert.equal(result.mode, "live");
  assert.equal(result.model, "grok-2-latest");
  assert.equal(result.reply, "live reply");
  assert.equal(capturedUrl, "https://api.x.ai/v1/chat/completions");
  assert.match(capturedInit.headers.Authorization, /Bearer sk-test/);
});

test("getReply throws on a non-ok API response", async () => {
  const fakeFetch = async () => ({
    ok: false,
    status: 401,
    text: async () => "unauthorized",
  });
  await assert.rejects(
    () => getReply("hi", { env: { XAI_API_KEY: "bad" }, fetchImpl: fakeFetch }),
    /xAI API error 401/
  );
});
