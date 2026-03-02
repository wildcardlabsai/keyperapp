import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Users, BarChart3, ArrowLeft, Crown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Tab = "users" | "metrics";

type MockUser = {
  id: string;
  email: string;
  signupDate: string;
  plan: "Free" | "Pro Demo";
  keyCount: number;
};

const MOCK_USERS: MockUser[] = [
  { id: "1", email: "alice@example.com", signupDate: "05/01/2026", plan: "Pro Demo", keyCount: 23 },
  { id: "2", email: "bob@dev.io", signupDate: "12/01/2026", plan: "Free", keyCount: 8 },
  { id: "3", email: "carol@startup.com", signupDate: "20/01/2026", plan: "Free", keyCount: 3 },
  { id: "4", email: "dave@agency.co", signupDate: "01/02/2026", plan: "Pro Demo", keyCount: 47 },
  { id: "5", email: "eve@tech.dev", signupDate: "25/02/2026", plan: "Free", keyCount: 1 },
];

const Admin = () => {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState(MOCK_USERS);
  const [announcement, setAnnouncement] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate("/login");
    });
  }, [navigate]);

  const togglePlan = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, plan: u.plan === "Free" ? "Pro Demo" : "Free" } : u));
    toast({ title: "Plan updated" });
  };

  const totalKeys = users.reduce((a, u) => a + u.keyCount, 0);
  const newUsers7d = users.filter((u) => {
    const parts = u.signupDate.split("/");
    const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    const now = new Date();
    return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-sidebar p-4">
        <div className="flex items-center gap-2 mb-2 px-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">Keyper</span>
        </div>
        <p className="text-xs text-muted-foreground px-2 mb-6">Admin Panel</p>
        <nav className="space-y-1 flex-1">
          <button onClick={() => setTab("users")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "users" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
            <Users className="h-4 w-4" />Users
          </button>
          <button onClick={() => setTab("metrics")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "metrics" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
            <BarChart3 className="h-4 w-4" />Metrics
          </button>
        </nav>
        <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />Back to dashboard
        </Link>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {tab === "users" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Users</h1>
            <div className="rounded-xl border border-border/50 bg-card/40 overflow-hidden">
              <div className="hidden sm:grid grid-cols-[1fr_100px_80px_80px_100px] gap-4 px-5 py-3 text-xs text-muted-foreground font-medium border-b border-border/40">
                <span>Email</span><span>Signup</span><span>Plan</span><span>Keys</span><span className="text-right">Actions</span>
              </div>
              {users.map((u) => (
                <div key={u.id} className="grid sm:grid-cols-[1fr_100px_80px_80px_100px] gap-4 px-5 py-4 border-b border-border/30 last:border-0 items-center hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium truncate">{u.email}</span>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block">{u.signupDate}</span>
                  <span className={`text-xs font-medium hidden sm:block ${u.plan === "Pro Demo" ? "text-accent" : "text-muted-foreground"}`}>{u.plan}</span>
                  <span className="text-xs text-muted-foreground hidden sm:block">{u.keyCount}</span>
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" onClick={() => togglePlan(u.id)} className="text-xs h-7">
                      {u.plan === "Free" ? <><Crown className="mr-1 h-3 w-3" />Enable Pro</> : "Downgrade"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "metrics" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Platform metrics</h1>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total users", value: users.length },
                { label: "Total keys stored", value: totalKeys },
                { label: "New users (7 days)", value: newUsers7d },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-border/50 bg-card/40 p-5">
                  <p className="text-sm text-muted-foreground mb-2">{m.label}</p>
                  <p className="text-3xl font-bold">{m.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-border/50 bg-card/40 p-6">
              <h3 className="font-semibold mb-4">Announcement banner</h3>
              <p className="text-sm text-muted-foreground mb-3">Set a message to display to all users at the top of their dashboard.</p>
              <div className="flex gap-3">
                <input value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="e.g. Keyper Pro is now available!" className="flex-1 h-9 rounded-md border border-input bg-muted/50 px-3 text-sm" maxLength={200} />
                <Button size="sm" onClick={() => toast({ title: "Banner updated" })} className="bg-gradient-primary border-0">Save</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
