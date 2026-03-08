import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageCTAProps {
  heading?: string;
  description?: string;
}

const PageCTA = ({
  heading = "Ready to secure your secrets?",
  description = "Join developers who trust Keyper with their API keys. Start for free — no credit card required.",
}: PageCTAProps) => (
  <section className="py-20 px-4 relative overflow-hidden">
    <div className="absolute inset-0 section-glow-top" />
    <div className="relative mx-auto max-w-2xl text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">{heading}</h2>
      <p className="text-muted-foreground mb-8 max-w-xl mx-auto">{description}</p>
      <Button size="lg" asChild className="bg-gradient-primary border-0 text-primary-foreground px-8 h-12 text-base hover:scale-[1.03] hover:shadow-[0_0_30px_-5px_hsl(187_80%_48%/0.4)] transition-all duration-300">
        <Link to="/signup">Create Free Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </section>
);

export default PageCTA;
