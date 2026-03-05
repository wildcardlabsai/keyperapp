import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function hashToken(token: string): Promise<string> {
  const encoded = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return "kpr_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Authenticate via Supabase JWT, return userId
async function authJwt(req: Request, supabaseUrl: string, anonKey: string): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ") || authHeader.startsWith("Bearer kpr_")) return null;
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
  if (error || !data?.claims) return null;
  return data.claims.sub as string;
}

// Authenticate via API token, return userId
async function authApiToken(req: Request, adminClient: any): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer kpr_")) return null;
  const token = authHeader.replace("Bearer ", "");
  const tokenHash = await hashToken(token);
  const { data: tokenRow, error } = await adminClient
    .from("api_tokens")
    .select("*")
    .eq("token_hash", tokenHash)
    .single();
  if (error || !tokenRow) return null;
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) return null;
  await adminClient.from("api_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", tokenRow.id);
  return tokenRow.user_id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/vault-api\/?/, "");
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // ===== GENERATE TOKEN (JWT auth) =====
    if (path === "generate-token" && req.method === "POST") {
      const userId = await authJwt(req, supabaseUrl, anonKey);
      if (!userId) return jsonResponse({ error: "Unauthorized" }, 401);

      const body = await req.json();
      const tokenName = body.name || "Unnamed token";
      const expiresAt = body.expires_at || null;
      const plainToken = generateToken();
      const tokenHash = await hashToken(plainToken);

      const { error: insertError } = await adminClient.from("api_tokens").insert({
        user_id: userId, name: tokenName, token_hash: tokenHash, expires_at: expiresAt,
      });
      if (insertError) return jsonResponse({ error: insertError.message }, 400);

      return jsonResponse({ token: plainToken, name: tokenName, message: "Save this token — it won't be shown again." });
    }

    // ===== KEYS ENDPOINTS (API token auth) =====
    if ((path === "keys" || path.startsWith("keys/")) && req.method === "GET") {
      const userId = await authApiToken(req, adminClient);
      if (!userId) return jsonResponse({ error: "Invalid API token" }, 401);

      if (path === "keys") {
        const { data: keys, error } = await adminClient
          .from("api_keys")
          .select("id, name, service, environment, encrypted_key, iv, tags, notes_encrypted, notes_iv, expires_at, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ keys });
      }

      const keyId = path.replace("keys/", "");
      const { data: key, error } = await adminClient
        .from("api_keys")
        .select("id, name, service, environment, encrypted_key, iv, tags, notes_encrypted, notes_iv, expires_at, created_at")
        .eq("id", keyId)
        .eq("user_id", userId)
        .single();
      if (error || !key) return jsonResponse({ error: "Key not found" }, 404);
      return jsonResponse({ key });
    }

    // ===== PROJECTS ENDPOINTS =====

    // Helper: get userId from either auth method
    const getUserId = async (): Promise<string | null> => {
      const jwtUser = await authJwt(req, supabaseUrl, anonKey);
      if (jwtUser) return jwtUser;
      return authApiToken(req, adminClient);
    };

    // GET /projects
    if (path === "projects" && req.method === "GET") {
      const userId = await getUserId();
      if (!userId) return jsonResponse({ error: "Unauthorized" }, 401);

      const { data, error } = await adminClient
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ projects: data });
    }

    // POST /projects
    if (path === "projects" && req.method === "POST") {
      const userId = await getUserId();
      if (!userId) return jsonResponse({ error: "Unauthorized" }, 401);

      const body = await req.json();
      const { data, error } = await adminClient
        .from("projects")
        .insert({ user_id: userId, name: body.name, description: body.description || null })
        .select()
        .single();
      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse({ project: data }, 201);
    }

    // Project-scoped routes: projects/:id/...
    const projectMatch = path.match(/^projects\/([^/]+)(\/.*)?$/);
    if (projectMatch) {
      const projectId = projectMatch[1];
      const subPath = (projectMatch[2] || "").replace(/^\//, "");
      const userId = await getUserId();
      if (!userId) return jsonResponse({ error: "Unauthorized" }, 401);

      // Verify ownership
      const { data: project, error: pErr } = await adminClient
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .eq("user_id", userId)
        .single();
      if (pErr || !project) return jsonResponse({ error: "Project not found" }, 404);

      // DELETE /projects/:id
      if (!subPath && req.method === "DELETE") {
        await adminClient.from("projects").delete().eq("id", projectId);
        return jsonResponse({ success: true });
      }

      // PUT /projects/:id
      if (!subPath && req.method === "PUT") {
        const body = await req.json();
        const { data, error } = await adminClient
          .from("projects")
          .update({ name: body.name, description: body.description })
          .eq("id", projectId)
          .select()
          .single();
        if (error) return jsonResponse({ error: error.message }, 400);
        return jsonResponse({ project: data });
      }

      // GET /projects/:id/environments
      if (subPath === "environments" && req.method === "GET") {
        const { data, error } = await adminClient
          .from("environments")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: true });
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ environments: data });
      }

      // POST /projects/:id/environments
      if (subPath === "environments" && req.method === "POST") {
        const body = await req.json();
        const { data, error } = await adminClient
          .from("environments")
          .insert({ project_id: projectId, name: body.name })
          .select()
          .single();
        if (error) return jsonResponse({ error: error.message }, 400);
        return jsonResponse({ environment: data }, 201);
      }

      // Environment-scoped routes
      const envMatch = subPath.match(/^environments\/([^/]+)(\/.*)?$/);
      if (envMatch) {
        const envId = envMatch[1];
        const envSubPath = (envMatch[2] || "").replace(/^\//, "");

        // Verify environment belongs to project
        const { data: env, error: eErr } = await adminClient
          .from("environments")
          .select("id, name")
          .eq("id", envId)
          .eq("project_id", projectId)
          .single();
        if (eErr || !env) return jsonResponse({ error: "Environment not found" }, 404);

        // DELETE /projects/:id/environments/:envId
        if (!envSubPath && req.method === "DELETE") {
          await adminClient.from("environments").delete().eq("id", envId);
          return jsonResponse({ success: true });
        }

        // GET /projects/:id/environments/:envId/variables
        if (envSubPath === "variables" && req.method === "GET") {
          const { data, error } = await adminClient
            .from("environment_variables")
            .select("*")
            .eq("environment_id", envId)
            .order("key_name", { ascending: true });
          if (error) return jsonResponse({ error: error.message }, 500);
          return jsonResponse({ variables: data });
        }

        // POST /projects/:id/environments/:envId/variables
        if (envSubPath === "variables" && req.method === "POST") {
          const body = await req.json();
          const { data, error } = await adminClient
            .from("environment_variables")
            .insert({
              environment_id: envId,
              key_name: body.key_name,
              provider_hint: body.provider_hint || null,
              ciphertext: body.ciphertext,
              iv: body.iv,
            })
            .select()
            .single();
          if (error) return jsonResponse({ error: error.message }, 400);
          return jsonResponse({ variable: data }, 201);
        }

        // PUT variable
        const varMatch = envSubPath.match(/^variables\/([^/]+)$/);
        if (varMatch && req.method === "PUT") {
          const varId = varMatch[1];
          const body = await req.json();
          const update: any = {};
          if (body.key_name) update.key_name = body.key_name;
          if (body.provider_hint !== undefined) update.provider_hint = body.provider_hint;
          if (body.ciphertext) { update.ciphertext = body.ciphertext; update.iv = body.iv; }
          const { data, error } = await adminClient
            .from("environment_variables")
            .update(update)
            .eq("id", varId)
            .eq("environment_id", envId)
            .select()
            .single();
          if (error) return jsonResponse({ error: error.message }, 400);
          return jsonResponse({ variable: data });
        }

        // DELETE variable
        if (varMatch && req.method === "DELETE") {
          const varId = varMatch[1];
          await adminClient.from("environment_variables").delete().eq("id", varId).eq("environment_id", envId);
          return jsonResponse({ success: true });
        }
      }
    }

    // GET /env/generate?project=ID&env=NAME
    if (path === "env/generate" && req.method === "GET") {
      const userId = await getUserId();
      if (!userId) return jsonResponse({ error: "Unauthorized" }, 401);

      const projectId = url.searchParams.get("project");
      const envName = url.searchParams.get("env");
      if (!projectId || !envName) return jsonResponse({ error: "project and env params required" }, 400);

      // Verify ownership
      const { data: project } = await adminClient
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .eq("user_id", userId)
        .single();
      if (!project) return jsonResponse({ error: "Project not found" }, 404);

      // Find environment
      const { data: env } = await adminClient
        .from("environments")
        .select("id")
        .eq("project_id", projectId)
        .eq("name", envName)
        .single();
      if (!env) return jsonResponse({ error: "Environment not found" }, 404);

      // Get variables (encrypted)
      const { data: vars } = await adminClient
        .from("environment_variables")
        .select("key_name, ciphertext, iv, provider_hint")
        .eq("environment_id", env.id)
        .order("key_name", { ascending: true });

      return jsonResponse({ variables: vars || [], project_id: projectId, environment: envName });
    }

    return jsonResponse({ error: "Not found" }, 404);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
});
