// email-test — send a test render to up to 5 addresses. Not recorded in the
// recipient ledger. Browser-callable (Clerk JWT).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { preflight, ok, fail, HttpError } from "../_shared/cors.ts";
import { authOrg } from "../_shared/clerk.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { sendEmail } from "../_shared/resend.ts";
import { renderCampaignHtml, personalize } from "../_shared/render.ts";

serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  try {
    const { orgId } = await authOrg(req);
    const body = await req.json();
    const to: string[] = (body.to ?? []).slice(0, 5);
    if (!to.length) throw new HttpError(400, "bad_request", "to[] required (max 5)");

    const db = supabaseAdmin();

    // accept either a saved campaign_id or an inline draft
    let subject = body.draft?.subject, previewText = body.draft?.preview_text;
    let blocks = body.draft?.blocks, fromName = body.draft?.from_name, fromEmail = body.draft?.from_email;
    let replyTo = body.draft?.reply_to;
    if (body.campaign_id) {
      const { data: c } = await db.from("email_campaigns")
        .select("*").eq("id", body.campaign_id).eq("organization_id", orgId).single();
      if (!c) throw new HttpError(404, "not_found", "campaign not found");
      subject = c.subject; previewText = c.preview_text; blocks = c.blocks;
      fromName = c.from_name; fromEmail = c.from_email; replyTo = c.reply_to;
    }

    const { data: org } = await db.from("organizations")
      .select("name, email_settings").eq("id", orgId).single();
    const settings = (org?.email_settings ?? {}) as Record<string, string>;
    const orgName = fromName || org?.name || "SoshlOps";
    const orgAddress = settings.mailing_address || "";
    const from = `${orgName} <${fromEmail || `noreply@${Deno.env.get("SHARED_SENDING_DOMAIN") || "mail.soshlops.com"}`}>`;

    const html = personalize(
      renderCampaignHtml({ blocks: blocks ?? [], previewText: previewText ?? "", orgName, orgAddress }),
      { first_name: "there", unsubscribe_url: "#", org_name: orgName, org_address: orgAddress },
    );

    let sent = 0;
    for (const addr of to) {
      await sendEmail({
        from, to: addr, subject: `[TEST] ${subject ?? "(no subject)"}`,
        html, reply_to: replyTo ?? undefined,
      });
      sent += 1;
    }
    return ok({ sent });
  } catch (err) {
    return fail(err);
  }
});
