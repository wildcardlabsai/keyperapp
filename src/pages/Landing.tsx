import { Link } from "react-router-dom";
import { Shield, Lock, Eye, EyeOff, ArrowRight, Key, Code, Tag, Download, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Landing = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* Hero */}
    <section className="relative pt-32 pb-24 px-4 overflow-hidden">
      <div className="absolute inset-0 hero-gradient" />
      <div className="relative mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card text-sm text-muted-foreground mb-8">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Keyper v1.0 is now live
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-foreground">
          The API Key Manager You Can{" "}
          <span className="text-gradient">Actually Trust.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop pasting production secrets into Slack. Keyper encrypts your API keys in the browser using AES-GCM. Our servers never see your plaintext.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild className="bg-gradient-primary border-0 text-primary-foreground px-8 h-12 text-base">
            <Link to="/signup">Create Free Vault <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="h-12 text-base">
            <Link to="/security">Read Security Whitepaper</Link>
          </Button>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Military-Grade Encryption - Large card */}
          <div className="rounded-2xl border border-border bg-card p-8 lg:row-span-2">
            <h3 className="text-2xl font-bold mb-3">Military-Grade Encryption</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Your master passphrase never leaves your device. We use PBKDF2 to derive a key, then encrypt your secrets with AES-GCM before syncing.
            </p>
            <div className="rounded-xl bg-muted/60 border border-border p-5 font-mono text-sm space-y-2">
              <p className="text-muted-foreground text-xs mb-3">browser-crypto.ts</p>
              <p><span className="text-accent">const</span> secret = <span className="text-green-600">"sk_live_51Nx..."</span>;</p>
              <p className="text-muted-foreground mt-3">// Encrypting locally via WebCrypto API</p>
              <p><span className="text-accent">const</span> ciphertext = <span className="text-accent">await</span> encrypt(secret, vaultKey);</p>
              <p className="text-muted-foreground mt-3">// Payload sent to server</p>
              <p>{"{"} <span className="text-green-600">"ciphertext"</span>: <span className="text-green-600">"U2FsdGVkX1+vxyz..."</span>, <span className="text-green-600">"iv"</span>: <span className="text-green-600">"a8f9d2..."</span> {"}"}</p>
            </div>
          </div>

          {/* Zero-Knowledge */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <EyeOff className="h-5 w-5 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">Zero-Knowledge</h3>
            <p className="text-muted-foreground leading-relaxed">
              We literally cannot read your keys. A data breach on our end would only yield useless, encrypted blobs.
            </p>
          </div>

          {/* Organized & Tagged */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Tag className="h-5 w-5 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">Organized & Tagged</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Keep production, staging, and dev keys separate. Filter by provider instantly.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">Production</span>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">Stripe</span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">OpenAI</span>
            </div>
          </div>
        </div>

        {/* No Vendor Lock-in */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">No Vendor Lock-in</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your data belongs to you. Export your entire vault as an encrypted JSON backup at any time. Import it back if you ever need to.
              </p>
            </div>
            <div className="flex gap-4">
              {[
                { icon: Code, label: "JSON Format" },
                { icon: Lock, label: "Fully Encrypted" },
                { icon: Download, label: "Offline Recovery" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-2">
                    <item.icon className="h-5 w-5 text-accent" />
                  </div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="py-24 px-4 border-t border-border/50">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How Keyper Works</h2>
        <div className="mt-14 space-y-0">
          {[
            {
              step: "1",
              title: "Master Passphrase",
              desc: "You create a master passphrase. We derive a strong encryption key locally in your browser.",
              icon: Key,
            },
            {
              step: "2",
              title: "Local Encryption",
              desc: "When you add an API key, it is encrypted instantly on your device using AES-GCM.",
              icon: Lock,
            },
            {
              step: "3",
              title: "Secure Sync",
              desc: "Only the unreadable ciphertext is sent to our servers, syncing securely across your devices.",
              icon: Shield,
            },
          ].map((item, i) => (
            <div key={i} className="flex gap-6 items-start py-8 border-t border-border/50 first:border-0">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                {item.step}
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 px-4 border-t border-border/50">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to secure your secrets?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Join developers who have stopped worrying about leaked API keys. Start for free, upgrade when you need unlimited storage.
        </p>
        <Button size="lg" asChild className="bg-gradient-primary border-0 text-primary-foreground px-8 h-12 text-base">
          <Link to="/signup">Create Free Account</Link>
        </Button>
        <p className="text-xs text-muted-foreground mt-4">Free forever for up to 10 keys. No credit card required.</p>
      </div>
    </section>

    <Footer />
  </div>
);

export default Landing;
