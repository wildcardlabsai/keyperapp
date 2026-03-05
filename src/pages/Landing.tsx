import { Link } from "react-router-dom";
import { Shield, Lock, EyeOff, ArrowRight, Key, Code, Tag, Download, Users, Database, ShieldCheck, Globe } from "lucide-react";
import Testimonials from "@/components/landing/Testimonials";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useInView } from "@/hooks/useInView";
import { useEffect, useRef, useState } from "react";

const useCountUp = (target: number, duration = 2000, startOnView = true) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, startOnView]);

  return { count, ref };
};

const MetricCard = ({ target, suffix, label, icon: Icon, delay, displayFn }: {
  target: number; suffix: string; label: string; icon: any; delay: number;
  displayFn?: (count: number) => string;
}) => {
  const { count, ref } = useCountUp(target, 2000);
  return (
    <div ref={ref} className="text-center animate-on-scroll" style={{ transitionDelay: `${delay}s` }}>
      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-3">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <p className="text-3xl md:text-4xl font-extrabold text-foreground tabular-nums">
        {displayFn ? displayFn(count) : count.toLocaleString()}
        <span className="text-accent">{suffix}</span>
      </p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
};

const Landing = () => {
  const scrollRef = useScrollAnimation();
  const { ref: encryptionRef, isInView: encryptionInView } = useInView<HTMLDivElement>();
  return (
    <div className="min-h-screen bg-background page-grid" ref={scrollRef}>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 section-glow-top" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-secondary/50 text-sm text-accent mb-8 animate-on-scroll">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Keyper v1.0 is now live
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-foreground animate-on-scroll" style={{ transitionDelay: "0.1s" }}>
            The API Key Manager You Can{" "}
            <span className="text-gradient">Actually Trust.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-on-scroll" style={{ transitionDelay: "0.2s" }}>
            Stop pasting production secrets into Slack. Keyper encrypts your API keys in the browser using AES-GCM. Our servers never see your plaintext.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-on-scroll" style={{ transitionDelay: "0.3s" }}>
            <Button size="lg" asChild className="bg-gradient-primary border-0 text-primary-foreground px-8 h-12 text-base w-full sm:w-auto hover:scale-[1.03] hover:shadow-[0_0_30px_-5px_hsl(187_80%_48%/0.4)] transition-all duration-300">
              <Link to="/signup">Create Free Vault <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 text-base w-full sm:w-auto border-border text-foreground hover:bg-secondary">
              <Link to="/security">Read Security Whitepaper</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-16 px-4 border-y border-border/40">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <MetricCard target={600} suffix="+" label="Active Users" icon={Users} delay={0} />
            <MetricCard target={1200} suffix="+" label="Keys Stored" icon={Database} delay={0.1} />
            <MetricCard target={999} suffix="%" label="Uptime" icon={Globe} delay={0.2} displayFn={(c) => (c / 10).toFixed(1)} />
            <MetricCard target={0} suffix="" label="Keys Readable by Us" icon={ShieldCheck} delay={0.3} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Military-Grade Encryption - Large card */}
            <div
              ref={encryptionRef}
              className={`rounded-2xl border border-border bg-card p-8 lg:row-span-2 hover:-translate-y-1 hover:border-accent/30 transition-all duration-700 ease-[cubic-bezier(.21,1.02,.73,1)] motion-reduce:transition-none motion-reduce:!opacity-100 motion-reduce:!translate-y-0 ${encryptionInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <h3 className="text-2xl font-bold mb-3 text-foreground">Military-Grade Encryption</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Your master passphrase never leaves your device. We use PBKDF2 to derive a key, then encrypt your secrets with AES-GCM before syncing.
              </p>
              <div className={`code-block rounded-xl p-5 font-mono text-sm glow-code transition-all duration-700 ease-out delay-200 motion-reduce:transition-none motion-reduce:!opacity-100 motion-reduce:!translate-y-0 ${encryptionInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-muted-foreground text-xs ml-2">browser-crypto.ts</span>
                </div>
                {[
                  <p key={0}><span className="text-accent">const</span> <span className="text-foreground">secret =</span> <span className="text-green-400">"sk_live_51Nx..."</span>;</p>,
                  <p key={1} className="text-muted-foreground mt-3">// Encrypting locally via WebCrypto API</p>,
                  <p key={2}><span className="text-accent">const</span> <span className="text-foreground">ciphertext =</span> <span className="text-purple-400">await</span> encrypt(secret, vaultKey);</p>,
                  <p key={3} className="text-muted-foreground mt-3">// Payload sent to server</p>,
                  <p key={4}><span className="text-foreground">{"{"}</span> <span className="text-green-400">"ciphertext"</span>: <span className="text-green-400">"U2FsdGVkX1+vxyz..."</span>, <span className="text-green-400">"iv"</span>: <span className="text-green-400">"a8f9d2..."</span> <span className="text-foreground">{"}"}</span></p>,
                ].map((line, i) => (
                  <div
                    key={i}
                    className={`transition-all duration-500 ease-out motion-reduce:!opacity-100 motion-reduce:!translate-y-0 motion-reduce:transition-none ${encryptionInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                    style={{ transitionDelay: `${400 + i * 150}ms` }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Zero-Knowledge */}
            <div className="rounded-2xl border border-border bg-card p-8 animate-on-scroll hover:-translate-y-1 hover:border-accent/30 transition-all duration-300" style={{ transitionDelay: "0.1s" }}>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <EyeOff className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Zero-Knowledge</h3>
              <p className="text-muted-foreground leading-relaxed">
                We literally cannot read your keys. A data breach on our end would only yield useless, encrypted blobs.
              </p>
            </div>

            {/* Organized & Tagged */}
            <div className="rounded-2xl border border-border bg-card p-8 animate-on-scroll hover:-translate-y-1 hover:border-accent/30 transition-all duration-300" style={{ transitionDelay: "0.2s" }}>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Tag className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Organized & Tagged</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Keep production, staging, and dev keys separate. Filter by provider instantly.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-red-500/15 text-red-400 text-xs font-medium">Production</span>
                <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-medium">Stripe</span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium">OpenAI</span>
              </div>
            </div>
          </div>

          {/* No Vendor Lock-in */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-8 animate-on-scroll hover:-translate-y-1 hover:border-accent/30 transition-all duration-300">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-foreground">No Vendor Lock-in</h3>
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
      <section className="py-24 px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground animate-on-scroll">How Keyper Works</h2>
          <div className="grid sm:grid-cols-3 gap-10 text-center">
            {[
              {
                step: "1",
                title: "Master Passphrase",
                desc: "You create a master passphrase. We derive a strong encryption key locally in your browser.",
                icon: Key,
                color: "border-accent text-accent",
              },
              {
                step: "2",
                title: "Local Encryption",
                desc: "When you add an API key, it is encrypted instantly on your device using AES-GCM.",
                icon: Lock,
                color: "border-blue-400 text-blue-400",
              },
              {
                step: "3",
                title: "Secure Sync",
                desc: "Only the unreadable ciphertext is sent to our servers, syncing securely across your devices.",
                icon: Shield,
                color: "border-purple-400 text-purple-400",
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center animate-on-scroll" style={{ transitionDelay: `${i * 0.15}s` }}>
                <div className={`h-20 w-20 rounded-full border-2 ${item.color} flex items-center justify-center mb-6`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-foreground">{item.step}. {item.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 section-glow-top" />
        <div className="relative mx-auto max-w-3xl text-center animate-on-scroll">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Ready to secure your secrets?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join developers who have stopped worrying about leaked API keys. Start for free, upgrade when you need unlimited storage.
          </p>
          <Button size="lg" asChild className="bg-gradient-primary border-0 text-primary-foreground px-8 h-12 text-base w-full sm:w-auto hover:scale-[1.03] hover:shadow-[0_0_30px_-5px_hsl(187_80%_48%/0.4)] transition-all duration-300">
            <Link to="/signup">Create Free Account</Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-4">Free forever for up to 10 keys. No credit card required.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
