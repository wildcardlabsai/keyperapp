export const getCliSource = (supabaseUrl: string) => `#!/usr/bin/env node
/**
 * Keyper CLI — Securely access your encrypted API keys and .env files from the terminal.
 * 
 * Setup:
 *   1. Save this file as keyper-cli.js
 *   2. Set your API token: export KEYPER_TOKEN="kpr_..."
 *   3. Run: node keyper-cli.js help
 *
 * Commands:
 *   list              — List all keys (names & services)
 *   get <name>        — Decrypt and display a key
 *   copy <name>       — Decrypt and copy a key to clipboard
 *   env list          — List all projects
 *   env pull --project <name> --env <environment>   — Print .env to stdout
 *   env write --project <name> --env <environment>  — Write .env file to disk
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
const fs = require("fs");
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

async function apiFetch(path, method = "GET") {
  const res = await fetch(API_URL + "/" + path, {
    method,
    headers: { Authorization: "Bearer " + TOKEN },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Request failed: " + res.status);
  }
  return res.json();
}

async function fetchKeys() {
  return (await apiFetch("keys")).keys;
}

function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--") && i + 1 < args.length) {
      parsed[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }
  return parsed;
}

async function getCredentials() {
  const passphrase = await prompt("Vault passphrase: ", true);
  const salt = await prompt("User ID (from dashboard): ");
  return deriveKey(passphrase, salt);
}

async function main() {
  const [,, command, subcommand, ...args] = process.argv;

  if (!command || command === "help") {
    console.log(\`
  Keyper CLI

  Vault Commands:
    list              List all keys (name, service, environment)
    get <name>        Decrypt and display a specific key
    copy <name>       Decrypt and copy a key to clipboard

  Environment Commands:
    env list                                          List all projects
    env pull --project <name> --env <environment>     Print .env to stdout
    env write --project <name> --env <environment>    Write .env file
    env print --project <name> --env <environment>    Same as pull

  Options:
    --out <filename>  Output filename for env write (default: .env or .env.<env>)

  Examples:
    node keyper-cli.js list
    node keyper-cli.js env list
    node keyper-cli.js env pull --project "AI SaaS" --env local
    node keyper-cli.js env write --project "AI SaaS" --env production
    node keyper-cli.js env write --project "AI SaaS" --env staging --out .env.staging
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
    const name = [subcommand, ...args].join(" ");
    if (!name) { console.error("Usage: keyper " + command + " <key-name>"); process.exit(1); }

    const keys = await fetchKeys();
    const key = keys.find((k) => k.name.toLowerCase() === name.toLowerCase());
    if (!key) { console.error("Key not found: " + name); process.exit(1); }

    const derivedKey = await getCredentials();
    
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

  // ===== ENV COMMANDS =====
  if (command === "env") {
    if (!subcommand || subcommand === "help") {
      console.log(\`
  Environment Commands:
    env list                                          List all projects
    env pull --project <name> --env <environment>     Print .env to stdout
    env write --project <name> --env <environment>    Write .env file
\`);
      return;
    }

    if (subcommand === "list") {
      const { projects } = await apiFetch("projects");
      if (!projects || projects.length === 0) {
        console.log("No projects found. Create one in the dashboard.");
        return;
      }
      console.log("\\n  Your Projects:\\n");
      for (const p of projects) {
        const { environments } = await apiFetch("projects/" + p.id + "/environments");
        const envNames = environments ? environments.map((e) => e.name).join(", ") : "none";
        console.log(\`  • \${p.name} — Environments: \${envNames}\`);
      }
      console.log();
      return;
    }

    if (subcommand === "pull" || subcommand === "print" || subcommand === "write") {
      const opts = parseArgs(args);
      if (!opts.project || !opts.env) {
        console.error("Usage: keyper env " + subcommand + " --project <name> --env <environment>");
        process.exit(1);
      }

      // Find project by name
      const { projects } = await apiFetch("projects");
      const project = projects.find((p) => p.name.toLowerCase() === opts.project.toLowerCase());
      if (!project) { console.error("Project not found: " + opts.project); process.exit(1); }

      // Find environment
      const { environments } = await apiFetch("projects/" + project.id + "/environments");
      const env = environments.find((e) => e.name.toLowerCase() === opts.env.toLowerCase());
      if (!env) { console.error("Environment not found: " + opts.env); process.exit(1); }

      // Get variables
      const { variables } = await apiFetch("projects/" + project.id + "/environments/" + env.id + "/variables");
      if (!variables || variables.length === 0) {
        console.log("No variables in " + opts.project + "/" + opts.env);
        return;
      }

      // Decrypt
      const derivedKey = await getCredentials();
      const lines = [];
      for (const v of variables) {
        try {
          const plain = decrypt(v.ciphertext, v.iv, derivedKey);
          lines.push(v.key_name + "=" + plain);
        } catch {
          lines.push("# " + v.key_name + "=DECRYPTION_FAILED");
        }
      }

      const content = lines.join("\\n") + "\\n";

      if (subcommand === "write") {
        const filename = opts.out || (opts.env === "production" ? ".env.production" : opts.env === "staging" ? ".env.staging" : ".env");
        fs.writeFileSync(filename, content);
        console.log("✅ " + filename + " generated successfully (" + variables.length + " variables)");
      } else {
        console.log(content);
      }
      return;
    }

    console.error("Unknown env command: " + subcommand);
    process.exit(1);
  }

  console.error("Unknown command: " + command + ". Run 'keyper help' for usage.");
}

main().catch((err) => { console.error("❌ " + err.message); process.exit(1); });
`;
