import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import keyperLogo from "@/assets/keyper-logo.png";

const navLinks = [
  { to: "/features", label: "Features" },
  { to: "/security", label: "Security" },
  { to: "/pricing", label: "Pricing" },
  { to: "/faq", label: "FAQ" },
  { to: "/support", label: "Support" },
  { to: "/changelog", label: "Changelog" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={keyperLogo} alt="Keyper" className="h-8" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-1">
            <div className="h-6 w-px bg-border mx-3" />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild className="bg-gradient-primary border-0 text-primary-foreground">
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>

          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden py-4 border-t border-border/50 space-y-1">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="block py-2 text-sm text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-3">
              <Button variant="ghost" size="sm" asChild><Link to="/login" onClick={() => setOpen(false)}>Sign In</Link></Button>
              <Button size="sm" asChild className="bg-gradient-primary border-0 text-primary-foreground"><Link to="/signup" onClick={() => setOpen(false)}>Get Started</Link></Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
