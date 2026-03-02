import { Link } from "react-router-dom";
import keyperLogo from "@/assets/keyper-logo.png";

const Footer = () => (
  <footer className="border-t border-border/50 bg-muted/30">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <img src={keyperLogo} alt="Keyper" className="h-7" />
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your API keys, encrypted in your browser. Only you can see them.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Product</h4>
          <div className="space-y-2">
            <Link to="/features" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link to="/security" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Security</Link>
            <Link to="/pricing" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Support</h4>
          <div className="space-y-2">
            <Link to="/faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
            <Link to="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Legal</h4>
          <div className="space-y-2">
            <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
      <div className="mt-10 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Keyper. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
