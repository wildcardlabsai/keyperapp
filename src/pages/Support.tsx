import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ChevronRight, ArrowLeft, Send, BookOpen, MessageSquare, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PageCTA from "@/components/landing/PageCTA";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { kbArticles, kbCategories, type KBArticle } from "@/lib/knowledgeBase";

const Support = () => {
  const [searchParams] = useSearchParams();
  const initialArticleId = searchParams.get("article");
  const initialArticle = initialArticleId ? kbArticles.find(a => a.id === initialArticleId) || null : null;

  const [search, setSearch] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(initialArticle);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const scrollRef = useScrollAnimation();

  const filtered = search.trim()
    ? kbArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.body.toLowerCase().includes(search.toLowerCase()) ||
          a.category.toLowerCase().includes(search.toLowerCase())
      )
    : kbArticles;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast({ variant: "destructive", title: "Please fill in all fields" });
      return;
    }
    setSending(true);

    const { data: { session } } = await supabase.auth.getSession();

    const { error } = await supabase.from("support_tickets").insert({
      user_id: session?.user?.id || null,
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    setSending(false);
    if (error) {
      toast({ variant: "destructive", title: "Failed to send", description: "Please try again later." });
    } else {
      supabase.functions.invoke("notify-support-ticket", {
        body: { name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() },
      });
      toast({ title: "Message sent!", description: "We'll get back to you shortly." });
      setName(""); setEmail(""); setSubject(""); setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background page-grid" ref={scrollRef}>
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12 animate-on-scroll">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Support & Knowledge Base</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">Find answers to common questions or get in touch with our team.</p>
          </div>

          {/* Knowledge Base */}
          <section className="mb-16 animate-on-scroll">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Knowledge Base</h2>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelectedArticle(null); }}
                placeholder="Search articles..."
                className="pl-9 bg-card/60"
              />
            </div>

            {selectedArticle ? (
              <div className="rounded-xl border border-border/50 bg-card/40 p-6">
                <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-1 text-sm text-primary hover:underline mb-4">
                  <ArrowLeft className="h-3.5 w-3.5" />Back to articles
                </button>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{selectedArticle.category}</span>
                <h3 className="text-xl font-semibold mt-1 mb-4">{selectedArticle.title}</h3>
                <div className="prose prose-sm prose-invert max-w-none text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedArticle.body}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {kbCategories.map((cat) => {
                  const articles = filtered.filter((a) => a.category === cat);
                  if (articles.length === 0) return null;
                  return (
                    <div key={cat}>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat}</h3>
                      <div className="rounded-xl border border-border/50 bg-card/40 overflow-hidden">
                        {articles.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => setSelectedArticle(a)}
                            className="w-full text-left flex items-center justify-between px-5 py-3.5 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                          >
                            <span className="text-sm font-medium">{a.title}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No articles found</p>
                    <p className="text-sm mt-1">Try a different search term or contact us below.</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Contact Form */}
          <section className="animate-on-scroll">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Contact Us</h2>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/40 p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Can't find what you're looking for? Send us a message and we'll get back to you.
              </p>
              <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>Call us: <a href="tel:+443300435658" className="text-primary hover:underline">+44 330 043 5658</a></span>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="bg-muted/50 mt-1" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="bg-muted/50 mt-1" />
                  </div>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary" className="bg-muted/50 mt-1" />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your question or issue..." rows={5} className="bg-muted/50 mt-1" />
                </div>
                <Button type="submit" disabled={sending} className="bg-gradient-primary border-0">
                  <Send className="mr-2 h-4 w-4" />{sending ? "Sending..." : "Send message"}
                </Button>
              </form>
            </div>
          </section>
        </div>
      </main>
      <PageCTA heading="Need more help?" description="Our team is here to help you get the most out of Keyper." />
      <Footer />
    </div>
  );
};

export default Support;
