import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const PricingTeaser = () => (
  <section className="py-20 px-4 animate-on-scroll">
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
        Simple, transparent pricing
      </h2>
      <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
        Start free, upgrade when you need unlimited storage.
      </p>
      <div className="grid sm:grid-cols-2 gap-5 max-w-xl mx-auto">
        <div className="rounded-xl border border-border/50 bg-card/40 p-6 text-left">
          <p className="text-sm font-semibold text-muted-foreground mb-1">Free</p>
          <p className="text-2xl font-bold text-foreground mb-3">£0<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {["10 keys", "AES-256 encryption", "Encrypted backups"].map((t) => (
              <li key={t} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-accent shrink-0" />{t}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-primary/40 bg-card/40 p-6 text-left glow-sm">
          <p className="text-sm font-semibold text-accent mb-1">Pro</p>
          <p className="text-2xl font-bold text-foreground mb-3">£4.99<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {["Unlimited keys", "Priority support", "Early access"].map((t) => (
              <li key={t} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-accent shrink-0" />{t}</li>
            ))}
          </ul>
        </div>
      </div>
      <Button variant="outline" asChild className="mt-8">
        <Link to="/pricing">View full comparison <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </section>
);

export default PricingTeaser;
