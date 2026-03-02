import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Ticket = {
  id: string;
  name: string;
  email: string;
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

const AdminSupport = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [response, setResponse] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTickets(data as any);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const updates: any = {};
    if (response.trim()) updates.admin_response = response.trim();
    if (newStatus) updates.status = newStatus;
    await supabase.from("support_tickets").update(updates).eq("id", selected.id);
    setSaving(false);
    toast({ title: "Ticket updated" });
    setSelected(null);
    setResponse("");
    setNewStatus("");
    load();
  };

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36 bg-card/60"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No tickets</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card/40 overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_150px_80px_90px] gap-4 px-5 py-3 text-xs text-muted-foreground font-medium border-b border-border/40">
            <span>Subject</span><span>From</span><span>Status</span><span>Date</span>
          </div>
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelected(t); setResponse(t.admin_response || ""); setNewStatus(t.status); }}
              className="w-full text-left grid sm:grid-cols-[1fr_150px_80px_90px] gap-4 px-5 py-4 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors items-center"
            >
              <p className="text-sm font-medium truncate">{t.subject}</p>
              <p className="text-xs text-muted-foreground truncate hidden sm:block">{t.email}</p>
              <div className="flex items-center gap-1.5 text-xs hidden sm:flex">
                {statusIcon[t.status]}<span>{statusLabel[t.status]}</span>
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">{formatDate(t.created_at)}</span>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="bg-card border-border/60 max-w-lg">
          <DialogHeader><DialogTitle>{selected?.subject}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{selected?.name}</span> ({selected?.email}) — {selected && formatDate(selected.created_at)}
            </div>
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm whitespace-pre-wrap">{selected?.message}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-40 bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Admin response</label>
              <Textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={4} className="bg-muted/50" placeholder="Write a response..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary border-0">
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSupport;
