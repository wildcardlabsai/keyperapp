import { useEffect, useRef } from "react";

const testimonials = [
  // Row 1
  [
    { name: "Sarah Chen", role: "CTO, Nexaflow", text: "Keyper replaced our messy .env files overnight. The zero-knowledge encryption gives our security team total peace of mind." },
    { name: "Marcus Johnson", role: "Full-Stack Developer", text: "I used to store API keys in Notion. Terrifying in hindsight. Keyper is the tool I didn't know I desperately needed." },
    { name: "Emily Rodriguez", role: "DevOps Lead, Stackline", text: "Onboarding new devs used to mean sharing secrets over Slack. Now I just add them to the vault. Game changer." },
    { name: "James Park", role: "Indie Hacker", text: "Simple, fast, and actually secure. I migrated 40+ keys in under 10 minutes. The tagging system is brilliant." },
    { name: "Olivia Martin", role: "Security Engineer", text: "Finally, a key manager that practices what it preaches. Client-side encryption with no plaintext on the server — that's how it should be done." },
    { name: "David Kim", role: "Startup Founder", text: "We went from spreadsheets to Keyper in a day. Our investors were impressed when we showed them our key management setup." },
  ],
  // Row 2
  [
    { name: "Aisha Patel", role: "Backend Engineer", text: "The export feature saved us during a provider migration. Downloaded the vault, switched services, imported — zero downtime." },
    { name: "Tom Wheeler", role: "Freelance Developer", text: "I manage keys for 12 client projects. Keyper's environment tags keep everything organized without the chaos." },
    { name: "Lisa Chang", role: "VP Engineering, Cortex", text: "We evaluated 5 secret managers. Keyper won because of its simplicity and true zero-knowledge architecture." },
    { name: "Nathan Brooks", role: "Mobile Developer", text: "The browser-based encryption blew my mind. I watched the network tab — not a single plaintext key leaves the browser." },
    { name: "Rachel Foster", role: "Tech Lead, Buildspace", text: "Our team of 15 all use Keyper now. The support team is responsive and the product just works. Highly recommend." },
    { name: "Alex Novak", role: "SRE, CloudPeak", text: "After a competitor had a breach, we moved everything to Keyper. Even if they got breached, our keys would still be safe. That's the point." },
  ],
];

const MarqueeRow = ({ items, direction }: { items: typeof testimonials[0]; direction: "left" | "right" }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animId: number;
    let pos = direction === "left" ? 0 : -(el.scrollWidth / 2);

    const step = () => {
      pos += direction === "left" ? -0.4 : 0.4;
      const half = el.scrollWidth / 2;
      if (direction === "left" && pos <= -half) pos = 0;
      if (direction === "right" && pos >= 0) pos = -half;
      el.style.transform = `translateX(${pos}px)`;
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [direction]);

  return (
    <div className="overflow-hidden">
      <div ref={scrollRef} className="flex gap-5 w-max will-change-transform">
        {[...items, ...items].map((t, i) => (
          <div
            key={i}
            className="w-[340px] shrink-0 rounded-2xl border border-border bg-card p-6 flex flex-col"
          >
            <p className="text-muted-foreground text-sm leading-relaxed flex-1">"{t.text}"</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-accent/15 flex items-center justify-center text-accent font-bold text-sm">
                {t.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Testimonials = () => (
  <section className="py-24 px-4 overflow-hidden">
    <div className="mx-auto max-w-4xl text-center mb-14 animate-on-scroll">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Loved by Developers</h2>
      <p className="text-muted-foreground">See what the community is saying about Keyper.</p>
    </div>
    <div className="space-y-5">
      <MarqueeRow items={testimonials[0]} direction="left" />
      <MarqueeRow items={testimonials[1]} direction="right" />
    </div>
  </section>
);

export default Testimonials;
