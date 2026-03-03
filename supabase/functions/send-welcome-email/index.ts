import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRAND = {
  name: "Keyper",
  primaryColor: "#14b8a6",
  primaryDark: "#0d9488",
  bgDark: "#0a0f1a",
  textLight: "#e2e8f0",
  textMuted: "#94a3b8",
  fontFamily: "'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif",
};

function buildWelcomeHtml(email: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:${BRAND.fontFamily};">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:${BRAND.bgDark};border-radius:16px;padding:48px 40px;text-align:center;">
      <div style="width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,${BRAND.primaryColor},${BRAND.primaryDark});margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">🔐</span>
      </div>
      <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0 0 8px;">Welcome to ${BRAND.name}</h1>
      <p style="color:${BRAND.textMuted};font-size:16px;margin:0 0 32px;line-height:1.6;">
        Your secure API key vault is ready. Start storing and managing your keys with zero-knowledge encryption.
      </p>
      <a href="https://keyperapp.lovable.app/dashboard" style="display:inline-block;background:linear-gradient(135deg,${BRAND.primaryColor},${BRAND.primaryDark});color:${BRAND.bgDark};font-weight:700;font-size:16px;padding:14px 36px;border-radius:12px;text-decoration:none;">
        Open Your Vault
      </a>
      <div style="margin-top:40px;padding-top:32px;border-top:1px solid rgba(255,255,255,0.08);">
        <p style="color:${BRAND.textMuted};font-size:13px;margin:0 0 4px;">Signed up as</p>
        <p style="color:${BRAND.textLight};font-size:15px;font-weight:600;margin:0;">${email}</p>
      </div>
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:24px;">
      © ${new Date().getFullYear()} ${BRAND.name}. Your keys, your control.
    </p>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // This can be called internally or via webhook
    const { email, user_id } = await req.json();
    if (!email) throw new Error("Missing email");

    const html = buildWelcomeHtml(email);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Keyper <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to Keyper — Your Vault Awaits 🔐",
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));

    // Log the activity if user_id provided
    if (user_id) {
      await supabaseAdmin.from("activity_log").insert({
        user_id,
        action: "Welcome email sent",
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Welcome email error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
