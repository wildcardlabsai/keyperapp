export type KBArticle = {
  id: string;
  title: string;
  category: string;
  body: string;
};

export const kbArticles: KBArticle[] = [
  // Getting Started
  {
    id: "create-vault",
    title: "How to create your vault",
    category: "Getting Started",
    body: `When you first sign in to Keyper, you'll be prompted to create a vault passphrase. This passphrase is used to derive a cryptographic key that encrypts all your API keys locally before they're stored.\n\n**Steps:**\n1. Sign up or log in to Keyper\n2. You'll see the "Create your vault passphrase" screen\n3. Enter a strong passphrase (minimum 6 characters)\n4. Click "Create vault"\n\n**Important:** Your vault passphrase is never sent to our servers. It's used entirely on your device to encrypt and decrypt your data. If you lose it, your keys cannot be recovered.`,
  },
  {
    id: "add-first-key",
    title: "Adding your first API key",
    category: "Getting Started",
    body: `Once your vault is created and unlocked, adding an API key is straightforward.\n\n**Steps:**\n1. Navigate to the "API Keys" tab in your dashboard\n2. Click the "+ Add key" button\n3. Fill in the details:\n   - **Name**: A friendly name (e.g., "OpenAI Production")\n   - **Service**: Select from common providers or choose "Other"\n   - **Environment**: Production, Staging, or Development\n   - **API Key**: Paste your actual key\n   - **Tags**: Optional comma-separated tags for organisation\n   - **Notes**: Optional notes for context\n4. Click "Save key"\n\nYour key is encrypted with your vault passphrase before being stored. The plaintext never leaves your browser.`,
  },
  {
    id: "vault-passphrase",
    title: "Understanding your vault passphrase",
    category: "Getting Started",
    body: `Your vault passphrase is the single most important piece of information in Keyper. Here's what you need to know:\n\n- **It's not your login password.** Your Keyper account password and vault passphrase are separate. This adds an extra layer of security.\n- **It derives your encryption key.** Using PBKDF2 with 100,000 iterations, your passphrase is turned into an AES-256-GCM encryption key.\n- **It never leaves your device.** We use zero-knowledge architecture — Keyper's servers never see your passphrase or your unencrypted keys.\n- **It cannot be recovered.** If you forget it, there is no reset mechanism. Your encrypted keys will be permanently inaccessible.\n\n**Tips for a strong passphrase:**\n- Use at least 12+ characters\n- Mix words, numbers, and symbols\n- Don't reuse passwords from other services\n- Consider using a sentence you can remember`,
  },

  // Security
  {
    id: "encryption",
    title: "How Keyper encrypts your data",
    category: "Security",
    body: `Keyper uses industry-standard encryption to protect your API keys.\n\n**Encryption algorithm:** AES-256-GCM (Galois/Counter Mode)\n**Key derivation:** PBKDF2 with SHA-256 and 100,000 iterations\n**Implementation:** Web Crypto API (browser-native, no third-party libraries)\n\n**How it works:**\n1. When you create your vault, your passphrase is combined with your user ID as a salt\n2. PBKDF2 derives a 256-bit encryption key\n3. Each API key is encrypted individually with a unique initialisation vector (IV)\n4. Only the ciphertext and IV are sent to the server\n5. Decryption happens entirely in your browser when you reveal a key\n\nThis means even if our database were compromised, attackers would only find encrypted blobs that are computationally infeasible to crack without your passphrase.`,
  },
  {
    id: "zero-knowledge",
    title: "What is zero-knowledge encryption?",
    category: "Security",
    body: `Zero-knowledge encryption means that the service provider (Keyper) has zero knowledge of your actual data.\n\n**What this means in practice:**\n- Keyper's servers store only encrypted ciphertext\n- Your passphrase never leaves your browser\n- We cannot decrypt your keys — even if compelled by a court order\n- Our team cannot access your API keys under any circumstance\n- There is no "master key" or backdoor\n\n**The trade-off:**\nThe security benefit comes with a responsibility: if you lose your passphrase, we genuinely cannot help you recover your data. This is by design, not a limitation.\n\n**Why it matters for API keys:**\nAPI keys grant access to paid services and sensitive systems. Zero-knowledge encryption ensures that a breach of Keyper's infrastructure would not compromise your keys.`,
  },
  {
    id: "two-factor-auth",
    title: "Two-factor authentication setup",
    category: "Security",
    body: `Keyper supports TOTP-based two-factor authentication (2FA) for an extra layer of login security.\n\n**Setting up 2FA:**\n1. Go to Dashboard → Settings → Security\n2. Click "Enable two-factor authentication"\n3. Scan the QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)\n4. Enter the 6-digit code from your app to verify\n5. 2FA is now active\n\n**Logging in with 2FA:**\nAfter entering your email and password, you'll be asked for a 6-digit code from your authenticator app. Only after entering a valid code will you be granted access.\n\n**Disabling 2FA:**\nGo to Dashboard → Settings → Security and click "Disable 2FA". You'll need to be logged in and verified to do this.`,
  },

  // Managing Keys
  {
    id: "organising-keys",
    title: "Organising keys with tags and environments",
    category: "Managing Keys",
    body: `Keyper gives you several ways to organise your API keys.\n\n**Tags:**\n- Add comma-separated tags when creating or editing a key\n- Tags appear as small badges on each key row\n- Use tags for projects, teams, or purposes (e.g., "backend, payments, v2")\n\n**Environments:**\n- Each key can be tagged as Production, Staging, or Development\n- Filter by environment using the dropdown in the keys view\n\n**Services:**\n- Assign a service provider (OpenAI, Google, AWS, Stripe, etc.)\n- Filter by service to quickly find related keys\n\n**Search:**\n- The search bar filters by key name, service, and tags in real-time`,
  },
  {
    id: "import-export",
    title: "Importing and exporting your vault",
    category: "Managing Keys",
    body: `Keyper supports encrypted backup and restore of your vault.\n\n**Exporting:**\n1. Go to the Security tab in your dashboard\n2. Click "Export backup"\n3. A JSON file will be downloaded containing your encrypted keys\n4. Store this file securely — it contains your encrypted data\n\n**Importing:**\n1. Go to the Security tab\n2. Click "Import backup"\n3. Select a previously exported JSON file\n4. Keys from the backup will be added to your vault\n\n**Important notes:**\n- Exported files contain encrypted ciphertext, not plaintext keys\n- You need the same vault passphrase to decrypt imported keys\n- Importing doesn't overwrite existing keys — it adds to them\n- Always keep backups in a secure location`,
  },
  {
    id: "key-limits",
    title: "Understanding key limits (Free vs Pro)",
    category: "Managing Keys",
    body: `Keyper offers two plans:\n\n**Free Plan:**\n- Store up to 10 API keys\n- Full encryption and zero-knowledge security\n- Activity log\n- Export/import functionality\n\n**Pro Plan (£4.99/month):**\n- Unlimited key storage\n- Priority support\n- Advanced activity logging\n- All Free features included\n\nWhen you reach the 10-key limit on the Free plan, you'll be prompted to upgrade when trying to add a new key.`,
  },

  // Account & Billing
  {
    id: "upgrading",
    title: "Upgrading to Pro",
    category: "Account & Billing",
    body: `Upgrading to Keyper Pro removes the 10-key limit and unlocks priority support.\n\n**How to upgrade:**\n1. Go to Dashboard → Billing\n2. Click "Upgrade to Pro"\n3. Complete the payment process\n\n**What changes:**\n- Your key limit is removed immediately\n- You gain access to priority support\n- All your existing keys and settings are preserved\n\n**Pricing:** £4.99/month\n\n*Note: Billing integration is currently in demo mode. In production, this will connect to a payment processor.*`,
  },
  {
    id: "change-password",
    title: "Changing your password",
    category: "Account & Billing",
    body: `You can change your account password at any time.\n\n**Steps:**\n1. Go to Dashboard → Settings → Security\n2. Click "Change password"\n3. Enter a new password (minimum 8 characters)\n4. Click confirm\n\n**Important:** Changing your password does NOT change your vault passphrase. These are separate credentials:\n- **Account password**: Used to log in to Keyper\n- **Vault passphrase**: Used to encrypt/decrypt your API keys\n\nIf you've forgotten your account password, use the "Forgot password" link on the login page.`,
  },
  {
    id: "delete-account",
    title: "Deleting your account",
    category: "Account & Billing",
    body: `If you wish to permanently delete your Keyper account:\n\n1. Go to Dashboard → Settings\n2. Scroll to the "Danger zone" section\n3. Click "Delete account"\n4. Confirm the deletion\n\n**What happens when you delete your account:**\n- All your encrypted API keys are permanently deleted\n- Your profile and activity log are removed\n- Your authentication credentials are purged\n- This action cannot be undone\n\n**Before deleting:**\n- Export a backup of your keys if you might need them\n- Make sure you've rotated or regenerated any keys stored in Keyper in their respective services`,
  },

  // Troubleshooting
  {
    id: "forgot-passphrase",
    title: "I forgot my vault passphrase",
    category: "Troubleshooting",
    body: `Unfortunately, if you've forgotten your vault passphrase, **your encrypted keys cannot be recovered**. This is an intentional security feature of zero-knowledge encryption.\n\n**Why we can't help:**\n- Your passphrase is never stored on our servers\n- There is no master key or recovery mechanism\n- We cannot decrypt your data under any circumstances\n\n**What you can do:**\n1. If you have a backup of your keys elsewhere, you can create a new vault with a new passphrase and re-add them\n2. Rotate all API keys in their respective services (OpenAI, AWS, etc.) and add the new keys to a fresh vault\n3. If you exported an encrypted backup, it uses the same passphrase — it won't help if you've forgotten it\n\n**Prevention:**\n- Store your vault passphrase in a separate password manager\n- Write it down and keep it in a physically secure location\n- Use a memorable but strong phrase`,
  },
  {
    id: "key-wont-decrypt",
    title: "My key won't decrypt",
    category: "Troubleshooting",
    body: `If you're seeing "Decryption failed" when trying to reveal a key, here are common causes:\n\n**1. Wrong vault passphrase**\nIf you unlocked your vault with a different passphrase than the one used when the key was stored, decryption will fail. Lock your vault and try again with the correct passphrase.\n\n**2. Imported keys from a different vault**\nKeys encrypted with a different passphrase won't decrypt with your current one. You'd need the original passphrase.\n\n**3. Corrupted data**\nIn rare cases, data corruption can cause decryption failures. If you have an exported backup, try restoring from it.\n\n**Steps to troubleshoot:**\n1. Lock and re-unlock your vault, ensuring you use the correct passphrase\n2. Try revealing a different key to see if the issue is isolated\n3. If no keys decrypt, you may be using the wrong passphrase`,
  },
  {
    id: "login-issues",
    title: "Login issues and account recovery",
    category: "Troubleshooting",
    body: `Having trouble logging in? Here are solutions for common issues:\n\n**Forgot your password?**\n1. Go to the login page\n2. Click "Forgot password?"\n3. Enter your email address\n4. Check your inbox for a reset link\n5. Set a new password\n\n**Not receiving the reset email?**\n- Check your spam/junk folder\n- Make sure you're using the email you signed up with\n- Wait a few minutes — emails can be delayed\n- Try requesting another reset\n\n**Account locked?**\nIf you've made too many failed login attempts, your account may be temporarily locked. Wait 15 minutes and try again.\n\n**Two-factor authentication issues?**\n- Make sure your authenticator app's time is synced correctly\n- If you've lost access to your authenticator, contact support\n\n**Still stuck?**\nSubmit a support ticket from the support page and we'll help you get back in.`,
  },
];

export const kbCategories = [...new Set(kbArticles.map((a) => a.category))];
