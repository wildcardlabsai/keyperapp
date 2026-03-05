export const getManifestJson = () => JSON.stringify({
  manifest_version: 3,
  name: "Keyper - API Key Manager",
  version: "1.1.0",
  description: "Access your encrypted Keyper vault keys and generate .env files from the browser.",
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
    body { width: 380px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0f; color: #e2e2e6; }
    .header { padding: 16px; border-bottom: 1px solid #1a1a2e; display: flex; align-items: center; gap: 10px; }
    .header h1 { font-size: 16px; font-weight: 600; flex: 1; }
    .header .lock { color: #6366f1; }
    .tabs { display: flex; border-bottom: 1px solid #1a1a2e; }
    .tab { flex: 1; padding: 10px; text-align: center; font-size: 12px; font-weight: 500; cursor: pointer; color: #6b7280; border-bottom: 2px solid transparent; transition: all 0.2s; }
    .tab.active { color: #6366f1; border-bottom-color: #6366f1; }
    .tab:hover { color: #e2e2e6; }
    .setup, .vault, .env-gen { padding: 16px; }
    .field { margin-bottom: 12px; }
    .field label { display: block; font-size: 12px; color: #9ca3af; margin-bottom: 4px; }
    .field input, .field select { width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #1a1a2e; background: #111118; color: #e2e2e6; font-size: 13px; outline: none; }
    .field input:focus, .field select:focus { border-color: #6366f1; }
    .btn { width: 100%; padding: 10px; border-radius: 8px; border: none; font-size: 13px; font-weight: 500; cursor: pointer; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.9; }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; }
    .btn-outline { background: transparent; border: 1px solid #1a1a2e; color: #e2e2e6; margin-top: 8px; }
    .btn-sm { padding: 6px 12px; font-size: 11px; width: auto; display: inline-flex; margin-right: 6px; border-radius: 6px; }
    .key-list, .env-output { max-height: 300px; overflow-y: auto; }
    .key-item { padding: 10px 16px; border-bottom: 1px solid #1a1a2e; display: flex; justify-content: space-between; align-items: center; }
    .key-item:hover { background: #111118; }
    .key-name { font-size: 13px; font-weight: 500; }
    .key-service { font-size: 11px; color: #6b7280; }
    .copy-btn { padding: 4px 12px; border-radius: 6px; border: 1px solid #1a1a2e; background: transparent; color: #6366f1; font-size: 11px; cursor: pointer; }
    .copy-btn:hover { background: #6366f1; color: white; }
    .status { padding: 12px 16px; text-align: center; font-size: 12px; color: #6b7280; }
    .error { color: #ef4444; }
    .env-block { background: #111118; border: 1px solid #1a1a2e; border-radius: 8px; padding: 12px; margin: 12px 0; font-family: monospace; font-size: 11px; color: #9ca3af; white-space: pre-wrap; word-break: break-all; max-height: 200px; overflow-y: auto; }
    .actions { padding: 0 16px 16px; display: flex; gap: 6px; }
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

export const getPopupJs = (supabaseUrl: string) => `// Keyper Browser Extension — Popup Script v1.1

const API_URL = "${supabaseUrl}/functions/v1/vault-api";
const app = document.getElementById("app");
let currentTab = "keys";

async function init() {
  const stored = await chrome.storage.local.get(["keyper_token", "keyper_user_id"]);
  if (stored.keyper_token) {
    showMain(stored.keyper_token, stored.keyper_user_id);
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
    showMain(token, userId);
  });
}

async function showMain(token, userId) {
  app.innerHTML = \`
    <div class="tabs">
      <div class="tab \${currentTab === 'keys' ? 'active' : ''}" data-tab="keys">Vault Keys</div>
      <div class="tab \${currentTab === 'env' ? 'active' : ''}" data-tab="env">Generate .env</div>
    </div>
    <div id="content"><div class="status">Loading...</div></div>
    <div class="setup"><button class="btn btn-outline" id="disconnectBtn">Disconnect</button></div>
  \`;
  document.querySelectorAll(".tab").forEach(t => {
    t.addEventListener("click", () => {
      currentTab = t.dataset.tab;
      showMain(token, userId);
    });
  });
  document.getElementById("disconnectBtn").addEventListener("click", disconnect);

  if (currentTab === "keys") {
    await showKeys(token, userId);
  } else {
    await showEnvGenerator(token, userId);
  }
}

async function showKeys(token, userId) {
  const content = document.getElementById("content");
  try {
    const res = await fetch(API_URL + "/keys", { headers: { Authorization: "Bearer " + token } });
    if (!res.ok) throw new Error("Invalid token");
    const { keys } = await res.json();
    if (keys.length === 0) {
      content.innerHTML = '<div class="status">Your vault is empty.</div>';
      return;
    }
    let html = '<div class="key-list">';
    keys.forEach((k, i) => {
      html += \`<div class="key-item"><div><div class="key-name">\${esc(k.name)}</div><div class="key-service">\${esc(k.service)} · \${esc(k.environment)}</div></div><button class="copy-btn" data-idx="\${i}">Copy</button></div>\`;
    });
    html += '</div>';
    content.innerHTML = html;
    document.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const key = keys[parseInt(btn.dataset.idx)];
        const passphrase = window.prompt("Enter vault passphrase:");
        if (!passphrase) return;
        try {
          const plain = await decryptKey(key.encrypted_key, key.iv, passphrase, userId);
          await navigator.clipboard.writeText(plain);
          btn.textContent = "✓ Copied";
          setTimeout(() => { btn.textContent = "Copy"; }, 2000);
        } catch {
          btn.textContent = "Failed";
          setTimeout(() => { btn.textContent = "Copy"; }, 2000);
        }
      });
    });
  } catch (err) {
    content.innerHTML = '<div class="status error">' + esc(err.message) + '</div>';
  }
}

async function showEnvGenerator(token, userId) {
  const content = document.getElementById("content");
  try {
    const res = await fetch(API_URL + "/projects", { headers: { Authorization: "Bearer " + token } });
    if (!res.ok) throw new Error("Failed to load projects");
    const { projects } = await res.json();
    if (!projects || projects.length === 0) {
      content.innerHTML = '<div class="status">No projects yet. Create one in the dashboard.</div>';
      return;
    }
    let html = '<div class="env-gen">';
    html += '<div class="field"><label>Project</label><select id="envProject"><option value="">Select project</option>';
    projects.forEach(p => { html += '<option value="' + p.id + '">' + esc(p.name) + '</option>'; });
    html += '</select></div>';
    html += '<div class="field"><label>Environment</label><select id="envEnv" disabled><option value="">Select environment</option></select></div>';
    html += '<button class="btn btn-primary" id="genBtn" disabled>Generate .env</button>';
    html += '<div id="envResult"></div></div>';
    content.innerHTML = html;

    const projectSelect = document.getElementById("envProject");
    const envSelect = document.getElementById("envEnv");
    const genBtn = document.getElementById("genBtn");

    projectSelect.addEventListener("change", async () => {
      const pid = projectSelect.value;
      envSelect.innerHTML = '<option value="">Select environment</option>';
      envSelect.disabled = true;
      genBtn.disabled = true;
      if (!pid) return;
      const envRes = await fetch(API_URL + "/projects/" + pid + "/environments", { headers: { Authorization: "Bearer " + token } });
      const { environments } = await envRes.json();
      if (environments) {
        environments.forEach(e => {
          const opt = document.createElement("option");
          opt.value = e.id;
          opt.textContent = e.name;
          envSelect.appendChild(opt);
        });
        envSelect.disabled = false;
      }
    });

    envSelect.addEventListener("change", () => { genBtn.disabled = !envSelect.value; });

    genBtn.addEventListener("click", async () => {
      const envId = envSelect.value;
      if (!envId) return;
      genBtn.textContent = "Generating...";
      genBtn.disabled = true;
      try {
        const pid = projectSelect.value;
        const varRes = await fetch(API_URL + "/projects/" + pid + "/environments/" + envId + "/variables", { headers: { Authorization: "Bearer " + token } });
        const { variables } = await varRes.json();
        if (!variables || variables.length === 0) {
          document.getElementById("envResult").innerHTML = '<div class="status">No variables in this environment.</div>';
          return;
        }
        const passphrase = window.prompt("Enter vault passphrase:");
        if (!passphrase) { genBtn.textContent = "Generate .env"; genBtn.disabled = false; return; }
        let envContent = "";
        for (const v of variables) {
          try {
            const plain = await decryptKey(v.ciphertext, v.iv, passphrase, userId);
            envContent += v.key_name + "=" + plain + "\\n";
          } catch {
            envContent += "# " + v.key_name + "=DECRYPTION_FAILED\\n";
          }
        }
        document.getElementById("envResult").innerHTML = '<div class="env-block">' + esc(envContent) + '</div>';
        document.getElementById("envResult").innerHTML += '<div class="actions"><button class="btn btn-sm btn-outline" id="copyEnv">Copy</button><button class="btn btn-sm btn-outline" id="dlEnv">Download</button></div>';
        document.getElementById("copyEnv").addEventListener("click", async () => {
          await navigator.clipboard.writeText(envContent);
          document.getElementById("copyEnv").textContent = "✓ Copied";
        });
        document.getElementById("dlEnv").addEventListener("click", () => {
          const blob = new Blob([envContent], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          chrome.downloads?.download({ url, filename: ".env" });
        });
      } catch (err) {
        document.getElementById("envResult").innerHTML = '<div class="status error">' + esc(err.message) + '</div>';
      } finally {
        genBtn.textContent = "Generate .env";
        genBtn.disabled = false;
      }
    });
  } catch (err) {
    content.innerHTML = '<div class="status error">' + esc(err.message) + '</div>';
  }
}

async function disconnect() {
  await chrome.storage.local.remove(["keyper_token", "keyper_user_id"]);
  currentTab = "keys";
  showSetup();
}

function esc(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

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
