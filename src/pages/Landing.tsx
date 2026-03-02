import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Copy, Download, Users, Check, ArrowRight, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const features = [
  { icon: Lock, title: "Client-side encryption", desc: "Your keys are encrypted before they ever leave your browser." },
  { icon: Shield, title: "Zero-knowledge architecture", desc: "We never see your secrets. Even our team cannot access them." },
  { icon: Eye, title: "Auto-hidden secrets", desc: "Keys are always masked. Reveal only when you need them." },
  { icon: Copy, title: "One-click copy", desc: "Copy any key to your clipboard with a single click." },
  { icon: Download, title: "Encrypted backups", desc: "Export your vault as an encrypted file for safekeeping." },
  { icon: Users, title: "Built for everyone", desc: "Developers, founders, and teams all benefit from Keyper." },
];

const Landing = () => (
  <div className="min-h-screen">
    <Navbar />

    {/* Hero */}
    <section className="relative pt-32 pb-24 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(213_94%_56%/0.1),transparent_60%)]" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl animate-glow-pulse" />
      <div className="relative mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-secondary/50 text-sm text-muted-foreground mb-8">
          <Shield className="h-4 w-4 text-primary" />
          End-to-end encrypted API key vault
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
          A safer way to store{" "}
          <span className="text-gradient">your API keys</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Keyper encrypts your keys before they ever leave your browser. Only you can access them.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild className="bg-gradient-primary border-0 px-8 h-12 text-base glow-sm">
            <Link to="/signup">Create free account</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="h-12 text-base">
            <Link to="/login">Sign in <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>

      {/* Vault preview */}
      <div className="relative mx-auto max-w-3xl mt-20 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 glow-primary">
          <div className="flex items-center gap-2 mb-5">
            <Key className="h-5 w-5 text-primary" />
            <span className="font-semibold">Your Vault</span>
            <span className="ml-auto text-xs text-muted-foreground px-2.5 py-1 rounded-md bg-secondary">3 keys</span>
          </div>
          {["OpenAI API Key", "Stripe Secret Key", "AWS Access Key"].map((name, i) => (
            <div key={i} className="flex items-center justify-between py-3.5 border-t border-border/40">
              <div>
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground mt-1 tracking-widest">••••••••••••••••••••</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-secondary/80 flex items-center justify-center cursor-pointer hover:bg-secondary transition-colors">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="h-8 w-8 rounded-md bg-secondary/80 flex items-center justify-center cursor-pointer hover:bg-secondary transition-colors">
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to protect your keys</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Built with security-first principles and a developer-friendly experience.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
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
        <div className="text-center mt-10">
          <Button variant="outline" asChild>
            <Link to="/features">View all features <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>

    {/* Security */}
    <section className="py-24 px-4 border-t border-border/30">
      <div className="mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-secondary/50 text-sm text-muted-foreground mb-8">
          <Lock className="h-4 w-4 text-accent" />
          Security first
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Your keys never leave your browser unencrypted</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Keyper uses client-side encryption to ensure that your API keys are encrypted before they ever leave your device. We operate on a zero-knowledge architecture — even our own team cannot read your secrets.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
          {[
            "API keys encrypted in the browser",
            "Keyper never stores plaintext keys",
            "Only you can decrypt your secrets",
            "Even Keyper admins cannot see your keys",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-card/50 border border-border/40">
              <Check className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Button variant="outline" asChild>
            <Link to="/security">Learn more about security <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>

    {/* Pricing */}
    <section className="py-24 px-4 border-t border-border/30">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
        <p className="text-muted-foreground mb-14">Start for free. Upgrade when you need more.</p>
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="rounded-xl border border-border/50 bg-card/40 p-8 text-left">
            <h3 className="font-semibold mb-1">Free</h3>
            <p className="text-3xl font-bold mb-1">£0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
            <p className="text-sm text-muted-foreground mb-6">For individuals getting started</p>
            <ul className="space-y-3 mb-8">
              {["Up to 10 stored keys", "Client-side encryption", "Encrypted backups"].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm"><Check className="h-4 w-4 text-primary shrink-0" />{t}</li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" asChild><Link to="/signup">Get started</Link></Button>
          </div>
          <div className="rounded-xl border border-primary/40 bg-card/40 p-8 text-left relative glow-sm">
            <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">Popular</div>
            <h3 className="font-semibold mb-1">Pro</h3>
            <p className="text-3xl font-bold mb-1">£4.99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
            <p className="text-sm text-muted-foreground mb-6">For power users and teams</p>
            <ul className="space-y-3 mb-8">
              {["Unlimited keys", "Everything in Free", "Priority support"].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm"><Check className="h-4 w-4 text-accent shrink-0" />{t}</li>
              ))}
            </ul>
            <Button className="w-full bg-gradient-primary border-0" asChild><Link to="/signup">Start free trial</Link></Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-8">Billing is currently in early access. You can upgrade to Pro during the demo period.</p>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 px-4 border-t border-border/30">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to secure your API keys?</h2>
        <p className="text-muted-foreground mb-8">Join developers who trust Keyper to keep their secrets safe.</p>
        <Button size="lg" asChild className="bg-gradient-primary border-0 px-8 h-12 text-base glow-sm">
          <Link to="/signup">Create free account</Link>
        </Button>
      </div>
    </section>

    <Footer />
  </div>
);

export default Landing;
