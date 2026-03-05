import { useState, useEffect, useCallback } from "react";
import { Key, Plus, Trash2, Copy, Check, Terminal, Chrome, Clock, Code2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getCliSource } from "@/lib/cliSource";
import { getManifestJson, getPopupHtml, getPopupJs } from "@/lib/extensionSource";
import EmptyState from "./EmptyState";

interface ApiToken {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
}

interface Props {
  userId: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

const DeveloperToolsTab = ({ userId }: Props) => {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [newTokenName, setNewTokenName] = useState("");
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"tokens" | "cli" | "extension" | "api">("tokens");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadTokens = useCallback(async () => {
    const { data } = await supabase
      .from("api_tokens")
      .select("id, name, created_at, last_used_at, expires_at")
      .order("created_at", { ascending: false });
    if (data) setTokens(data);
  }, []);

  useEffect(() => { loadTokens(); }, [loadTokens]);

  const handleCreateToken = async () => {
    if (!newTokenName.trim()) {
      toast({ variant: "destructive", title: "Name required" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("vault-api/generate-token", {
        body: { name: newTokenName.trim() },
      });
      if (error) throw error;
      setCreatedToken(data.token);
      setNewTokenName("");
      loadTokens();
      toast({ title: "Token created", description: "Copy it now — it won't be shown again." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to create token", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteToken = async (id: string) => {
    await supabase.from("api_tokens").delete().eq("id", id);
    toast({ title: "Token revoked" });
    loadTokens();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sections = [
    { id: "tokens" as const, label: "API Tokens", icon: Key },
    { id: "cli" as const, label: "CLI Tool", icon: Terminal },
    { id: "extension" as const, label: "Extension", icon: Chrome },
    { id: "api" as const, label: "API Docs", icon: Code2 },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Developer Tools</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Access your encrypted vault programmatically via CLI, browser extension, or API.
      </p>

      {/* Section tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg bg-muted/30 w-fit">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeSection === s.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <s.icon className="h-3.5 w-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      {/* API Tokens */}
      {activeSection === "tokens" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-card/40 p-5">
            <h3 className="font-semibold mb-1">Personal Access Tokens</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Create tokens to authenticate CLI and browser extension requests. Tokens grant read-only access to your encrypted vault data.
            </p>

            {/* Create token */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Token name (e.g. My CLI)"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateToken()}
                className="flex-1"
              />
              <Button onClick={handleCreateToken} disabled={loading} size="sm">
                <Plus className="h-4 w-4 mr-1" />Create
              </Button>
            </div>

            {/* Newly created token */}
            {createdToken && (
              <div className="rounded-lg border border-accent/40 bg-accent/5 p-4 mb-4">
                <p className="text-xs text-accent font-medium mb-2">⚠️ Copy this token now — it won't be shown again</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-background/50 rounded px-3 py-2 font-mono break-all">
                    {createdToken}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(createdToken, "new-token")}
                  >
                    {copied === "new-token" ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setCreatedToken(null)}>
                  Dismiss
                </Button>
              </div>
            )}

            {/* Token list */}
            {tokens.length === 0 ? (
              <EmptyState icon={Key} title="No tokens yet" description="Create a token to get started with CLI or extension access." />
            ) : (
              <div className="space-y-2">
                {tokens.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border border-border/30 bg-background/30 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>Created {new Date(t.created_at).toLocaleDateString()}</span>
                        {t.last_used_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last used {new Date(t.last_used_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteToken(t.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User ID for CLI/extension */}
          <div className="rounded-xl border border-border/50 bg-card/40 p-5">
            <h3 className="font-semibold mb-1">Your User ID</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Needed by CLI and extension as the encryption salt. Keep it handy.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-background/50 rounded px-3 py-2 font-mono">{userId}</code>
              <Button size="icon" variant="ghost" onClick={() => copyToClipboard(userId, "user-id")}>
                {copied === "user-id" ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CLI Tool */}
      {activeSection === "cli" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-card/40 p-5">
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              <Terminal className="h-5 w-5 text-accent" />
              Keyper CLI
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              A self-contained Node.js script for accessing your vault from the terminal. Decryption happens locally.
            </p>

            <div className="space-y-3">
              <div className="rounded-lg bg-background/60 border border-border/30 p-4">
                <h4 className="text-sm font-medium mb-2">Quick Start</h4>
                <ol className="space-y-2 text-xs text-muted-foreground list-decimal list-inside">
                  <li>Download the CLI script below</li>
                  <li>Set your API token: <code className="bg-muted/50 px-1.5 py-0.5 rounded text-foreground">export KEYPER_TOKEN="kpr_..."</code></li>
                  <li>Run commands:
                    <div className="mt-1 ml-4 space-y-1">
                      <div><code className="bg-muted/50 px-1.5 py-0.5 rounded text-foreground">node keyper-cli.js list</code> — List all keys</div>
                      <div><code className="bg-muted/50 px-1.5 py-0.5 rounded text-foreground">node keyper-cli.js get "My API Key"</code> — Decrypt & show</div>
                      <div><code className="bg-muted/50 px-1.5 py-0.5 rounded text-foreground">node keyper-cli.js env list</code> — List projects</div>
                      <div><code className="bg-muted/50 px-1.5 py-0.5 rounded text-foreground">node keyper-cli.js env pull --project "My App" --env local</code> — Print .env</div>
                      <div><code className="bg-muted/50 px-1.5 py-0.5 rounded text-foreground">node keyper-cli.js env write --project "My App" --env production</code> — Write .env file</div>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={() => downloadFile(getCliSource(SUPABASE_URL), "keyper-cli.js")}>
                  <Terminal className="h-4 w-4 mr-1" />Download CLI
                </Button>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(getCliSource(SUPABASE_URL), "cli")}>
                  {copied === "cli" ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  Copy Source
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Browser Extension */}
      {activeSection === "extension" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-card/40 p-5">
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              <Chrome className="h-5 w-5 text-accent" />
              Browser Extension
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              A Chrome extension (Manifest V3) for accessing vault keys from any web page. Decryption happens locally in the extension.
            </p>

            <div className="rounded-lg bg-background/60 border border-border/30 p-4 mb-4">
              <h4 className="text-sm font-medium mb-2">Setup Instructions</h4>
              <ol className="space-y-2 text-xs text-muted-foreground list-decimal list-inside">
                <li>Download all 3 extension files below into a folder</li>
                <li>Open <code className="bg-muted/50 px-1.5 py-0.5 rounded text-foreground">chrome://extensions</code> in Chrome</li>
                <li>Enable "Developer mode" (top right toggle)</li>
                <li>Click "Load unpacked" and select your folder</li>
                <li>Click the Keyper extension icon in your toolbar</li>
                <li>Enter your API token and User ID to connect</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Extension Files</h4>
              <div className="grid gap-2">
                {[
                  { name: "manifest.json", content: getManifestJson(), label: "Manifest" },
                  { name: "popup.html", content: getPopupHtml(), label: "Popup HTML" },
                  { name: "popup.js", content: getPopupJs(SUPABASE_URL), label: "Popup JS" },
                ].map((file) => (
                  <div key={file.name} className="flex items-center justify-between rounded-lg border border-border/30 bg-background/30 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-mono">{file.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(file.content, file.name)}>
                        {copied === file.name ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => downloadFile(file.content, file.name)}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button size="sm" className="mt-2" onClick={() => {
                downloadFile(getManifestJson(), "manifest.json");
                setTimeout(() => downloadFile(getPopupHtml(), "popup.html"), 100);
                setTimeout(() => downloadFile(getPopupJs(SUPABASE_URL), "popup.js"), 200);
              }}>
                Download All Files
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* API Docs */}
      {activeSection === "api" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-card/40 p-5">
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              <Code2 className="h-5 w-5 text-accent" />
              Vault API Documentation
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              RESTful API for programmatic access to your encrypted vault. All responses contain encrypted data only — decryption must happen client-side.
            </p>

            <div className="space-y-4">
              {/* Base URL */}
              <div className="rounded-lg bg-background/60 border border-border/30 p-4">
                <h4 className="text-sm font-medium mb-1">Base URL</h4>
                <code className="text-xs bg-muted/50 px-2 py-1 rounded font-mono block">
                  {SUPABASE_URL}/functions/v1/vault-api
                </code>
              </div>

              {/* Endpoints */}
              <div className="rounded-lg bg-background/60 border border-border/30 p-4">
                <h4 className="text-sm font-medium mb-3">Endpoints</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent">GET</span>
                      <code className="text-xs font-mono">/keys</code>
                    </div>
                    <p className="text-xs text-muted-foreground ml-12">List all encrypted keys. Auth: Bearer kpr_token</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent">GET</span>
                      <code className="text-xs font-mono">/keys/:id</code>
                    </div>
                    <p className="text-xs text-muted-foreground ml-12">Get a single encrypted key by ID. Auth: Bearer kpr_token</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent">GET</span>
                      <code className="text-xs font-mono">/projects</code>
                    </div>
                    <p className="text-xs text-muted-foreground ml-12">List all projects. Auth: Bearer kpr_token or JWT</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent">GET</span>
                      <code className="text-xs font-mono">/projects/:id/environments</code>
                    </div>
                    <p className="text-xs text-muted-foreground ml-12">List environments for a project</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent">GET</span>
                      <code className="text-xs font-mono">/projects/:id/environments/:envId/variables</code>
                    </div>
                    <p className="text-xs text-muted-foreground ml-12">List encrypted variables for an environment</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">POST</span>
                      <code className="text-xs font-mono">/generate-token</code>
                    </div>
                    <p className="text-xs text-muted-foreground ml-12">Create a new API token. Auth: Bearer JWT (session)</p>
                  </div>
                </div>
              </div>

              {/* Response format */}
              <div className="rounded-lg bg-background/60 border border-border/30 p-4">
                <h4 className="text-sm font-medium mb-2">Response Format (GET /keys)</h4>
                <pre className="text-xs bg-muted/30 rounded p-3 overflow-x-auto font-mono text-muted-foreground">
{`{
  "keys": [
    {
      "id": "uuid",
      "name": "My API Key",
      "service": "OpenAI",
      "environment": "Production",
      "encrypted_key": "base64...",
      "iv": "base64...",
      "tags": "ai,prod",
      "expires_at": "2025-12-31T00:00:00Z"
    }
  ]
}`}
                </pre>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Note:</strong> <code className="bg-muted/50 px-1 rounded">encrypted_key</code> and <code className="bg-muted/50 px-1 rounded">iv</code> are AES-256-GCM encrypted. Decrypt locally using your vault passphrase with PBKDF2 (600k iterations, SHA-256) using your User ID as salt.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperToolsTab;
