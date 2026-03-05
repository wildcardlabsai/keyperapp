import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // Route: generate-token — requires Supabase JWT auth
    if (path === "generate-token" && req.method === "POST") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userId = claimsData.claims.sub;
      const body = await req.json();
      const tokenName = body.name || "Unnamed token";
      const expiresAt = body.expires_at || null;

      const plainToken = generateToken();
      const tokenHash = await hashToken(plainToken);

      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      const { error: insertError } = await adminClient
        .from("api_tokens")
        .insert({
          user_id: userId,
          name: tokenName,
          token_hash: tokenHash,
          expires_at: expiresAt,
        });

      if (insertError) {
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ token: plainToken, name: tokenName, message: "Save this token — it won't be shown again." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For /keys routes — authenticate via API token
    if (path === "keys" || path.startsWith("keys/")) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer kpr_")) {
        return new Response(JSON.stringify({ error: "Invalid API token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const token = authHeader.replace("Bearer ", "");
      const tokenHash = await hashToken(token);
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);

      // Look up token
      const { data: tokenRow, error: tokenError } = await adminClient
        .from("api_tokens")
        .select("*")
        .eq("token_hash", tokenHash)
        .single();

      if (tokenError || !tokenRow) {
        return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check expiry
      if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: "Token expired" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update last_used_at
      await adminClient.from("api_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", tokenRow.id);

      const userId = tokenRow.user_id;

      // GET /keys — list all encrypted keys
      if (path === "keys" && req.method === "GET") {
        const { data: keys, error: keysError } = await adminClient
          .from("api_keys")
          .select("id, name, service, environment, encrypted_key, iv, tags, notes_encrypted, notes_iv, expires_at, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (keysError) {
          return new Response(JSON.stringify({ error: keysError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ keys }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // GET /keys/:id — single key
      if (path.startsWith("keys/") && req.method === "GET") {
        const keyId = path.replace("keys/", "");
        const { data: key, error: keyError } = await adminClient
          .from("api_keys")
          .select("id, name, service, environment, encrypted_key, iv, tags, notes_encrypted, notes_iv, expires_at, created_at")
          .eq("id", keyId)
          .eq("user_id", userId)
          .single();

        if (keyError || !key) {
          return new Response(JSON.stringify({ error: "Key not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ key }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
