import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const PricingPage = () => (
  <div className="min-h-screen">
    <Navbar />
    <div className="pt-28 pb-20 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Pricing</h1>
          <p className="text-lg text-muted-foreground">Simple plans. No hidden fees. Start for free.</p>
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
            <p className="text-4xl font-bold mb-1">£4.99<span className="text-base font-normal text-muted-foreground">/month</span></p>
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
      </div>
    </div>
    <Footer />
  </div>
);

export default PricingPage;
