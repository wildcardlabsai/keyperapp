import { Lock, Shield, Eye, Copy, Download, Users, Key, Fingerprint, Clock, Tags, FileText, Search } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import featureApiKeys from "@/assets/feature-apikeys.png";
import featureDevTools from "@/assets/feature-devtools.png";
import featureVaultLock from "@/assets/feature-vaultlock.png";
import featureDashboard from "@/assets/feature-dashboard.png";

const features = [
  { icon: Lock, title: "Client-side encryption", desc: "All encryption happens in your browser using AES-256. Your keys are never transmitted in plaintext." },
  { icon: Shield, title: "Zero-knowledge architecture", desc: "Keyper cannot read your secrets. We store only encrypted data — decryption requires your vault passphrase." },
  { icon: Eye, title: "Auto-hidden secrets", desc: "API keys are masked by default with dots. Temporarily reveal them with a single click, and they auto-hide after a few seconds." },
  { icon: Copy, title: "One-click copy", desc: "Copy any key to your clipboard instantly. No need to reveal the key first — copy directly from the masked view." },
  { icon: Download, title: "Encrypted backups", desc: "Export your entire vault as an encrypted file. Import it on any device with your passphrase." },
  { icon: Users, title: "Built for everyone", desc: "Whether you're a solo developer, startup founder, or part of a team — Keyper adapts to your workflow." },
  { icon: Key, title: "Organised key management", desc: "Categorise keys by service, environment, and custom tags. Find what you need instantly." },
  { icon: Fingerprint, title: "Vault passphrase", desc: "Your vault is protected by a separate passphrase. Even if your account is compromised, your keys remain safe." },
  { icon: Clock, title: "Auto-lock", desc: "The vault automatically locks after a period of inactivity, ensuring keys are never left exposed." },
  { icon: Tags, title: "Tags and notes", desc: "Add custom tags and notes to each key for better organisation and context." },
  { icon: FileText, title: "Activity log", desc: "Track when your vault was unlocked, keys were added or deleted, and backups were exported." },
  { icon: Search, title: "Search and filter", desc: "Quickly find keys by name, service, environment, or tags with powerful search and filtering." },
];

const showcases = [
  {
    title: "Organised Key Management",
    desc: "View, search, and filter all your API keys in one place. Categorise by service, environment, and custom tags.",
    image: featureApiKeys,
    alt: "Keyper API Keys management view",
  },
  {
    title: "Developer Tools & API Access",
    desc: "Access your encrypted vault programmatically via CLI, browser extension, or API with personal access tokens.",
    image: featureDevTools,
    alt: "Keyper Developer Tools with API tokens",
  },
  {
    title: "Dashboard Overview",
    desc: "Get a quick overview of your vault status, total keys, plan details, and onboarding progress at a glance.",
    image: featureDashboard,
    alt: "Keyper Dashboard overview",
  },
  {
    title: "Vault Lock Security",
    desc: "Your vault automatically locks after inactivity. Re-enter your passphrase to unlock — even if your session is active, your keys stay protected.",
    image: featureVaultLock,
    alt: "Keyper Vault lock screen",
  },
];

const FeaturesPage = () => (
  <div className="min-h-screen">
    <Navbar />
    <div className="pt-28 pb-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Features</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to securely store, manage, and access your API keys.</p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-24">
          {features.map((f, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card/40 p-6 hover:border-primary/30 hover:bg-card/60 transition-all duration-300">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Visual Showcases */}
        <div className="space-y-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">See It in Action</h2>
          {showcases.map((s, i) => (
            <div
              key={i}
              className={`flex flex-col ${i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} gap-10 lg:gap-14 items-center`}
            >
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-2xl font-bold mb-3 text-foreground">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0">{s.desc}</p>
              </div>
              <div className="flex-1 w-full">
                <div className="rounded-2xl border border-border/30 bg-card/20 p-2 shadow-[0_10px_50px_rgba(0,0,0,0.4)]">
                  <img
                    src={s.image}
                    alt={s.alt}
                    className="w-full h-auto rounded-xl object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default FeaturesPage;
