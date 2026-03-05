import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const MobileCTA = () => (
  <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/50 bg-background/90 backdrop-blur-xl px-4 py-3 flex gap-2">
    <Button variant="ghost" size="sm" asChild className="flex-1">
      <Link to="/login">Sign In</Link>
    </Button>
    <Button size="sm" asChild className="flex-1 bg-gradient-primary border-0 text-primary-foreground">
      <Link to="/signup">Get Started <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
    </Button>
  </div>
);

export default MobileCTA;
