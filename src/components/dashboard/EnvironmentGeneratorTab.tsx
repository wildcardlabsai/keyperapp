import { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, Copy, Check, Eye, EyeOff, Edit, Download, FolderOpen,
  ChevronRight, ArrowLeft, FileCode, Server, Container, GitBranch
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { encrypt, decrypt } from "@/lib/crypto";
import EmptyState from "./EmptyState";

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface Environment {
  id: string;
  name: string;
  project_id: string;
  created_at: string;
}

interface EnvVariable {
  id: string;
  key_name: string;
  provider_hint: string | null;
  ciphertext: string;
  iv: string;
  created_at: string;
}

interface Props {
  userId: string;
  cryptoKey: CryptoKey | null;
}

const EnvironmentGeneratorTab = ({ userId, cryptoKey }: Props) => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);
  const [variables, setVariables] = useState<EnvVariable[]>([]);
  const [revealed, setRevealed] = useState<Map<string, string>>(new Map());
  const [copied, setCopied] = useState<string | null>(null);

  // Dialogs
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [showNewEnv, setShowNewEnv] = useState(false);
  const [newEnvName, setNewEnvName] = useState("");
  const [showAddVar, setShowAddVar] = useState(false);
  const [newVarName, setNewVarName] = useState("");
  const [newVarValue, setNewVarValue] = useState("");
  const [newVarProvider, setNewVarProvider] = useState("");
  const [editVar, setEditVar] = useState<EnvVariable | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"project" | "env" | "var">("var");

  // Generator state
  const [activeView, setActiveView] = useState<"list" | "project" | "generate">("list");
  const [genProjectId, setGenProjectId] = useState("");
  const [genEnvName, setGenEnvName] = useState("");
  const [genOutput, setGenOutput] = useState<{ key_name: string; value: string }[]>([]);
  const [genLoading, setGenLoading] = useState(false);
  const [genDecrypted, setGenDecrypted] = useState(false);

  // Load projects
  const loadProjects = useCallback(async () => {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (data) setProjects(data as Project[]);
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  // Load environments for selected project
  const loadEnvironments = useCallback(async (projectId: string) => {
    const { data } = await supabase.from("environments").select("*").eq("project_id", projectId).order("created_at", { ascending: true });
    if (data) setEnvironments(data as Environment[]);
  }, []);

  // Load variables for selected environment
  const loadVariables = useCallback(async (envId: string) => {
    const { data } = await supabase.from("environment_variables").select("*").eq("environment_id", envId).order("key_name", { ascending: true });
    if (data) setVariables(data as EnvVariable[]);
  }, []);

  const selectProject = (p: Project) => {
    setSelectedProject(p);
    setSelectedEnv(null);
    setVariables([]);
    setRevealed(new Map());
    loadEnvironments(p.id);
    setActiveView("project");
  };

  const selectEnv = (e: Environment) => {
    setSelectedEnv(e);
    setRevealed(new Map());
    loadVariables(e.id);
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "Copied to clipboard" });
  };

  // CRUD: Projects
  const createProject = async () => {
    if (!newProjectName.trim()) return;
    const { error } = await supabase.from("projects").insert({
      user_id: userId, name: newProjectName.trim(), description: newProjectDesc.trim() || null,
    } as any);
    if (error) { toast({ variant: "destructive", title: "Error", description: error.message }); return; }
    setShowNewProject(false);
    setNewProjectName("");
    setNewProjectDesc("");
    loadProjects();
    toast({ title: "Project created" });
  };

  // CRUD: Environments
  const createEnv = async () => {
    if (!newEnvName.trim() || !selectedProject) return;
    const { error } = await supabase.from("environments").insert({
      project_id: selectedProject.id, name: newEnvName.trim().toLowerCase(),
    } as any);
    if (error) { toast({ variant: "destructive", title: "Error", description: error.message }); return; }
    setShowNewEnv(false);
    setNewEnvName("");
    loadEnvironments(selectedProject.id);
    toast({ title: "Environment created" });
  };

  // CRUD: Variables
  const saveVariable = async () => {
    if (!newVarName.trim() || !newVarValue.trim() || !selectedEnv || !cryptoKey) return;
    try {
      const encrypted = await encrypt(newVarValue, cryptoKey);
      if (editVar) {
        await supabase.from("environment_variables").update({
          key_name: newVarName.trim().toUpperCase(),
          provider_hint: newVarProvider.trim() || null,
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
        } as any).eq("id", editVar.id);
        toast({ title: "Variable updated" });
      } else {
        await supabase.from("environment_variables").insert({
          environment_id: selectedEnv.id,
          key_name: newVarName.trim().toUpperCase(),
          provider_hint: newVarProvider.trim() || null,
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
        } as any);
        toast({ title: "Variable added" });
      }
      setShowAddVar(false);
      setEditVar(null);
      setNewVarName("");
      setNewVarValue("");
      setNewVarProvider("");
      loadVariables(selectedEnv.id);
    } catch {
      toast({ variant: "destructive", title: "Encryption failed" });
    }
  };

  const handleRevealVar = async (v: EnvVariable) => {
    if (revealed.has(v.id)) {
      setRevealed((p) => { const n = new Map(p); n.delete(v.id); return n; });
      return;
    }
    if (!cryptoKey) { toast({ variant: "destructive", title: "Vault locked" }); return; }
    try {
      const plain = await decrypt(v.ciphertext, v.iv, cryptoKey);
      setRevealed((p) => new Map(p).set(v.id, plain));
      setTimeout(() => setRevealed((p) => { const n = new Map(p); n.delete(v.id); return n; }), 5000);
    } catch {
      toast({ variant: "destructive", title: "Decryption failed" });
    }
  };

  const handleEditVar = async (v: EnvVariable) => {
    setEditVar(v);
    setNewVarName(v.key_name);
    setNewVarProvider(v.provider_hint || "");
    if (cryptoKey) {
      try {
        const plain = await decrypt(v.ciphertext, v.iv, cryptoKey);
        setNewVarValue(plain);
      } catch { setNewVarValue(""); }
    }
    setShowAddVar(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    if (deleteType === "var") {
      await supabase.from("environment_variables").delete().eq("id", deleteId);
      if (selectedEnv) loadVariables(selectedEnv.id);
    } else if (deleteType === "env") {
      await supabase.from("environments").delete().eq("id", deleteId);
      if (selectedProject) loadEnvironments(selectedProject.id);
      if (selectedEnv?.id === deleteId) { setSelectedEnv(null); setVariables([]); }
    } else {
      await supabase.from("projects").delete().eq("id", deleteId);
      loadProjects();
      if (selectedProject?.id === deleteId) { setSelectedProject(null); setActiveView("list"); }
    }
    setDeleteId(null);
    toast({ title: "Deleted" });
  };

  // .env generator
  const generateEnv = async () => {
    if (!genProjectId || !genEnvName || !cryptoKey) return;
    setGenLoading(true);
    setGenDecrypted(false);
    try {
      // Find environment
      const { data: envs } = await supabase.from("environments").select("id").eq("project_id", genProjectId).eq("name", genEnvName);
      if (!envs || envs.length === 0) { toast({ variant: "destructive", title: "Environment not found" }); return; }
      const { data: vars } = await supabase.from("environment_variables").select("*").eq("environment_id", envs[0].id).order("key_name", { ascending: true });
      if (!vars || vars.length === 0) { toast({ title: "No variables found" }); setGenOutput([]); return; }

      const decrypted = await Promise.all(
        vars.map(async (v: any) => {
          try {
            const plain = await decrypt(v.ciphertext, v.iv, cryptoKey);
            return { key_name: v.key_name, value: plain };
          } catch {
            return { key_name: v.key_name, value: "[DECRYPTION_FAILED]" };
          }
        })
      );
      setGenOutput(decrypted);
      setGenDecrypted(true);
    } catch {
      toast({ variant: "destructive", title: "Generation failed" });
    } finally {
      setGenLoading(false);
    }
  };

  const envFileContent = genOutput.map((v) => `${v.key_name}=${v.value}`).join("\n");
  const maskedEnvContent = genOutput.map((v) => `${v.key_name}=••••••••`).join("\n");
  const dockerSnippet = genOutput.map((v) => `  ${v.key_name}: \${${v.key_name}}`).join("\n");
  const githubSnippet = genOutput.map((v) => `  ${v.key_name}: \${{ secrets.${v.key_name} }}`).join("\n");

  const downloadEnv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ===== PROJECT LIST VIEW =====
  if (activeView === "list") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Projects</h2>
            <p className="text-xs text-muted-foreground">Organize secrets by project and environment</p>
          </div>
          <Button size="sm" onClick={() => setShowNewProject(true)}>
            <Plus className="h-4 w-4 mr-1" />New Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="Create your first project"
            description="Start generating .env files by creating a project to organize your secrets."
            action={<Button size="sm" onClick={() => setShowNewProject(true)}><Plus className="h-4 w-4 mr-1" />Create Project</Button>}
          />
        ) : (
          <div className="grid gap-2">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => selectProject(p)}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-card/40 p-4 text-left hover:bg-card/60 transition-colors group"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  {p.description && <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">Created {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            ))}
          </div>
        )}

        {/* Generator shortcut */}
        {projects.length > 0 && (
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <FileCode className="h-4 w-4 text-accent" />
              Quick Generate .env
            </h3>
            <div className="flex gap-2 flex-wrap">
              <Select value={genProjectId} onValueChange={(v) => { setGenProjectId(v); setGenEnvName(""); setGenOutput([]); }}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <EnvSelector projectId={genProjectId} value={genEnvName} onChange={setGenEnvName} />
              <Button size="sm" onClick={generateEnv} disabled={!genProjectId || !genEnvName || !cryptoKey || genLoading}>
                {genLoading ? "Generating..." : "Generate"}
              </Button>
            </div>
            {!cryptoKey && <p className="text-xs text-destructive mt-2">Unlock your vault first to generate .env files</p>}
            {genOutput.length > 0 && (
              <GeneratedOutput
                envContent={envFileContent}
                maskedContent={maskedEnvContent}
                dockerSnippet={dockerSnippet}
                githubSnippet={githubSnippet}
                decrypted={genDecrypted}
                onCopy={copyText}
                onDownload={downloadEnv}
                copied={copied}
                envName={genEnvName}
              />
            )}
          </div>
        )}

        {/* Dialogs */}
        <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
          <DialogContent className="bg-card border-border/60 max-w-sm">
            <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Project name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
              <Input placeholder="Description (optional)" value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewProject(false)}>Cancel</Button>
              <Button onClick={createProject}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ===== PROJECT DETAIL VIEW =====
  if (activeView === "project" && selectedProject) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { setActiveView("list"); setSelectedProject(null); setSelectedEnv(null); }}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{selectedProject.name}</h2>
            {selectedProject.description && <p className="text-xs text-muted-foreground">{selectedProject.description}</p>}
          </div>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { setDeleteId(selectedProject.id); setDeleteType("project"); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Environments */}
        <div className="rounded-xl border border-border/50 bg-card/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Environments</h3>
            <Button size="sm" variant="outline" onClick={() => setShowNewEnv(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" />Add
            </Button>
          </div>
          {environments.length === 0 ? (
            <p className="text-xs text-muted-foreground">No environments yet. Create one like "local", "staging", or "production".</p>
          ) : (
            <div className="flex gap-1.5 flex-wrap">
              {environments.map((e) => (
                <button
                  key={e.id}
                  onClick={() => selectEnv(e)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedEnv?.id === e.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {e.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Variables table */}
        {selectedEnv && (
          <div className="rounded-xl border border-border/50 bg-card/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm">Variables — {selectedEnv.name}</h3>
                <p className="text-[10px] text-muted-foreground">{variables.length} variable{variables.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => { setDeleteId(selectedEnv.id); setDeleteType("env"); }}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" />Delete Env
                </Button>
                <Button size="sm" onClick={() => { setEditVar(null); setNewVarName(""); setNewVarValue(""); setNewVarProvider(""); setShowAddVar(true); }} disabled={!cryptoKey}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Add Variable
                </Button>
              </div>
            </div>

            {!cryptoKey && <p className="text-xs text-destructive mb-3">Unlock your vault to manage variables</p>}

            {variables.length === 0 ? (
              <EmptyState icon={Server} title="No variables" description="Add your first environment variable to this environment." />
            ) : (
              <div className="space-y-1">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 text-[10px] text-muted-foreground font-medium px-3 py-1">
                  <span>VARIABLE</span><span>PROVIDER</span><span>CREATED</span><span>ACTIONS</span>
                </div>
                {variables.map((v) => (
                  <div key={v.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center rounded-lg border border-border/20 bg-background/30 px-3 py-2.5">
                    <div>
                      <code className="text-xs font-mono font-medium">{v.key_name}</code>
                      {revealed.has(v.id) && (
                        <p className="text-[10px] text-accent font-mono mt-0.5 break-all">{revealed.get(v.id)}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{v.provider_hint || "—"}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRevealVar(v)} disabled={!cryptoKey}>
                        {revealed.has(v.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => {
                        if (!cryptoKey) return;
                        try {
                          const plain = revealed.has(v.id) ? revealed.get(v.id)! : await decrypt(v.ciphertext, v.iv, cryptoKey);
                          copyText(plain, v.id);
                        } catch { toast({ variant: "destructive", title: "Failed" }); }
                      }} disabled={!cryptoKey}>
                        {copied === v.id ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditVar(v)} disabled={!cryptoKey}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setDeleteId(v.id); setDeleteType("var"); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick generate for this env */}
            {variables.length > 0 && cryptoKey && (
              <div className="mt-4 pt-4 border-t border-border/30">
                <Button size="sm" variant="outline" onClick={async () => {
                  setGenProjectId(selectedProject.id);
                  setGenEnvName(selectedEnv.name);
                  await generateEnvForCurrentView();
                }}>
                  <FileCode className="h-3.5 w-3.5 mr-1" />Generate .env for {selectedEnv.name}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Inline generated output */}
        {selectedEnv && genOutput.length > 0 && genEnvName === selectedEnv.name && genProjectId === selectedProject.id && (
          <GeneratedOutput
            envContent={envFileContent}
            maskedContent={maskedEnvContent}
            dockerSnippet={dockerSnippet}
            githubSnippet={githubSnippet}
            decrypted={genDecrypted}
            onCopy={copyText}
            onDownload={downloadEnv}
            copied={copied}
            envName={genEnvName}
          />
        )}

        {/* Dialogs */}
        <Dialog open={showNewEnv} onOpenChange={setShowNewEnv}>
          <DialogContent className="bg-card border-border/60 max-w-sm">
            <DialogHeader><DialogTitle>New Environment</DialogTitle></DialogHeader>
            <Input placeholder="e.g. local, staging, production" value={newEnvName} onChange={(e) => setNewEnvName(e.target.value)} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewEnv(false)}>Cancel</Button>
              <Button onClick={createEnv}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddVar} onOpenChange={(o) => { if (!o) { setShowAddVar(false); setEditVar(null); } }}>
          <DialogContent className="bg-card border-border/60 max-w-sm">
            <DialogHeader><DialogTitle>{editVar ? "Edit Variable" : "Add Variable"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="VARIABLE_NAME" value={newVarName} onChange={(e) => setNewVarName(e.target.value.toUpperCase())} className="font-mono" />
              <Input placeholder="Secret value" type="password" value={newVarValue} onChange={(e) => setNewVarValue(e.target.value)} />
              <Input placeholder="Provider hint (e.g. OpenAI, Stripe)" value={newVarProvider} onChange={(e) => setNewVarProvider(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowAddVar(false); setEditVar(null); }}>Cancel</Button>
              <Button onClick={saveVariable}>{editVar ? "Update" : "Add"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
          <AlertDialogContent className="bg-card border-border/60">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteType === "project" ? "This will delete the project and all its environments and variables." :
                 deleteType === "env" ? "This will delete the environment and all its variables." :
                 "This variable will be permanently removed."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Inline helper for generating from project view
  async function generateEnvForCurrentView() {
    if (!selectedEnv || !cryptoKey) return;
    setGenLoading(true);
    setGenDecrypted(false);
    try {
      const decrypted = await Promise.all(
        variables.map(async (v) => {
          try {
            const plain = await decrypt(v.ciphertext, v.iv, cryptoKey);
            return { key_name: v.key_name, value: plain };
          } catch {
            return { key_name: v.key_name, value: "[DECRYPTION_FAILED]" };
          }
        })
      );
      setGenOutput(decrypted);
      setGenDecrypted(true);
    } catch {
      toast({ variant: "destructive", title: "Generation failed" });
    } finally {
      setGenLoading(false);
    }
  }

  return null;
};

// ===== Sub-components =====

function EnvSelector({ projectId, value, onChange }: { projectId: string; value: string; onChange: (v: string) => void }) {
  const [envs, setEnvs] = useState<Environment[]>([]);
  useEffect(() => {
    if (!projectId) { setEnvs([]); return; }
    supabase.from("environments").select("*").eq("project_id", projectId).order("name").then(({ data }) => {
      if (data) setEnvs(data as Environment[]);
    });
  }, [projectId]);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px]"><SelectValue placeholder="Select environment" /></SelectTrigger>
      <SelectContent>
        {envs.map((e) => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function GeneratedOutput({
  envContent, maskedContent, dockerSnippet, githubSnippet, decrypted,
  onCopy, onDownload, copied, envName,
}: {
  envContent: string; maskedContent: string; dockerSnippet: string; githubSnippet: string;
  decrypted: boolean; onCopy: (t: string, l: string) => void; onDownload: (c: string, f: string) => void;
  copied: string | null; envName: string;
}) {
  const [tab, setTab] = useState<"env" | "docker" | "github">("env");

  const tabs = [
    { id: "env" as const, label: ".env", icon: FileCode },
    { id: "docker" as const, label: "Docker", icon: Container },
    { id: "github" as const, label: "GitHub Actions", icon: GitBranch },
  ];

  const content = tab === "env" ? (decrypted ? envContent : maskedContent) :
                  tab === "docker" ? `environment:\n${dockerSnippet}` :
                  `env:\n${githubSnippet}`;

  return (
    <div className="mt-4 rounded-xl border border-border/50 bg-card/40 overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border/30 bg-muted/20">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-3 w-3" />
            {t.label}
          </button>
        ))}
      </div>
      <pre className="p-4 text-xs font-mono text-muted-foreground overflow-x-auto max-h-60 whitespace-pre-wrap">
        {content}
      </pre>
      <div className="flex gap-2 px-4 py-3 border-t border-border/30">
        <Button size="sm" variant="outline" onClick={() => onCopy(content, `gen-${tab}`)}>
          {copied === `gen-${tab}` ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
          Copy
        </Button>
        {tab === "env" && decrypted && (
          <Button size="sm" variant="outline" onClick={() => onDownload(envContent, envName === "production" ? ".env.production" : envName === "staging" ? ".env.staging" : ".env")}>
            <Download className="h-3.5 w-3.5 mr-1" />Download .env
          </Button>
        )}
      </div>
    </div>
  );
}

export default EnvironmentGeneratorTab;
