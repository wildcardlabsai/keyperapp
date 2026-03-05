import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const pricingFaqs = [
  { q: "Can I switch between plans at any time?", a: "Yes. You can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated." },
  { q: "Is there a free trial for Pro?", a: "Yes! You get a 14-day free trial of Pro when you sign up. No credit card required." },
  { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards via Stripe. We also support Apple Pay and Google Pay." },
  { q: "What happens if I exceed 10 keys on the Free plan?", a: "You'll be prompted to upgrade to Pro. Your existing keys remain safe and encrypted — you just won't be able to add new ones until you upgrade." },
  { q: "Do you offer refunds?", a: "Yes. If you're not satisfied within the first 30 days, contact support for a full refund." },
];

const PricingPage = () => {
  const [annual, setAnnual] = useState(false);
  const monthlyPrice = 4.99;
  const annualPrice = 3.99;
  const price = annual ? annualPrice : monthlyPrice;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Pricing</h1>
            <p className="text-lg text-muted-foreground mb-6">Simple plans. No hidden fees. Start for free.</p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-3 rounded-full border border-border/50 bg-card/40 px-1.5 py-1.5">
              <button
                onClick={() => setAnnual(false)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${!annual ? "bg-gradient-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${annual ? "bg-gradient-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Annual <span className="text-xs opacity-80">(-20%)</span>
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="rounded-xl border border-border/50 bg-card/40 p-8">
              <h3 className="font-semibold text-lg mb-1">Free</h3>
              <p className="text-4xl font-bold mb-1">£0<span className="text-base font-normal text-muted-foreground">/month</span></p>
              <p className="text-sm text-muted-foreground mb-8">For individuals getting started</p>
              <ul className="space-y-3 mb-8">
                {["Up to 10 stored keys", "Client-side AES-256 encryption", "Auto-hidden secrets", "One-click copy", "Encrypted backups", "Activity log"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-sm"><Check className="h-4 w-4 text-primary shrink-0" />{t}</li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/signup">Get started free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>

            <div className="rounded-xl border border-primary/40 bg-card/40 p-8 relative glow-sm">
              <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">Popular</div>
              <h3 className="font-semibold text-lg mb-1">Pro</h3>
              <p className="text-4xl font-bold mb-1 tabular-nums">
                £{price.toFixed(2)}
                <span className="text-base font-normal text-muted-foreground">/{annual ? "mo" : "month"}</span>
              </p>
              {annual && <p className="text-xs text-accent mb-2">Billed £{(annualPrice * 12).toFixed(2)}/year</p>}
              <p className="text-sm text-muted-foreground mb-8">For power users and teams</p>
              <ul className="space-y-3 mb-8">
                {["Unlimited keys", "Everything in Free", "Priority support", "Advanced activity log", "Custom auto-lock timing", "Early access to new features"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-sm"><Check className="h-4 w-4 text-accent shrink-0" />{t}</li>
                ))}
              </ul>
              <Button className="w-full bg-gradient-primary border-0" asChild>
                <Link to="/signup">Start free trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-10">
            Billing is currently in early access. You can upgrade to Pro during the demo period.
          </p>

          {/* Comparison */}
          <div className="mt-16 rounded-xl border border-border/50 bg-card/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="p-4 font-semibold text-center">Free</th>
                  <th className="p-4 font-semibold text-center">Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Stored keys", "Up to 10", "Unlimited"],
                  ["Client-side encryption", "✓", "✓"],
                  ["Auto-hidden secrets", "✓", "✓"],
                  ["Encrypted backups", "✓", "✓"],
                  ["Activity log", "Basic", "Advanced"],
                  ["Priority support", "—", "✓"],
                  ["Custom auto-lock", "—", "✓"],
                ].map(([feat, free, pro], i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0">
                    <td className="p-4 text-muted-foreground">{feat}</td>
                    <td className="p-4 text-center">{free}</td>
                    <td className="p-4 text-center">{pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing FAQ */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">Pricing FAQ</h2>
            <Accordion type="single" collapsible className="max-w-2xl mx-auto">
              {pricingFaqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PricingPage;
