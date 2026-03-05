export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  description: string;
  tags: ("feature" | "fix" | "improvement" | "security")[];
};

export const changelogEntries: ChangelogEntry[] = [
  {
    version: "1.6.2",
    date: "2026-03-05",
    title: "Chrome Extension: Environment Generator",
    description: "The Keyper Chrome extension now includes a dedicated Environment Generator panel. Select a project and environment, then generate, copy, or download .env files directly from your browser — no dashboard needed.",
    tags: ["feature"],
  },
  {
    version: "1.6.1",
    date: "2026-03-05",
    title: "CLI: Environment Commands",
    description: "New CLI commands for managing environment variables: keyper env list, keyper env pull, keyper env print, and keyper env write. Pull .env files for any project and environment straight from your terminal.",
    tags: ["feature"],
  },
  {
    version: "1.6.0",
    date: "2026-03-05",
    title: "Environment Generator (.env Generator)",
    description: "Organize secrets into Projects, Environments, and Variables. Generate ready-to-use .env files, Docker Compose snippets, and GitHub Actions configs — all encrypted end-to-end.",
    tags: ["feature", "security"],
  },
  {
    version: "1.5.0",
    date: "2026-03-03",
    title: "Team Vaults & Onboarding Tour",
    description: "Share API keys securely with your team using shared vaults with role-based access. New users now get a guided onboarding tour highlighting key features. Empty states throughout the dashboard have been redesigned with helpful illustrations and CTAs.",
    tags: ["feature"],
  },
  {
    version: "1.4.0",
    date: "2026-03-03",
    title: "API Key Expiry & Rotation Alerts",
    description: "Set optional expiration dates on your API keys and receive visual warnings as they approach expiry. Keys are color-coded green, yellow, or red based on remaining time. Never forget to rotate a key again.",
    tags: ["feature", "security"],
  },
  {
    version: "1.3.0",
    date: "2026-02-20",
    title: "Changelog & What's New",
    description: "Added this changelog page so you can stay up to date with every improvement we ship. Accessible from the main navigation and footer.",
    tags: ["feature"],
  },
  {
    version: "1.2.0",
    date: "2026-02-10",
    title: "Encrypted Notes & Tags",
    description: "API keys now support encrypted notes and comma-separated tags for better organization. Notes are encrypted client-side just like your keys.",
    tags: ["feature", "security"],
  },
  {
    version: "1.1.0",
    date: "2026-01-28",
    title: "Stripe Billing & Pro Plan",
    description: "Introduced Pro plan with unlimited key storage for £4.99/month. Integrated Stripe for secure checkout and subscription management.",
    tags: ["feature"],
  },
  {
    version: "1.0.1",
    date: "2026-01-15",
    title: "Vault Unlock Bug Fix",
    description: "Fixed an issue where API keys wouldn't display immediately after unlocking the vault. Keys now load correctly on every passphrase entry.",
    tags: ["fix"],
  },
  {
    version: "1.0.0",
    date: "2026-01-01",
    title: "Initial Launch",
    description: "Keyper launches with zero-knowledge encryption, AES-256-GCM key storage, vault passphrase system, activity logging, and encrypted backup export/import.",
    tags: ["feature", "security"],
  },
];
