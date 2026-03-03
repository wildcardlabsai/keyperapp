import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Users, BarChart3, ArrowLeft, Crown, User, MessageSquare, KeyRound, Trash2, Pencil, UserPlus, ArrowDown, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminSupport from "@/components/admin/AdminSupport";

type Tab = "users" | "metrics" | "support" | "email";

type UserRow = {
  user_id: string;
  email: string;
  plan: string;
  created_at: string;
  key_count: number;
};

const Admin = () => {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(true);
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  // Edit user state
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPlan, setEditPlan] = useState("free");
  const [editSaving, setEditSaving] = useState(false);

  // Delete user state
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Add user state
  const [showAddUser, setShowAddUser] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addPlan, setAddPlan] = useState("free");
  const [adding, setAdding] = useState(false);

  // Mass email state
  const [massSubject, setMassSubject] = useState("");
  const [massBody, setMassBody] = useState("");
  const [sendingMass, setSendingMass] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const loadUsers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");
    if (!profiles) { setLoading(false); return; }

    const rows: UserRow[] = [];
    for (const p of profiles) {
      const { count } = await supabase
        .from("api_keys")
        .select("*", { count: "exact", head: true })
        .eq("user_id", p.user_id);
      rows.push({
        user_id: p.user_id,
        email: p.email || "",
        plan: p.plan,
        created_at: new Date(p.created_at).toLocaleDateString("en-GB"),
        key_count: count || 0,
      });
    }
    setUsers(rows);
    setLoading(false);
  };

  useEffect(() => {
    const load = async () => {
      await loadUsers();
      const { data: ann } = await supabase
        .from("announcements")
        .select("message")
        .eq("active", true)
        .limit(1)
        .maybeSingle();
      if (ann) setAnnouncement(ann.message);
    };
    load();
  }, []);

  const callAdminFn = async (fnName: string, body: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fnName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(body),
      }
    );
    const result = await res.json();
    if (result.error) throw new Error(result.error);
    return result;
  };

  const handleResetPassword = async () => {
    if (!resetTarget || !newPassword || newPassword.length < 6) {
      toast({ variant: "destructive", title: "Password must be at least 6 characters" });
      return;
    }
    setResetting(true);
    try {
      await callAdminFn("admin-reset-password", { user_id: resetTarget.user_id, new_password: newPassword });
      toast({ title: "Password reset", description: `Password updated for ${resetTarget.email}` });
      setResetTarget(null);
      setNewPassword("");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed", description: err.message });
    }
    setResetting(false);
  };

  const handleEditUser = async () => {
    if (!editTarget) return;
    setEditSaving(true);
    try {
      await callAdminFn("admin-manage-users", {
        action: "update_user",
        user_id: editTarget.user_id,
        email: editEmail !== editTarget.email ? editEmail : undefined,
        plan: editPlan !== editTarget.plan ? editPlan : undefined,
      });
      toast({ title: "User updated" });
      setEditTarget(null);
      await loadUsers();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed", description: err.message });
    }
    setEditSaving(false);
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await callAdminFn("admin-manage-users", {
        action: "delete_user",
        user_id: deleteTarget.user_id,
      });
      toast({ title: "User deleted", description: `${deleteTarget.email} has been removed` });
      setDeleteTarget(null);
      await loadUsers();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed", description: err.message });
    }
    setDeleting(false);
  };

  const handleSendMassEmail = async () => {
    if (!massSubject.trim() || !massBody.trim()) {
      toast({ variant: "destructive", title: "Enter a subject and body" });
      return;
    }
    setSendingMass(true);
    try {
      const result = await callAdminFn("send-mass-email", {
        subject: massSubject,
        body: massBody,
      });
      toast({
        title: "Emails sent",
        description: `${result.sent} sent, ${result.failed} failed out of ${result.total} users`,
      });
      setMassSubject("");
      setMassBody("");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed", description: err.message });
    }
    setSendingMass(false);
  };

  const handleAddUser = async () => {
    if (!addEmail || !addPassword || addPassword.length < 6) {
      toast({ variant: "destructive", title: "Enter a valid email and password (min 6 chars)" });
      return;
    }
    setAdding(true);
    try {
      await callAdminFn("admin-manage-users", {
        action: "create_user",
        email: addEmail,
        password: addPassword,
        plan: addPlan,
      });
      toast({ title: "User created", description: `${addEmail} added successfully` });
      setShowAddUser(false);
      setAddEmail("");
      setAddPassword("");
      setAddPlan("free");
      await loadUsers();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed", description: err.message });
    }
    setAdding(false);
  };

  const saveAnnouncement = async () => {
    await supabase.from("announcements").update({ active: false }).eq("active", true);
    if (announcement.trim()) {
      await supabase.from("announcements").insert({ message: announcement.trim(), active: true });
    }
    toast({ title: "Banner updated" });
  };

  const totalKeys = users.reduce((a, u) => a + u.key_count, 0);
  const newUsers7d = users.filter((u) => {
    const parts = u.created_at.split("/");
    const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    return (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
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
          <button onClick={() => setTab("support")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "support" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
            <MessageSquare className="h-4 w-4" />Support
          </button>
          <button onClick={() => setTab("metrics")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "metrics" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
            <BarChart3 className="h-4 w-4" />Metrics
          </button>
          <button onClick={() => setTab("email")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "email" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
            <Mail className="h-4 w-4" />Email All Users
          </button>
        </nav>
        <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />Back to dashboard
        </Link>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {tab === "users" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Users</h1>
              <Button onClick={() => setShowAddUser(true)} className="bg-gradient-primary border-0 text-sm">
                <UserPlus className="mr-2 h-4 w-4" />Add User
              </Button>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/40 overflow-hidden">
              <div className="hidden sm:grid grid-cols-[1fr_100px_80px_80px_1fr] gap-4 px-5 py-3 text-xs text-muted-foreground font-medium border-b border-border/40">
                <span>Email</span><span>Signup</span><span>Plan</span><span>Keys</span><span className="text-right">Actions</span>
              </div>
              {users.map((u) => (
                <div key={u.user_id} className="grid sm:grid-cols-[1fr_100px_80px_80px_1fr] gap-4 px-5 py-4 border-b border-border/30 last:border-0 items-center hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium truncate">{u.email}</span>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block">{u.created_at}</span>
                  <span className={`text-xs font-medium hidden sm:block ${u.plan === "pro" ? "text-accent" : "text-muted-foreground"}`}>{u.plan === "pro" ? "Pro" : "Free"}</span>
                  <span className="text-xs text-muted-foreground hidden sm:block">{u.key_count}</span>
                  <div className="flex justify-end gap-1.5 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => { setEditTarget(u); setEditEmail(u.email); setEditPlan(u.plan); }} className="text-xs h-7" title="Edit user">
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setResetTarget(u); setNewPassword(""); }} className="text-xs h-7" title="Reset password">
                      <KeyRound className="h-3 w-3" />
                    </Button>
                    {u.plan === "pro" && (
                      <Button size="sm" variant="outline" onClick={() => { setEditTarget(u); setEditEmail(u.email); setEditPlan("free"); }} className="text-xs h-7" title="Downgrade to Free">
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setDeleteTarget(u)} className="text-xs h-7 text-destructive hover:text-destructive" title="Delete user">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "support" && <AdminSupport />}

        {tab === "email" && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Email All Users</h1>
            <p className="text-sm text-muted-foreground mb-6">Send a branded email to every registered user ({users.length} users).</p>
            <div className="rounded-xl border border-border/50 bg-card/40 p-6 max-w-2xl space-y-4">
              <div>
                <Label>Subject</Label>
                <Input value={massSubject} onChange={(e) => setMassSubject(e.target.value)} placeholder="e.g. New feature: Team Vaults are live!" className="bg-muted/50 mt-1" maxLength={200} />
              </div>
              <div>
                <Label>Message body</Label>
                <Textarea value={massBody} onChange={(e) => setMassBody(e.target.value)} placeholder="Write your message here. Each line becomes a paragraph in the email." rows={8} className="bg-muted/50 mt-1" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleSendMassEmail} disabled={sendingMass || !massSubject.trim() || !massBody.trim()} className="bg-gradient-primary border-0">
                  <Send className="mr-2 h-4 w-4" />
                  {sendingMass ? "Sending..." : `Send to ${users.length} users`}
                </Button>
                <p className="text-xs text-muted-foreground">Emails are sent with Keyper branding.</p>
              </div>
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
                <Input value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="e.g. Keyper Pro is now available!" className="flex-1 bg-muted/50" maxLength={200} />
                <Button size="sm" onClick={saveAnnouncement} className="bg-gradient-primary border-0">Save</Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Password reset dialog */}
      <Dialog open={!!resetTarget} onOpenChange={(o) => !o && setResetTarget(null)}>
        <DialogContent className="bg-card border-border/60 max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Set a new password for <strong>{resetTarget?.email}</strong></p>
          <div>
            <Label>New password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="bg-muted/50 mt-1" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetTarget(null)}>Cancel</Button>
            <Button onClick={handleResetPassword} disabled={resetting} className="bg-gradient-primary border-0">
              {resetting ? "Resetting..." : "Reset password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit user dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="bg-card border-border/60 max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="bg-muted/50 mt-1" />
            </div>
            <div>
              <Label>Plan</Label>
              <Select value={editPlan} onValueChange={setEditPlan}>
                <SelectTrigger className="bg-muted/50 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleEditUser} disabled={editSaving} className="bg-gradient-primary border-0">
              {editSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete user dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="bg-card border-border/60 max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to permanently delete <strong>{deleteTarget?.email}</strong>? This will remove all their data including API keys and cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add user dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="bg-card border-border/60 max-w-sm">
          <DialogHeader>
            <DialogTitle>Add new user</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="user@example.com" className="bg-muted/50 mt-1" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={addPassword} onChange={(e) => setAddPassword(e.target.value)} placeholder="Min 6 characters" className="bg-muted/50 mt-1" />
            </div>
            <div>
              <Label>Plan</Label>
              <Select value={addPlan} onValueChange={setAddPlan}>
                <SelectTrigger className="bg-muted/50 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={adding} className="bg-gradient-primary border-0">
              {adding ? "Creating..." : "Create user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
