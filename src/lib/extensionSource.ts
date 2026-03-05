export const getManifestJson = () => JSON.stringify({
  manifest_version: 3,
  name: "Keyper - API Key Manager",
  version: "1.0.0",
  description: "Access your encrypted Keyper vault keys from the browser.",
  permissions: ["clipboardWrite", "storage", "contextMenus"],
  action: {
    default_popup: "popup.html",
    default_icon: { "16": "icon16.png", "48": "icon48.png", "128": "icon128.png" }
  },
  icons: { "16": "icon16.png", "48": "icon48.png", "128": "icon128.png" }
}, null, 2);

export const getPopupHtml = () => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 360px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0f; color: #e2e2e6; }
    .header { padding: 16px; border-bottom: 1px solid #1a1a2e; display: flex; align-items: center; gap: 10px; }
    .header h1 { font-size: 16px; font-weight: 600; }
    .header .lock { color: #6366f1; }
    .setup, .vault { padding: 16px; }
    .field { margin-bottom: 12px; }
    .field label { display: block; font-size: 12px; color: #9ca3af; margin-bottom: 4px; }
    .field input { width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #1a1a2e; background: #111118; color: #e2e2e6; font-size: 13px; outline: none; }
    .field input:focus { border-color: #6366f1; }
    .btn { width: 100%; padding: 10px; border-radius: 8px; border: none; font-size: 13px; font-weight: 500; cursor: pointer; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.9; }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; }
    .btn-outline { background: transparent; border: 1px solid #1a1a2e; color: #e2e2e6; margin-top: 8px; }
    .key-list { max-height: 300px; overflow-y: auto; }
    .key-item { padding: 10px 16px; border-bottom: 1px solid #1a1a2e; display: flex; justify-content: space-between; align-items: center; }
    .key-item:hover { background: #111118; }
    .key-name { font-size: 13px; font-weight: 500; }
    .key-service { font-size: 11px; color: #6b7280; }
    .copy-btn { padding: 4px 12px; border-radius: 6px; border: 1px solid #1a1a2e; background: transparent; color: #6366f1; font-size: 11px; cursor: pointer; }
    .copy-btn:hover { background: #6366f1; color: white; }
    .status { padding: 12px 16px; text-align: center; font-size: 12px; color: #6b7280; }
    .error { color: #ef4444; }
  </style>
</head>
<body>
  <div class="header">
    <span class="lock">🔐</span>
    <h1>Keyper</h1>
  </div>
  <div id="app"></div>
  <script src="popup.js"></script>
</body>
</html>`;

export const getPopupJs = (supabaseUrl: string) => `// Keyper Browser Extension — Popup Script

const API_URL = "${supabaseUrl}/functions/v1/vault-api";

const app = document.getElementById("app");

async function init() {
  const stored = await chrome.storage.local.get(["keyper_token", "keyper_user_id"]);
  if (stored.keyper_token) {
    showVault(stored.keyper_token, stored.keyper_user_id);
  } else {
    showSetup();
  }
}

function showSetup() {
  app.innerHTML = \`
    <div class="setup">
      <div class="field">
        <label>API Token</label>
        <input type="password" id="token" placeholder="kpr_..." />
      </div>
      <div class="field">
        <label>User ID (from dashboard)</label>
        <input type="text" id="userId" placeholder="Your user ID" />
      </div>
      <button class="btn btn-primary" id="saveBtn">Connect to Vault</button>
    </div>
  \`;
  document.getElementById("saveBtn").addEventListener("click", async () => {
    const token = document.getElementById("token").value.trim();
    const userId = document.getElementById("userId").value.trim();
    if (!token || !userId) return;
    await chrome.storage.local.set({ keyper_token: token, keyper_user_id: userId });
    showVault(token, userId);
  });
}

async function showVault(token, userId) {
  app.innerHTML = '<div class="status">Loading vault...</div>';
  
  try {
    const res = await fetch(API_URL + "/keys", {
      headers: { Authorization: "Bearer " + token }
    });
    if (!res.ok) throw new Error("Invalid token");
    const { keys } = await res.json();

    if (keys.length === 0) {
      app.innerHTML = '<div class="status">Your vault is empty.</div><div class="setup"><button class="btn btn-outline" id="disconnectBtn">Disconnect</button></div>';
      document.getElementById("disconnectBtn").addEventListener("click", disconnect);
      return;
    }

    let html = '<div class="key-list">';
    keys.forEach((k, i) => {
      html += \`<div class="key-item">
        <div><div class="key-name">\${esc(k.name)}</div><div class="key-service">\${esc(k.service)} · \${esc(k.environment)}</div></div>
        <button class="copy-btn" data-idx="\${i}">Copy</button>
      </div>\`;
    });
    html += '</div>';
    html += '<div class="setup"><button class="btn btn-outline" id="disconnectBtn">Disconnect</button></div>';
    app.innerHTML = html;

    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const idx = parseInt(btn.dataset.idx);
        const key = keys[idx];
        const passphrase = window.prompt("Enter vault passphrase:");
        if (!passphrase) return;
        try {
          const plain = await decryptKey(key.encrypted_key, key.iv, passphrase, userId);
          await navigator.clipboard.writeText(plain);
          btn.textContent = "✓ Copied";
          setTimeout(() => { btn.textContent = "Copy"; }, 2000);
        } catch {
          btn.textContent = "Failed";
          btn.classList.add("error");
          setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("error"); }, 2000);
        }
      });
    });

    document.getElementById("disconnectBtn").addEventListener("click", disconnect);
  } catch (err) {
    app.innerHTML = \`<div class="status error">\${esc(err.message)}</div><div class="setup"><button class="btn btn-outline" id="disconnectBtn">Disconnect</button></div>\`;
    document.getElementById("disconnectBtn").addEventListener("click", disconnect);
  }
}

async function disconnect() {
  await chrome.storage.local.remove(["keyper_token", "keyper_user_id"]);
  showSetup();
}

function esc(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

// --- Crypto (Web Crypto API, mirrors Keyper's implementation) ---

async function deriveKey(passphrase, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode(salt), iterations: 600000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

async function decryptKey(ciphertext, iv, passphrase, salt) {
  const key = await deriveKey(passphrase, salt);
  const rawCipher = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const rawIv = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: rawIv }, key, rawCipher);
  return new TextDecoder().decode(decrypted);
}

init();
`;
