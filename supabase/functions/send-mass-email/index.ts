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

function buildMassEmailHtml(subject: string, body: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:${BRAND.fontFamily};">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:${BRAND.bgDark};border-radius:16px;padding:48px 40px;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,${BRAND.primaryColor},${BRAND.primaryDark});margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:28px;">🔐</span>
        </div>
        <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;">${subject}</h1>
      </div>
      <div style="color:${BRAND.textLight};font-size:15px;line-height:1.8;">
        ${body.split("\n").map((line: string) => `<p style="margin:0 0 16px;">${line}</p>`).join("")}
      </div>
      <div style="text-align:center;margin-top:32px;">
        <a href="https://keyperapp.lovable.app/dashboard" style="display:inline-block;background:linear-gradient(135deg,${BRAND.primaryColor},${BRAND.primaryDark});color:${BRAND.bgDark};font-weight:700;font-size:15px;padding:12px 32px;border-radius:12px;text-decoration:none;">
          Go to Dashboard
        </a>
      </div>
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:24px;">
      © ${new Date().getFullYear()} ${BRAND.name}. Your keys, your control.
    </p>
  </div>
</body>
</html>`;
}

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
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await verifyAdmin(supabaseAdmin, req);

    const { subject, body } = await req.json();
    if (!subject || !body) throw new Error("Missing subject or body");

    // Get all user emails
    const { data: profiles, error: profilesErr } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .not("email", "is", null);

    if (profilesErr) throw new Error(profilesErr.message);

    const emails = (profiles || []).map((p: any) => p.email).filter(Boolean);
    if (emails.length === 0) throw new Error("No users to email");

    const html = buildMassEmailHtml(subject, body);

    // Resend supports batch sending - send in batches of 50
    const results = [];
    for (let i = 0; i < emails.length; i += 50) {
      const batch = emails.slice(i, i + 50);
      // Send individually to each user (BCC-style, each gets their own copy)
      for (const email of batch) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Keyper <onboarding@resend.dev>",
            to: [email],
            subject,
            html,
          }),
        });
        const data = await res.json();
        results.push({ email, success: res.ok, data });
      }
    }

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return new Response(JSON.stringify({ success: true, sent, failed, total: emails.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Mass email error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
