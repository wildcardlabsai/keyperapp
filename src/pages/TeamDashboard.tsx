import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Shield, Key, Users, Plus, Eye, EyeOff, Copy, Trash2, Edit, ArrowLeft,
  Lock, UserPlus, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddKeyDialog, { type ApiKeyData } from "@/components/dashboard/AddKeyDialog";
import InviteMemberDialog from "@/components/dashboard/InviteMemberDialog";
import EmptyState from "@/components/dashboard/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { deriveKey, encrypt, decrypt } from "@/lib/crypto";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Member = { id: string; user_id: string; role: string; email?: string };

const TeamDashboard = () => {
  const { id: teamId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [revealed, setRevealed] = useState<Map<string, string>>(new Map());
  const [locked, setLocked] = useState(true);
  const [passphrase, setPassphrase] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editKey, setEditKey] = useState<ApiKeyData | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [userId, setUserId] = useState("");
  const [myRole, setMyRole] = useState<string>("");
  const cryptoKeyRef = useRef<CryptoKey | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }
      setUserId(session.user.id);

      if (!teamId) return;

      const { data: t } = await supabase.from("teams").select("*").eq("id", teamId).single();
      if (!t) { navigate("/dashboard"); return; }
      setTeam(t);

      // Get my role
      const { data: membership } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", teamId)
        .eq("user_id", session.user.id)
        .single();

      if (membership) setMyRole(membership.role);
    };
    init();
  }, [teamId, navigate]);

  const loadMembers = useCallback(async () => {
    if (!teamId) return;
    const { data } = await supabase
      .from("team_members")
      .select("id, user_id, role")
      .eq("team_id", teamId)
      .eq("accepted", true);

    if (data) {
      // Get emails from profiles
      const memberData = await Promise.all(
        data.map(async (m: any) => {
          const { data: profile } = await supabase.from("profiles").select("email").eq("user_id", m.user_id).single();
          return { ...m, email: profile?.email || "Unknown" };
        })
      );
      setMembers(memberData);
    }
  }, [teamId]);

  const loadKeys = useCallback(async () => {
    if (!teamId) return;
    const { data } = await supabase
      .from("team_keys")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });

    if (data) {
      setKeys(data.map((k: any) => ({
        id: k.id,
        name: k.name,
        service: k.service,
        environment: k.environment,
        key: "••••••••••••••••••••",
        createdAt: new Date(k.created_at).toLocaleDateString(),
        tags: k.tags || "",
        notes: "",
        expiresAt: k.expires_at || null,
        _encrypted_key: k.encrypted_key,
        _iv: k.iv,
      })));
    }
  }, [teamId]);

  useEffect(() => {
    if (!locked && cryptoKeyRef.current) {
      loadKeys();
      loadMembers();
    }
  }, [locked, loadKeys, loadMembers]);

  const unlockTeam = async () => {
    if (!teamId) return;
    try {
      const derived = await deriveKey(passphrase, teamId);
      cryptoKeyRef.current = derived;
      setLocked(false);
      setPassphrase("");
      toast({ title: "Team vault unlocked" });
    } catch {
      toast({ variant: "destructive", title: "Failed to unlock" });
    }
  };

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
      toast({ variant: "destructive", title: "Decryption failed", description: "Wrong team passphrase." });
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
      toast({ title: "Copied" });
    } catch {
      toast({ variant: "destructive", title: "Failed to copy" });
    }
  };

  const handleAddKey = async (data: Omit<ApiKeyData, "id" | "createdAt">) => {
    const key = cryptoKeyRef.current;
    if (!key || !teamId) return;
    try {
      const encrypted = await encrypt(data.key, key);
      if (editKey) {
        await supabase.from("team_keys").update({
          name: data.name,
          service: data.service,
          environment: data.environment,
          encrypted_key: encrypted.ciphertext,
          iv: encrypted.iv,
          tags: data.tags,
          expires_at: data.expiresAt || null,
        } as any).eq("id", editKey.id);
        toast({ title: "Key updated" });
      } else {
        await supabase.from("team_keys").insert({
          team_id: teamId,
          added_by: userId,
          name: data.name,
          service: data.service,
          environment: data.environment,
          encrypted_key: encrypted.ciphertext,
          iv: encrypted.iv,
          tags: data.tags,
          expires_at: data.expiresAt || null,
        } as any);
        toast({ title: "Key added" });
      }
      setShowAdd(false);
      setEditKey(null);
      loadKeys();
    } catch {
      toast({ variant: "destructive", title: "Failed to save key" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from("team_keys").delete().eq("id", deleteId);
    toast({ title: "Key deleted" });
    setDeleteId(null);
    loadKeys();
  };

  const canEdit = myRole === "owner" || myRole === "editor";
  const isOwner = myRole === "owner";

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (locked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <img src={keyperIcon} alt="Keyper" className="h-14 w-14" />
          </div>
          <h1 className="text-2xl font-bold mb-1">{team.name}</h1>
          <p className="text-muted-foreground text-sm mb-6">Enter the team passphrase to unlock this vault.</p>
          <Input
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            type="password"
            placeholder="Team passphrase"
            className="bg-card/60 mb-4"
            onKeyDown={(e) => e.key === "Enter" && unlockTeam()}
          />
          <Button onClick={unlockTeam} className="w-full bg-gradient-primary border-0 mb-3">Unlock</Button>
          <button onClick={() => navigate("/dashboard")} className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to dashboard
          </button>
          <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            The team owner sets the passphrase and shares it with members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/dashboard")} className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{team.name}</h1>
            <p className="text-sm text-muted-foreground">{members.length} member{members.length !== 1 ? "s" : ""} · {keys.length} key{keys.length !== 1 ? "s" : ""}</p>
          </div>
          {canEdit && (
            <Button onClick={() => setShowAdd(true)} className="bg-gradient-primary border-0">
              <Plus className="mr-2 h-4 w-4" />Add key
            </Button>
          )}
        </div>

        {/* Members */}
        <div className="rounded-xl border border-border/50 bg-card/40 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4" /> Members</h3>
            {isOwner && (
              <Button variant="outline" size="sm" onClick={() => setShowInvite(true)}>
                <UserPlus className="mr-2 h-3.5 w-3.5" />Invite
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 text-sm">
                <span>{m.email}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Keys */}
        {keys.length === 0 ? (
          <EmptyState
            icon={Key}
            title="No team keys yet"
            description="Add your first shared API key to this team vault."
            actionLabel={canEdit ? "Add first key" : undefined}
            onAction={canEdit ? () => setShowAdd(true) : undefined}
          />
        ) : (
          <div className="rounded-xl border border-border/50 bg-card/40 overflow-hidden">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center gap-4 px-5 py-4 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{k.name}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                    {revealed.has(k.id) ? revealed.get(k.id) : "••••••••••••••••••••"}
                  </p>
                  {k.tags && <div className="flex gap-1 mt-1">{k.tags.split(",").map((t) => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{t.trim()}</span>)}</div>}
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block">{k.service}</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleReveal(k.id)} className="h-8 w-8 rounded-md bg-secondary/60 flex items-center justify-center hover:bg-secondary" title="Reveal">
                    {revealed.has(k.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => handleCopy(k.id)} className="h-8 w-8 rounded-md bg-secondary/60 flex items-center justify-center hover:bg-secondary" title="Copy">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  {canEdit && (
                    <button onClick={() => { setEditKey(k); setShowAdd(true); }} className="h-8 w-8 rounded-md bg-secondary/60 flex items-center justify-center hover:bg-secondary" title="Edit">
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {isOwner && (
                    <button onClick={() => setDeleteId(k.id)} className="h-8 w-8 rounded-md bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 text-destructive" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddKeyDialog open={showAdd} onClose={() => { setShowAdd(false); setEditKey(null); }} onSave={handleAddKey} editData={editKey} />
      <InviteMemberDialog open={showInvite} onClose={() => { setShowInvite(false); loadMembers(); }} teamId={teamId!} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete team key</AlertDialogTitle>
            <AlertDialogDescription>This key will be permanently removed from the team vault.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamDashboard;
