import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { kbArticles } from "@/lib/knowledgeBase";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? kbArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.body.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="fixed bottom-4 right-4 z-[60] md:bottom-6 md:right-6" ref={panelRef}>
      {open && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/40">
            <span className="text-sm font-semibold text-foreground">Help &amp; Support</span>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search help articles…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 bg-background/60"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {query.trim() === "" ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Type a question to search our help center.
                </p>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No articles found. <a href="/support" className="text-accent hover:underline">Contact support →</a>
                </p>
              ) : (
                filtered.map((a) => (
                  <a
                    key={a.id}
                    href={`/support?article=${a.id}`}
                    className="block rounded-lg px-3 py-2.5 hover:bg-secondary/60 transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{a.body.slice(0, 100)}…</p>
                  </a>
                ))
              )}
            </div>
          </div>
          <div className="border-t border-border/50 px-4 py-3">
            <Button variant="outline" size="sm" asChild className="w-full">
              <a href="/support">Open Support Center <Send className="ml-2 h-3.5 w-3.5" /></a>
            </Button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="h-12 w-12 rounded-full bg-gradient-primary text-primary-foreground shadow-lg hover:scale-105 hover:shadow-[0_0_30px_-5px_hsl(187_80%_48%/0.4)] transition-all duration-300 flex items-center justify-center"
        aria-label="Open help chat"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </div>
  );
};

export default ChatWidget;
