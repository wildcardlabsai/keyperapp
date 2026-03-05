import { useState } from "react";
import { Mail, Send, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSending(true);

    const { data: { session } } = await supabase.auth.getSession();

    const { error } = await supabase.from("support_tickets").insert({
      user_id: session?.user?.id || null,
      name: name.trim(),
      email: email.trim(),
      subject: "Contact Form Inquiry",
      message: message.trim(),
    });

    setSending(false);
    if (error) {
      toast({ variant: "destructive", title: "Failed to send", description: "Please try again later." });
    } else {
      toast({ title: "Message sent!", description: "We'll get back to you as soon as possible." });
      setName(""); setEmail(""); setMessage("");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="mx-auto max-w-xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-3">Contact us</h1>
            <p className="text-muted-foreground">Have a question or feedback? We'd love to hear from you.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required maxLength={100} className="bg-card/60" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required maxLength={255} className="bg-card/60" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Message</label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" required maxLength={1000} rows={5} className="bg-card/60 resize-none" />
            </div>
            <Button type="submit" disabled={sending} className="w-full bg-gradient-primary border-0">
              {sending ? "Sending..." : <><Send className="mr-2 h-4 w-4" />Send message</>}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
