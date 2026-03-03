import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  teamId: string;
};

const InviteMemberDialog = ({ open, onClose, teamId }: Props) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("viewer");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email.trim()) return;
    setLoading(true);

    // Look up user by email in profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", email.trim())
      .single();

    if (!profile) {
      toast({ variant: "destructive", title: "User not found", description: "No account found with that email. They must sign up first." });
      setLoading(false);
      return;
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("user_id", profile.user_id)
      .maybeSingle();

    if (existing) {
      toast({ variant: "destructive", title: "Already a member", description: "This user is already in the team." });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("team_members").insert({
      team_id: teamId,
      user_id: profile.user_id,
      role: role,
      accepted: true, // auto-accept for now
    } as any);

    if (error) {
      toast({ variant: "destructive", title: "Failed to invite", description: error.message });
    } else {
      toast({ title: "Member added", description: `${email.trim()} has been added to the team.` });
      setEmail("");
      setRole("viewer");
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border/60 max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email address</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="bg-muted/50"
              type="email"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer — can view keys</SelectItem>
                <SelectItem value="editor">Editor — can add/edit keys</SelectItem>
                <SelectItem value="owner">Owner — full control</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleInvite} disabled={!email.trim() || loading} className="bg-gradient-primary border-0">
            {loading ? "Adding..." : "Add member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberDialog;
