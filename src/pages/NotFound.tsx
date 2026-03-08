import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="relative text-center max-w-md">
          <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <ShieldOff className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-6xl font-extrabold text-foreground mb-2">404</h1>
          <p className="text-xl font-semibold text-foreground mb-2">Page not found</p>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-gradient-primary border-0 text-primary-foreground">
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/support">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
