import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import keyperLogo from "@/assets/keyper-logo.png";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card/50">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <Shield className="h-6 w-6 text-accent" />
          <span className="text-lg font-bold text-foreground">Keyper</span>
        </Link>
      </div>
      <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-8">
        <Link to="/features" className="hover:text-foreground transition-colors">Features</Link>
        <Link to="/security" className="hover:text-foreground transition-colors">Security</Link>
        <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
        <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
        <Link to="/contact" className="hover:text-foreground transition-colors">Support</Link>
        <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
        <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
      </div>
      <div className="text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Keyper. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
