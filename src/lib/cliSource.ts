export const getCliSource = (supabaseUrl: string) => `#!/usr/bin/env node
/**
 * Keyper CLI — Securely access your encrypted API keys from the terminal.
 * 
 * Setup:
 *   1. Save this file as keyper-cli.js
 *   2. npm install -g node-fetch (Node 18+ has native fetch)
 *   3. Set your API token: export KEYPER_TOKEN="kpr_..."
 *   4. Run: node keyper-cli.js list
 *
 * Commands:
 *   list              — List all keys (names & services)
 *   get <name>        — Decrypt and display a key
 *   copy <name>       — Decrypt and copy a key to clipboard
 *
 * Your vault passphrase is prompted locally and never transmitted.
 */

const API_URL = "${supabaseUrl}/functions/v1/vault-api";
const TOKEN = process.env.KEYPER_TOKEN;

if (!TOKEN) {
  console.error("❌ Set KEYPER_TOKEN environment variable first.");
  console.error("   export KEYPER_TOKEN=\\"kpr_your_token_here\\"");
  process.exit(1);
}

const readline = require("readline");
const crypto = require("crypto");
const { execSync } = require("child_process");

function prompt(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (hidden) {
      process.stdout.write(question);
      const stdin = process.stdin;
      stdin.setRawMode?.(true);
      let input = "";
      stdin.resume();
      stdin.setEncoding("utf8");
      const onData = (char) => {
        if (char === "\\n" || char === "\\r" || char === "\\u0004") {
          stdin.setRawMode?.(false);
          stdin.removeListener("data", onData);
          stdin.pause();
          process.stdout.write("\\n");
          rl.close();
          resolve(input);
        } else if (char === "\\u0003") {
          process.exit();
        } else if (char === "\\u007F" || char === "\\b") {
          input = input.slice(0, -1);
        } else {
          input += char;
          process.stdout.write("•");
        }
      };
      stdin.on("data", onData);
    } else {
      rl.question(question, (answer) => { rl.close(); resolve(answer); });
    }
  });
}

async function deriveKey(passphrase, salt) {
  const keyMaterial = crypto.createHash("sha256").update(passphrase).digest();
  const derivedKey = crypto.pbkdf2Sync(
    keyMaterial, Buffer.from(salt, "utf8"), 600000, 32, "sha512"
  );
  return derivedKey;
}

function decrypt(ciphertext, iv, key) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm", key,
    Buffer.from(iv, "base64")
  );
  const raw = Buffer.from(ciphertext, "base64");
  const authTag = raw.slice(raw.length - 16);
  const encrypted = raw.slice(0, raw.length - 16);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, undefined, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

async function fetchKeys() {
  const res = await fetch(API_URL + "/keys", {
    headers: { Authorization: "Bearer " + TOKEN },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch keys: " + res.status);
  }
  return (await res.json()).keys;
}

async function main() {
  const [,, command, ...args] = process.argv;

  if (!command || command === "help") {
    console.log(\`
  Keyper CLI

  Commands:
    list              List all keys (name, service, environment)
    get <name>        Decrypt and display a specific key
    copy <name>       Decrypt and copy a key to clipboard
    help              Show this help message
\`);
    return;
  }

  if (command === "list") {
    const keys = await fetchKeys();
    if (keys.length === 0) {
      console.log("Your vault is empty.");
      return;
    }
    console.log("\\n  Your Vault Keys:\\n");
    keys.forEach((k, i) => {
      const exp = k.expires_at ? new Date(k.expires_at).toLocaleDateString() : "Never";
      console.log(\`  \${i + 1}. \${k.name} [\${k.service}] (\${k.environment}) — Expires: \${exp}\`);
    });
    console.log();
    return;
  }

  if (command === "get" || command === "copy") {
    const name = args.join(" ");
    if (!name) { console.error("Usage: keyper " + command + " <key-name>"); process.exit(1); }

    const keys = await fetchKeys();
    const key = keys.find((k) => k.name.toLowerCase() === name.toLowerCase());
    if (!key) { console.error("Key not found: " + name); process.exit(1); }

    const passphrase = await prompt("Vault passphrase: ", true);
    
    // We need the user_id as salt — derive from the token's associated user
    // The salt is the user's ID which they need to provide
    const salt = await prompt("User ID (from dashboard): ");
    
    const derivedKey = await deriveKey(passphrase, salt);
    
    try {
      const plaintext = decrypt(key.encrypted_key, key.iv, derivedKey);
      if (command === "copy") {
        try {
          const platform = process.platform;
          if (platform === "darwin") execSync("pbcopy", { input: plaintext });
          else if (platform === "linux") execSync("xclip -selection clipboard", { input: plaintext });
          else if (platform === "win32") execSync("clip", { input: plaintext });
          console.log("✅ Key copied to clipboard.");
        } catch {
          console.log("Clipboard not available. Here's your key:");
          console.log(plaintext);
        }
      } else {
        console.log("\\n  " + key.name + ": " + plaintext + "\\n");
      }
    } catch {
      console.error("❌ Decryption failed. Wrong passphrase?");
      process.exit(1);
    }
    return;
  }

  console.error("Unknown command: " + command + ". Run 'keyper help' for usage.");
}

main().catch((err) => { console.error("❌ " + err.message); process.exit(1); });
`;
