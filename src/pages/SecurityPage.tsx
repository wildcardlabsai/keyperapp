import { Shield, Lock, Eye, Key, Server, AlertTriangle } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const SecurityPage = () => (
  <div className="min-h-screen">
    <Navbar />
    <div className="pt-28 pb-20 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-secondary/50 text-sm text-muted-foreground mb-6">
            <Shield className="h-4 w-4 text-accent" />
            Security
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Built with security at every layer</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Keyper is designed so that your API keys are never exposed — not to us, not to anyone.
          </p>
        </div>

        <div className="space-y-8">
          {[
            {
              icon: Lock,
              title: "Client-side encryption",
              text: "All encryption and decryption happens entirely within your browser. Your vault passphrase never leaves your device. We use AES-256-GCM, a standard trusted by governments and financial institutions worldwide.",
            },
            {
              icon: Key,
              title: "Vault passphrase",
              text: "When you create your vault, you set a passphrase that is separate from your login password. This passphrase is used to derive an encryption key. We never store or transmit your passphrase — if you lose it, we cannot recover your data.",
            },
            {
              icon: Eye,
              title: "Auto-hidden secrets",
              text: "API keys are always displayed as masked dots. When you choose to reveal a key, it's visible for a limited time before automatically hiding again. This protects against shoulder surfing and accidental exposure.",
            },
            {
              icon: Server,
              title: "Zero-knowledge storage",
              text: "Keyper stores only encrypted blobs. Our servers never see plaintext keys. Even in the event of a data breach, your API keys would remain encrypted and unusable without your passphrase.",
            },
            {
              icon: AlertTriangle,
              title: "Auto-lock",
              text: "Your vault automatically locks after a configurable period of inactivity (default: 10 minutes). You can also manually lock the vault at any time. A locked vault requires your passphrase to reopen.",
            },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card/40 p-8">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Technical overview */}
        <div className="mt-16 rounded-xl border border-border/50 bg-card/40 p-8">
          <h2 className="text-2xl font-bold mb-6">Technical overview</h2>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p><strong className="text-foreground">Encryption algorithm:</strong> AES-256-GCM with PBKDF2-derived keys (100,000 iterations, SHA-256).</p>
            <p><strong className="text-foreground">Key derivation:</strong> Your vault passphrase is used with PBKDF2 to derive a 256-bit encryption key. A unique salt is generated for each vault.</p>
            <p><strong className="text-foreground">Data at rest:</strong> Encrypted payloads are stored in our database. No plaintext secrets are ever written to disk on our servers.</p>
            <p><strong className="text-foreground">Data in transit:</strong> All communication uses TLS 1.3. Encrypted payloads are transmitted — even if intercepted, they remain unreadable without your passphrase.</p>
            <p><strong className="text-foreground">Session security:</strong> Sessions are managed with secure, HTTP-only tokens. Auto-lock clears decrypted data from browser memory.</p>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default SecurityPage;
