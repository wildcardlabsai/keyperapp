

## Plan: Developer Tools — API Endpoint, CLI & Browser Extension

### Overview

Build a complete developer tools integration for Keyper: a secure API endpoint for programmatic access to encrypted vault keys, a Node.js CLI tool, and a Chrome browser extension. Since Lovable builds web apps, the CLI and extension code will be generated and presented on a new **Developer Tools** page in the dashboard where users can download/copy the code.

### Important Constraint

The CLI and browser extension are external tools that run outside the web app. Lovable will:
1. Build the **backend API** (edge function) that authenticates requests and returns encrypted keys
2. Create a **Developer Tools tab** in the dashboard with setup instructions, downloadable code, and an API token management system
3. Generate the **CLI source code** and **extension source code** as copyable/downloadable artifacts

Users will still need to decrypt keys locally using their vault passphrase (maintaining zero-knowledge architecture).

---

### 1. Database Changes

**New table: `api_tokens`** — personal access tokens for CLI/extension authentication

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| name | text | e.g. "My CLI", "Work Extension" |
| token_hash | text | SHA-256 hash of the token (never store plaintext) |
| last_used_at | timestamp | nullable |
| expires_at | timestamp | nullable |
| created_at | timestamp | default now() |

RLS: users can only CRUD their own tokens.

---

### 2. Edge Function: `vault-api`

A single edge function at `supabase/functions/vault-api/index.ts` that handles:

- **`POST /generate-token`** — authenticated via Supabase JWT, creates a new API token, returns it once (plaintext), stores only the hash
- **`GET /keys`** — authenticated via API token (Bearer header), returns the user's encrypted keys (ciphertext + IV)
- **`GET /keys/:id`** — returns a single encrypted key by ID

The response contains encrypted data only. Decryption happens client-side (CLI/extension) using the user's vault passphrase, preserving zero-knowledge.

---

### 3. Dashboard: Developer Tools Tab

New tab in the sidebar with:
- **API Tokens section** — create, view, revoke personal access tokens
- **CLI Setup** — copyable install command and usage instructions
- **Browser Extension** — download link and setup guide
- API documentation showing endpoints and response format

---

### 4. CLI Tool (generated code)

A self-contained Node.js script (`keyper-cli.js`) users copy from the dashboard:
- Authenticates with API token
- Fetches encrypted keys from the vault-api endpoint
- Prompts for vault passphrase locally
- Decrypts and displays/copies keys
- Commands: `keyper list`, `keyper get <name>`, `keyper copy <name>`

---

### 5. Browser Extension (generated code)

A Chrome extension (manifest v3) with:
- Popup UI to enter API token and vault passphrase (stored in extension local storage)
- Lists keys from the vault
- "Copy" button to copy decrypted key to clipboard
- Context menu to autofill key values into form fields

---

### Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `supabase/functions/vault-api/index.ts` | API endpoint |
| Create | `src/components/dashboard/DeveloperToolsTab.tsx` | Dashboard tab UI |
| Create | `src/lib/cliSource.ts` | CLI source code as string constant |
| Create | `src/lib/extensionSource.ts` | Extension source files as string constants |
| Modify | `src/pages/Dashboard.tsx` | Add "Developer Tools" tab to sidebar |
| Migration | `api_tokens` table + RLS | Database schema |

### Implementation Order

1. Database migration for `api_tokens` table
2. `vault-api` edge function
3. `DeveloperToolsTab` component with token management
4. CLI and extension source code generation
5. Wire into dashboard sidebar

