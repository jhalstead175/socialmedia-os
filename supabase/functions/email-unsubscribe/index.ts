// email-unsubscribe — public, signed-token unsubscribe (no login).
// GET  -> confirmation page. POST -> RFC 8058 one-click. Deploy verify_jwt=false.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { verifyUnsubToken } from "../_shared/render.ts";

function page(message: string): Response {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"/><title>Unsubscribe</title></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f3f4f6;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;">
<div style="background:#fff;padding:32px 40px;border-radius:12px;max-width:420px;text-align:center;">
<h2 style="color:#111827;margin:0 0 8px;">${message}</h2>
<p style="color:#6b7280;font-size:14px;">You can close this window.</p>
</div></body></html>`,
    { status: 200, headers: { "Content-Type": "text/html" } },
  );
}

async function doUnsub(token: string): Promise<boolean> {
  const claims = await verifyUnsubToken(token);
  if (!claims) return false;
  const db = supabaseAdmin();
  const { data: contact } = await db.from("email_contacts")
    .select("id,email,organization_id")
    .eq("id", claims.contact).eq("organization_id", claims.org).maybeSingle();
  if (!contact) return false;

  await db.from("email_contacts").update({
    consent_status: "unsubscribed",
    unsubscribed_at: new Date().toISOString(),
  }).eq("id", contact.id);

  await db.from("email_suppressions").upsert({
    organization_id: contact.organization_id,
    email: contact.email,
    reason: "unsubscribed",
    source_campaign_id: claims.campaign || null,
  }, { onConflict: "organization_id,email", ignoreDuplicates: true });

  if (claims.campaign) {
    await db.from("email_campaign_recipients").update({ status: "unsubscribed" })
      .eq("campaign_id", claims.campaign).eq("contact_id", contact.id);
  }
  return true;
}

serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";

  // RFC 8058 one-click (List-Unsubscribe-Post)
  if (req.method === "POST") {
    const okd = token && await doUnsub(token);
    return new Response(okd ? "ok" : "invalid", { status: okd ? 200 : 400 });
  }
  if (req.method === "GET") {
    if (!token) return page("Invalid unsubscribe link");
    const okd = await doUnsub(token);
    return page(okd ? "You've been unsubscribed" : "This link is invalid or expired");
  }
  return new Response("method not allowed", { status: 405 });
});
