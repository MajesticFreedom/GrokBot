const messagesEl = document.getElementById("messages");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("input");
const sendEl = document.getElementById("send");
const badgeEl = document.getElementById("mode-badge");

function addMessage(text, who, { pending = false } = {}) {
  const wrap = document.createElement("div");
  wrap.className = `message ${who}${pending ? " pending" : ""}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  wrap.appendChild(bubble);
  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return wrap;
}

async function refreshMode() {
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    badgeEl.textContent = data.mode === "live" ? "Live Grok" : "Offline mock";
    badgeEl.classList.add(data.mode === "live" ? "live" : "mock");
  } catch {
    badgeEl.textContent = "offline";
  }
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = inputEl.value.trim();
  if (!message) return;

  addMessage(message, "user");
  inputEl.value = "";
  inputEl.disabled = true;
  sendEl.disabled = true;

  const pending = addMessage("GrokBot is thinking…", "bot", { pending: true });

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    pending.remove();
    if (res.ok) {
      addMessage(data.reply, "bot");
    } else {
      addMessage(`Error: ${data.error || "something went wrong"}`, "bot");
    }
  } catch (err) {
    pending.remove();
    addMessage(`Network error: ${err.message}`, "bot");
  } finally {
    inputEl.disabled = false;
    sendEl.disabled = false;
    inputEl.focus();
  }
});

refreshMode();
