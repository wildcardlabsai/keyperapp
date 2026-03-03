import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, Key, Settings, CreditCard, Activity, LogOut, Lock, Plus, Eye, EyeOff,
  Copy, Trash2, Search, Edit, Download, Upload, Clock, Check, LayoutDashboard,
  AlertTriangle, Unlock, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import AddKeyDialog, { type ApiKeyData } from "@/components/dashboard/AddKeyDialog";
import { supabase } from "@/integrations/supabase/client";
import TwoFactorSetup from "@/components/dashboard/TwoFactorSetup";
import SupportTab from "@/components/dashboard/SupportTab";
import { useToast } from "@/hooks/use-toast";
import { deriveKey, encrypt, decrypt } from "@/lib/crypto";

type Tab = "overview" | "keys" | "settings" | "billing" | "security" | "support";
type ActivityEntry = { action: string; time: string };

const formatDate = (d: string) => {
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
};

const formatDateTime = (d: string) => {
  const date = new Date(d);
  return `${formatDate(d)} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const sidebarItems: { id: Tab; label: string; icon: typeof Key }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "keys", label: "API Keys", icon: Key },
  { id: "support", label: "Support", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "security", label: "Security", icon: Activity },
];

const Dashboard = () => {
  const [tab, setTab] = useState<Tab>("overview");
  const [locked, setLocked] = useState(false);
  const [hasVault, setHasVault] = useState<boolean | null>(null);
  const [vaultInput, setVaultInput] = useState("");
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [revealed, setRevealed] = useState<Map<string, string>>(new Map());
  const [search, setSearch] = useState("");
  const [filterService, setFilterService] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editKey, setEditKey] = useState<ApiKeyData | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [plan, setPlan] = useState("free");
  const [autoLockMin, setAutoLockMin] = useState(10);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const cryptoKeyRef = useRef<CryptoKey | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check Stripe subscription
  const checkSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (!error && data?.subscribed) {
        setPlan("pro");
      }
    } catch {}
  }, []);

  // Load user session & profile
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }
      setUserEmail(session.user.email ?? "");
      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (profile) {
        setHasVault(profile.vault_created);
        setPlan(profile.plan);
        setAutoLockMin(profile.auto_lock_minutes);
      } else {
        setHasVault(false);
      }

      // Check real subscription status from Stripe
      checkSubscription();
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate, checkSubscription]);

  // Load keys (encrypted) from DB after vault is unlocked
  const loadKeys = useCallback(async () => {
    const { data } = await supabase
      .from("api_keys")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setKeys(data.map((k: any) => ({
        id: k.id,
        name: k.name,
        service: k.service,
        environment: k.environment,
        key: "••••••••••••••••••••", // placeholder, decrypt on reveal
        createdAt: formatDate(k.created_at),
        tags: k.tags || "",
        notes: "", // decrypt on demand
        _encrypted_key: k.encrypted_key,
        _iv: k.iv,
        _notes_encrypted: k.notes_encrypted,
        _notes_iv: k.notes_iv,
      })));
    }
  }, []);

  // Load activity log
  const loadActivity = useCallback(async () => {
    const { data } = await supabase
      .from("activity_log")
      .select("action, created_at")
      .order("created_at", { ascending: false })
      .limit(30);

    if (data) {
      setActivityLog(data.map((e: any) => ({ action: e.action, time: formatDateTime(e.created_at) })));
    }
  }, []);

  useEffect(() => {
    if (hasVault && !locked && cryptoKeyRef.current) {
      loadKeys();
      loadActivity();
    }
  }, [hasVault, locked, loadKeys, loadActivity]);

  // Auto-lock timer
  useEffect(() => {
    if (locked || !hasVault) return;
    let timeout: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setLocked(true);
        setRevealed(new Map());
        cryptoKeyRef.current = null;
      }, autoLockMin * 60 * 1000);
    };
    reset();
    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
    };
  }, [locked, hasVault, autoLockMin]);

  const addLog = useCallback(async (action: string) => {
    if (!userId) return;
    await supabase.from("activity_log").insert({ user_id: userId, action });
    setActivityLog((prev) => [{ action, time: formatDateTime(new Date().toISOString()) }, ...prev]);
  }, [userId]);

  const handleReveal = async (id: string) => {
    if (revealed.has(id)) {
      setRevealed((p) => { const n = new Map(p); n.delete(id); return n; });
      return;
    }
    const key = cryptoKeyRef.current;
    if (!key) return;
    const k = keys.find((k) => k.id === id) as any;
    if (!k?._encrypted_key || !k?._iv) return;
    try {
      const plaintext = await decrypt(k._encrypted_key, k._iv, key);
      setRevealed((p) => new Map(p).set(id, plaintext));
      setTimeout(() => setRevealed((p) => { const n = new Map(p); n.delete(id); return n; }), 5000);
    } catch {
      toast({ variant: "destructive", title: "Decryption failed", description: "Wrong passphrase or corrupted data." });
    }
  };

  const handleCopy = async (id: string) => {
    const key = cryptoKeyRef.current;
    if (!key) return;
    const k = keys.find((k) => k.id === id) as any;
    if (!k?._encrypted_key || !k?._iv) return;
    try {
      const plaintext = revealed.has(id) ? revealed.get(id)! : await decrypt(k._encrypted_key, k._iv, key);
      navigator.clipboard.writeText(plaintext);
      toast({ title: "Copied", description: "API key copied to clipboard." });
      addLog(`Key copied: ${k.name}`);
    } catch {
      toast({ variant: "destructive", title: "Failed to copy" });
    }
  };

  const handleAddKey = async (data: Omit<ApiKeyData, "id" | "createdAt">) => {
    const key = cryptoKeyRef.current;
    if (!key || !userId) return;

    if (plan === "free" && keys.length >= 10 && !editKey) {
      setShowAdd(false);
      setShowUpgrade(true);
      return;
    }

    try {
      const encrypted = await encrypt(data.key, key);
      let notesEnc = { ciphertext: "", iv: "" };
      if (data.notes) {
        notesEnc = await encrypt(data.notes, key);
      }

      if (editKey) {
        await supabase.from("api_keys").update({
          name: data.name,
          service: data.service,
          environment: data.environment,
          encrypted_key: encrypted.ciphertext,
          iv: encrypted.iv,
          tags: data.tags,
          notes_encrypted: notesEnc.ciphertext,
          notes_iv: notesEnc.iv,
        }).eq("id", editKey.id);
        addLog(`Key updated: ${data.name}`);
        toast({ title: "Key updated" });
      } else {
        await supabase.from("api_keys").insert({
          user_id: userId,
          name: data.name,
          service: data.service,
          environment: data.environment,
          encrypted_key: encrypted.ciphertext,
          iv: encrypted.iv,
          tags: data.tags,
          notes_encrypted: notesEnc.ciphertext,
          notes_iv: notesEnc.iv,
        });
        addLog(`Key added: ${data.name}`);
        toast({ title: "Key added", description: `${data.name} has been saved to your vault.` });
      }

      setShowAdd(false);
      setEditKey(null);
      loadKeys();
    } catch (err) {
      toast({ variant: "destructive", title: "Encryption error", description: "Failed to encrypt key." });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const k = keys.find((k) => k.id === deleteId);
    await supabase.from("api_keys").delete().eq("id", deleteId);
    addLog(`Key deleted: ${k?.name}`);
    toast({ title: "Key deleted" });
    setDeleteId(null);
    loadKeys();
  };

  const createVault = async () => {
    if (vaultInput.length < 6) {
      toast({ variant: "destructive", title: "Passphrase too short", description: "Must be at least 6 characters." });
      return;
    }
    const derived = await deriveKey(vaultInput, userId);
    cryptoKeyRef.current = derived;
    await supabase.from("profiles").update({ vault_created: true }).eq("user_id", userId);
    setHasVault(true);
    addLog("Vault created");
    toast({ title: "Vault created", description: "Your vault is ready. Remember your passphrase — it cannot be recovered." });
    setVaultInput("");
  };

  const unlockVault = async () => {
    try {
      const derived = await deriveKey(vaultInput, userId);
      cryptoKeyRef.current = derived;
      setLocked(false);
      addLog("Vault unlocked");
      toast({ title: "Vault unlocked" });
      setVaultInput("");
    } catch {
      toast({ variant: "destructive", title: "Failed to derive key" });
    }
  };

  const handleLogout = async () => {
    cryptoKeyRef.current = null;
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleExport = async () => {
    const { data } = await supabase.from("api_keys").select("*");
    if (!data || data.length === 0) {
      toast({ title: "Nothing to export", description: "Your vault is empty." });
      return;
    }
    const backup = {
      version: 1,
      exported_at: new Date().toISOString(),
      keys: data.map((k: any) => ({
        name: k.name,
        service: k.service,
        environment: k.environment,
        encrypted_key: k.encrypted_key,
        iv: k.iv,
        tags: k.tags,
        notes_encrypted: k.notes_encrypted,
        notes_iv: k.notes_iv,
      })),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keyper-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog("Encrypted backup exported");
    toast({ title: "Backup exported" });
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const backup = JSON.parse(text);
        if (!backup.keys || !Array.isArray(backup.keys)) throw new Error("Invalid backup format");
        for (const k of backup.keys) {
          await supabase.from("api_keys").insert({
            user_id: userId,
            name: k.name,
            service: k.service || "Other",
            environment: k.environment || "Production",
            encrypted_key: k.encrypted_key,
            iv: k.iv,
            tags: k.tags || "",
            notes_encrypted: k.notes_encrypted || "",
            notes_iv: k.notes_iv || "",
          });
        }
        addLog(`Imported ${backup.keys.length} keys from backup`);
        toast({ title: "Import complete", description: `${backup.keys.length} keys imported.` });
        loadKeys();
      } catch {
        toast({ variant: "destructive", title: "Import failed", description: "Invalid backup file." });
      }
    };
    input.click();
  };

  const handleUpdateAutoLock = async (val: number) => {
    setAutoLockMin(val);
    await supabase.from("profiles").update({ auto_lock_minutes: val }).eq("user_id", userId);
  };

  const handleUpgrade = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Checkout failed", description: err.message });
    }
    setShowUpgrade(false);
  };

  const handleChangePassword = async () => {
    const newPw = prompt("Enter new password (min 8 chars):");
    if (!newPw || newPw.length < 8) {
      toast({ variant: "destructive", title: "Password too short" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else { toast({ title: "Password updated" }); addLog("Password changed"); }
  };

  const filteredKeys = keys.filter((k) => {
    const matchSearch = !search || k.name.toLowerCase().includes(search.toLowerCase()) || k.service.toLowerCase().includes(search.toLowerCase()) || k.tags.toLowerCase().includes(search.toLowerCase());
    const matchService = filterService === "all" || k.service === filterService;
    return matchSearch && matchService;
  });

  // Loading state
  if (hasVault === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Vault setup screen
  if (!hasVault) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Create your vault passphrase</h1>
          <p className="text-muted-foreground mb-1 text-sm">This passphrase encrypts your API keys. It is separate from your login password.</p>
          <p className="text-destructive/80 text-xs mb-6 font-medium flex items-center justify-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> This passphrase cannot be recovered if lost.</p>
          <Input value={vaultInput} onChange={(e) => setVaultInput(e.target.value)} type="password" placeholder="Enter a strong passphrase" className="bg-card/60 mb-4" />
          <Button onClick={createVault} className="w-full bg-gradient-primary border-0">Create vault</Button>
          <button onClick={handleLogout} className="mt-4 text-sm text-muted-foreground hover:text-foreground">Sign out</button>
        </div>
      </div>
    );
  }

  // Lock screen
  if (locked || !cryptoKeyRef.current) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Vault locked</h1>
          <p className="text-muted-foreground text-sm mb-6">Enter your passphrase to unlock.</p>
          <Input value={vaultInput} onChange={(e) => setVaultInput(e.target.value)} type="password" placeholder="Vault passphrase" className="bg-card/60 mb-4" onKeyDown={(e) => e.key === "Enter" && unlockVault()} />
          <Button onClick={unlockVault} className="w-full bg-gradient-primary border-0">Unlock vault</Button>
          <button onClick={handleLogout} className="mt-4 text-sm text-muted-foreground hover:text-foreground">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-sidebar p-4">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">Keyper</span>
        </div>
        <nav className="space-y-1 flex-1">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
              <item.icon className="h-4 w-4" />{item.label}
            </button>
          ))}
        </nav>
        <div className="space-y-2 pt-4 border-t border-border/40">
          <button onClick={() => { setLocked(true); setRevealed(new Map()); cryptoKeyRef.current = null; addLog("Vault locked manually"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50">
            <Lock className="h-4 w-4" />Lock vault
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50">
            <LogOut className="h-4 w-4" />Sign out
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur flex">
        {sidebarItems.map((item) => (
          <button key={item.id} onClick={() => setTab(item.id)} className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${tab === item.id ? "text-primary" : "text-muted-foreground"}`}>
            <item.icon className="h-4 w-4" />{item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 overflow-auto">
        {/* Overview */}
        {tab === "overview" && (
          <div>
            <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
            <p className="text-muted-foreground text-sm mb-8">Welcome back, {userEmail}</p>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total keys", value: keys.length, icon: Key },
                { label: "Plan", value: plan === "pro" ? "Pro" : "Free", icon: CreditCard },
                { label: "Vault status", value: "Unlocked", icon: Unlock },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border/50 bg-card/40 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><s.icon className="h-4 w-4 text-primary" /></div>
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                  </div>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-border/50 bg-card/40 p-6">
              <h3 className="font-semibold mb-4">Getting started</h3>
              <div className="space-y-3">
                {[
                  { done: true, text: "Create vault" },
                  { done: keys.length > 0, text: "Add first API key" },
                  { done: true, text: "Learn how keys are protected" },
                  { done: false, text: "Export encrypted backup" },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${item.done ? "bg-accent/5" : "bg-muted/30"}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${item.done ? "bg-accent/20" : "border border-border"}`}>
                      {item.done && <Check className="h-3.5 w-3.5 text-accent" />}
                    </div>
                    <span className={`text-sm ${item.done ? "text-foreground" : "text-muted-foreground"}`}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Keys */}
        {tab === "keys" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">API Keys</h1>
                <p className="text-sm text-muted-foreground">{keys.length}{plan === "free" ? " / 10" : ""} keys stored</p>
              </div>
              <Button onClick={() => { if (plan === "free" && keys.length >= 10) { setShowUpgrade(true); } else { setShowAdd(true); } }} className="bg-gradient-primary border-0">
                <Plus className="mr-2 h-4 w-4" />Add key
              </Button>
            </div>
            <div className="flex gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search keys..." className="pl-9 bg-card/60" />
              </div>
              <Select value={filterService} onValueChange={setFilterService}>
                <SelectTrigger className="w-36 bg-card/60"><SelectValue placeholder="All services" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All services</SelectItem>
                  {["OpenAI", "Google", "AWS", "Stripe", "Other"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {filteredKeys.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Key className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No keys found</p>
                <p className="text-sm mt-1">{keys.length === 0 ? "Add your first API key to get started." : "Try adjusting your search or filters."}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border/50 bg-card/40 overflow-hidden">
                <div className="hidden sm:grid grid-cols-[1fr_100px_80px_90px_120px] gap-4 px-5 py-3 text-xs text-muted-foreground font-medium border-b border-border/40">
                  <span>Name / Key</span><span>Service</span><span>Env</span><span>Created</span><span className="text-right">Actions</span>
                </div>
                {filteredKeys.map((k) => (
                  <div key={k.id} className="grid sm:grid-cols-[1fr_100px_80px_90px_120px] gap-4 px-5 py-4 border-b border-border/30 last:border-0 items-center hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{k.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        {revealed.has(k.id) ? revealed.get(k.id) : "••••••••••••••••••••"}
                      </p>
                      {k.tags && <div className="flex gap-1 mt-1.5">{k.tags.split(",").map((t) => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{t.trim()}</span>)}</div>}
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:block">{k.service}</span>
                    <span className="text-xs text-muted-foreground hidden sm:block">{k.environment}</span>
                    <span className="text-xs text-muted-foreground hidden sm:block">{k.createdAt}</span>
                    <div className="flex items-center gap-1.5 justify-end">
                      <button onClick={() => handleReveal(k.id)} className="h-8 w-8 rounded-md bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-colors" title={revealed.has(k.id) ? "Hide" : "Reveal"}>
                        {revealed.has(k.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => handleCopy(k.id)} className="h-8 w-8 rounded-md bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-colors" title="Copy">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => { setEditKey(k); setShowAdd(true); }} className="h-8 w-8 rounded-md bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-colors" title="Edit">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(k.id)} className="h-8 w-8 rounded-md bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors text-destructive" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {tab === "settings" && (
          <div className="max-w-xl">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <div className="space-y-6">
              <div className="rounded-xl border border-border/50 bg-card/40 p-6">
                <h3 className="font-semibold mb-4">Profile</h3>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="text-sm font-medium">{userEmail}</p>
                </div>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/40 p-6">
                <h3 className="font-semibold mb-4">Security</h3>
                <div className="space-y-4">
                  <Button variant="outline" size="sm" onClick={handleChangePassword}>Change password</Button>
                  <div className="border-t border-border/40 pt-4">
                    <TwoFactorSetup />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/40 p-6">
                <h3 className="font-semibold mb-4">Vault auto-lock</h3>
                <div className="flex items-center gap-4">
                  <label className="text-sm text-muted-foreground">Lock after</label>
                  <Select value={String(autoLockMin)} onValueChange={(v) => handleUpdateAutoLock(Number(v))}>
                    <SelectTrigger className="w-32 bg-muted/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 30, 60].map((m) => <SelectItem key={m} value={String(m)}>{m} min</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-xl border border-destructive/30 bg-card/40 p-6">
                <h3 className="font-semibold mb-2 text-destructive">Danger zone</h3>
                <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data.</p>
                <Button variant="destructive" size="sm">Delete account</Button>
              </div>
            </div>
          </div>
        )}

        {/* Billing */}
        {tab === "billing" && (
          <div className="max-w-xl">
            <h1 className="text-2xl font-bold mb-6">Billing</h1>
            <div className="rounded-xl border border-border/50 bg-card/40 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current plan</p>
                  <p className="text-xl font-bold">{plan === "pro" ? "Pro" : "Free"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-xl font-bold">{plan === "pro" ? "£4.99" : "£0"}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-border/40">
                <span className="text-sm text-muted-foreground">Keys used</span>
                <span className="text-sm font-medium">{keys.length}{plan === "free" ? " / 10" : " / ∞"}</span>
              </div>
            </div>
            {plan === "free" ? (
              <Button onClick={handleUpgrade} className="bg-gradient-primary border-0">Upgrade to Pro — £4.99/month</Button>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                  <p className="text-sm"><strong>Pro</strong> — Your subscription is active.</p>
                </div>
                <Button variant="outline" size="sm" onClick={async () => {
                  try {
                    const { data, error } = await supabase.functions.invoke("customer-portal");
                    if (error) throw error;
                    if (data?.url) window.open(data.url, "_blank");
                  } catch (err: any) {
                    toast({ variant: "destructive", title: "Error", description: err.message });
                  }
                }}>Manage subscription</Button>
              </div>
            )}
          </div>
        )}

        {/* Security */}
        {tab === "security" && (
          <div className="max-w-xl">
            <h1 className="text-2xl font-bold mb-6">Security</h1>
            <div className="flex gap-3 mb-6">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />Export backup
              </Button>
              <Button variant="outline" size="sm" onClick={handleImport}>
                <Upload className="mr-2 h-4 w-4" />Import backup
              </Button>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/40 p-6">
              <h3 className="font-semibold mb-4">Activity log</h3>
              {activityLog.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {activityLog.slice(0, 20).map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground flex-1">{entry.action}</span>
                      <span className="text-xs text-muted-foreground">{entry.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Support */}
        {tab === "support" && <SupportTab userEmail={userEmail} userId={userId} />}
      </main>

      {/* Dialogs */}
      <AddKeyDialog open={showAdd} onClose={() => { setShowAdd(false); setEditKey(null); }} onSave={handleAddKey} editData={editKey} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API key</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The key will be permanently removed from your vault.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent className="bg-card border-border/60 max-w-sm">
          <DialogHeader>
            <DialogTitle>Upgrade to Pro</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-4">You've reached the free plan limit of 10 keys. Upgrade to Pro for unlimited key storage.</p>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 mb-4">
              <p className="font-semibold">Pro — £4.99/month</p>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-accent" />Unlimited keys</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-accent" />Priority support</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-accent" />Advanced activity log</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgrade(false)}>Not now</Button>
            <Button onClick={handleUpgrade} className="bg-gradient-primary border-0">Upgrade to Pro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
