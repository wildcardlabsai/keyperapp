import { useState, useEffect, useCallback } from "react";
import { Plus, MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  admin_response: string | null;
  created_at: string;
};

const statusIcon: Record<string, React.ReactNode> = {
  open: <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />,
  in_progress: <Clock className="h-3.5 w-3.5 text-blue-500" />,
  resolved: <CheckCircle2 className="h-3.5 w-3.5 text-accent" />,
};

const statusLabel: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const SupportTab = ({ userEmail, userId }: { userEmail: string; userId: string }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [viewTicket, setViewTicket] = useState<Ticket | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const loadTickets = useCallback(async () => {
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setTickets(data as any);
  }, [userId]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({ variant: "destructive", title: "Please fill in all fields" });
      return;
    }
    setSending(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: userId,
      name: userEmail.split("@")[0],
      email: userEmail,
      subject: subject.trim(),
      message: message.trim(),
    });
    setSending(false);
    if (error) {
      toast({ variant: "destructive", title: "Failed to submit ticket" });
    } else {
      toast({ title: "Ticket submitted", description: "We'll get back to you shortly." });
      setShowNew(false);
      setSubject("");
      setMessage("");
      loadTickets();
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-sm text-muted-foreground">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-gradient-primary border-0">
          <Plus className="mr-2 h-4 w-4" />New ticket
        </Button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No support tickets</p>
          <p className="text-sm mt-1">Create a ticket if you need help.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card/40 overflow-hidden">
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => setViewTicket(t)}
              className="w-full text-left px-5 py-4 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{t.subject}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {statusIcon[t.status]}<span>{statusLabel[t.status]}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{formatDate(t.created_at)}</p>
            </button>
          ))}
        </div>
      )}

      {/* New ticket dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="bg-card border-border/60 max-w-md">
          <DialogHeader><DialogTitle>New support ticket</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of your issue" className="bg-muted/50 mt-1" />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue in detail..." rows={5} className="bg-muted/50 mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={sending} className="bg-gradient-primary border-0">
              {sending ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View ticket dialog */}
      <Dialog open={!!viewTicket} onOpenChange={(o) => !o && setViewTicket(null)}>
        <DialogContent className="bg-card border-border/60 max-w-md">
          <DialogHeader><DialogTitle>{viewTicket?.subject}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              {viewTicket && statusIcon[viewTicket.status]}
              <span className="text-muted-foreground">{viewTicket && statusLabel[viewTicket.status]}</span>
              <span className="text-muted-foreground ml-auto text-xs">{viewTicket && formatDate(viewTicket.created_at)}</span>
            </div>
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm whitespace-pre-wrap">{viewTicket?.message}</p>
            </div>
            {viewTicket?.admin_response && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="text-xs font-medium text-primary mb-1">Admin response</p>
                <p className="text-sm whitespace-pre-wrap">{viewTicket.admin_response}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportTab;
