import { Lock, Key, EyeOff, Shield } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const sections = [
  {
    icon: Lock,
    title: "The Master Passphrase",
    text: "When you create a vault, you choose a Master Passphrase. This passphrase is never sent to our servers. Instead, it is used locally in your browser to derive a strong encryption key using PBKDF2 with SHA-256 and 600,000 iterations.",
  },
  {
    icon: Key,
    title: "Encryption at Rest",
    text: "Every API key you add is encrypted locally using the derived key and the AES-GCM algorithm. A unique Initialization Vector (IV) is generated for every single secret. Only the resulting ciphertext and IV are sent to our database.",
  },
  {
    icon: EyeOff,
    title: "Zero-Knowledge Proof",
    text: "Because we never receive your Master Passphrase or the derived key, we have absolutely no way to decrypt your data. If our database were compromised, the attacker would only obtain useless, encrypted blobs.",
  },
  {
    icon: Shield,
    title: "Authentication vs. Encryption",
    text: "Your account password (used to log in) is separate from your Vault Passphrase (used to encrypt data). This separation ensures that even if someone gains access to your account, they cannot read your secrets without the Vault Passphrase.",
  },
];

const SecurityPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-28 pb-20 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Security Architecture</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            How we protect your most sensitive data with true zero-knowledge encryption.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-12">
            {sections.map((s, i) => (
              <div key={i} className="relative pl-14">
                <div className="absolute left-0 h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-bold text-xl mb-2">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default SecurityPage;
