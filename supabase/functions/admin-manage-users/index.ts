import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function verifyAdmin(supabaseAdmin: any, req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");
  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error } = await supabaseAdmin.auth.getClaims(token);
  if (error || !claims?.claims?.sub) throw new Error("Unauthorized");
  const { data: roleCheck } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", claims.claims.sub)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleCheck) throw new Error("Admin access required");
  return claims.claims.sub;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await verifyAdmin(supabaseAdmin, req);

    const { action, ...params } = await req.json();

    if (action === "delete_user") {
      const { user_id } = params;
      if (!user_id) throw new Error("Missing user_id");
      
      // Delete from auth (cascades to profiles, user_roles, etc.)
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (error) throw new Error(error.message);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_user") {
      const { user_id, email, plan } = params;
      if (!user_id) throw new Error("Missing user_id");

      // Update email in auth if provided
      if (email) {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, { email });
        if (error) throw new Error(error.message);
      }

      // Update plan in profiles if provided
      if (plan) {
        await supabaseAdmin.from("profiles").update({ plan, email: email || undefined }).eq("user_id", user_id);
      } else if (email) {
        await supabaseAdmin.from("profiles").update({ email }).eq("user_id", user_id);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create_user") {
      const { email, password, plan = "free" } = params;
      if (!email || !password) throw new Error("Missing email or password");

      const { data: user, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (createErr) throw new Error(createErr.message);

      // Update plan if not free
      if (plan !== "free") {
        await supabaseAdmin.from("profiles").update({ plan }).eq("user_id", user.user.id);
      }

      return new Response(JSON.stringify({ success: true, user_id: user.user.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unknown action");
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
