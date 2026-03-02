import { Link } from "react-router-dom";
import keyperLogo from "@/assets/keyper-logo.png";

const Footer = () => (
  <footer className="relative">
    <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <img src={keyperLogo} alt="Keyper" className="h-7" />
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
        <Link to="/admin" className="hover:text-foreground transition-colors">Admin</Link>
      </div>
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>© {new Date().getFullYear()} Keyper. All rights reserved.</p>
        <p>Developed by Wildcard Labs · <a href="https://twitter.com/CymruMatt" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@CymruMatt</a></p>
      </div>
    </div>
  </footer>
);

export default Footer;
