import { useState, useEffect, useCallback } from "react";
import { Plus, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EmptyState from "@/components/dashboard/EmptyState";

type Team = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  member_count?: number;
};

type Props = {
  userId: string;
  onSelectTeam: (teamId: string) => void;
};

const TeamsTab = ({ userId, onSelectTeam }: Props) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadTeams = useCallback(async () => {
    const { data } = await supabase
      .from("teams")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      // Get member counts
      const teamsWithCounts = await Promise.all(
        data.map(async (t: any) => {
          const { count } = await supabase
            .from("team_members")
            .select("*", { count: "exact", head: true })
            .eq("team_id", t.id)
            .eq("accepted", true);
          return { ...t, member_count: count || 0 };
        })
      );
      setTeams(teamsWithCounts);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const handleCreate = async () => {
    if (!teamName.trim()) return;

    const { data: team, error } = await supabase
      .from("teams")
      .insert({ name: teamName.trim(), created_by: userId } as any)
      .select()
      .single();

    if (error) {
      toast({ variant: "destructive", title: "Failed to create team", description: error.message });
      return;
    }

    // Add creator as owner and accepted
    await supabase.from("team_members").insert({
      team_id: team.id,
      user_id: userId,
      role: "owner",
      accepted: true,
    } as any);

    toast({ title: "Team created", description: `${teamName.trim()} is ready.` });
    setTeamName("");
    setShowCreate(false);
    loadTeams();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Team Vaults</h1>
          <p className="text-sm text-muted-foreground">Share API keys securely with your team</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-gradient-primary border-0">
          <Plus className="mr-2 h-4 w-4" />Create team
        </Button>
      </div>

      {teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teams yet"
          description="Create a team to start sharing API keys with collaborators using a shared passphrase."
          actionLabel="Create your first team"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="space-y-3">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => onSelectTeam(team.id)}
              className="w-full rounded-xl border border-border/50 bg-card/40 p-5 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{team.name}</p>
                  <p className="text-xs text-muted-foreground">{team.member_count} member{team.member_count !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border/60 max-w-sm">
          <DialogHeader>
            <DialogTitle>Create team</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <label className="text-sm font-medium mb-1.5 block">Team name</label>
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Engineering"
              className="bg-muted/50"
              maxLength={50}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!teamName.trim()} className="bg-gradient-primary border-0">Create team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamsTab;
