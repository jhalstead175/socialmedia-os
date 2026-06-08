// email-send — render + dispatch a campaign, idempotent per recipient.
// Callable by the browser (Clerk JWT, send-now) or the campaign-scheduler cron
// (x-internal-secret). Resilient per-item loop modeled on functions/scheduler.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { preflight, ok, fail, HttpError } from "../_shared/cors.ts";
import { authOrg, assertInternal } from "../_shared/clerk.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { sendEmail } from "../_shared/resend.ts";
import { renderCampaignHtml, personalize, signUnsubToken } from "../_shared/render.ts";

const MAX_PER_RUN = 500;

serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  try {
    const body = await req.json().catch(() => ({}));
    const campaignId = body.campaign_id;
    if (!campaignId) throw new HttpError(400, "bad_request", "campaign_id required");

    const db = supabaseAdmin();
    const isInternal = !!req.headers.get("x-internal-secret");

    // ---- auth + load campaign ----
    const { data: campaign } = await db.from("email_campaigns")
      .select("*").eq("id", campaignId).single();
    if (!campaign) throw new HttpError(404, "not_found", "campaign not found");

    let orgId: string;
    if (isInternal) {
      assertInternal(req);
      orgId = campaign.organization_id;
    } else {
      ({ orgId } = await authOrg(req));
      if (campaign.organization_id !== orgId) {
        throw new HttpError(403, "forbidden", "campaign not in your org");
      }
    }

    if (["sent", "canceled"].includes(campaign.status)) {
      return ok({ campaign_id: campaignId, status: campaign.status, sent: 0, note: "already finalized" });
    }

    // ---- org compliance/footer context ----
    const { data: org } = await db.from("organizations")
      .select("name, email_settings").eq("id", orgId).single();
    const settings = (org?.email_settings ?? {}) as Record<string, string>;
    const orgName = campaign.from_name || org?.name || "SoshlOps";
    const orgAddress = settings.mailing_address || "";

    const fromEmail = campaign.from_email
      || `noreply@${Deno.env.get("SHARED_SENDING_DOMAIN") || "mail.soshlops.com"}`;
    const from = `${orgName} <${fromEmail}>`;
    const functionsBase = `${Deno.env.get("SUPABASE_URL")}/functions/v1`;

    // ---- build the recipient ledger once (idempotent) ----
    const { count: existing } = await db.from("email_campaign_recipients")
      .select("id", { count: "exact", head: true }).eq("campaign_id", campaignId);

    if (!existing) {
      // suppressed emails for this org
      const { data: supp } = await db.from("email_suppressions")
        .select("email").eq("organization_id", orgId);
      const suppressed = new Set((supp ?? []).map((s) => String(s.email).toLowerCase()));

      // audience: segment members or whole subscribed list
      let contacts: Array<{ id: string; email: string }> = [];
      if (!campaign.target_all && campaign.segment_id) {
        const { data } = await db.from("email_segment_members")
          .select("contact:email_contacts!inner(id,email,consent_status)")
          .eq("segment_id", campaign.segment_id);
        contacts = (data ?? [])
          .map((r: any) => r.contact)
          .filter((c: any) => c && c.consent_status === "subscribed")
          .map((c: any) => ({ id: c.id, email: c.email }));
      } else {
        const { data } = await db.from("email_contacts")
          .select("id,email").eq("organization_id", orgId).eq("consent_status", "subscribed");
        contacts = (data ?? []) as any[];
      }

      const rows = contacts
        .filter((c) => !suppressed.has(String(c.email).toLowerCase()))
        .map((c) => ({
          organization_id: orgId,
          campaign_id: campaignId,
          contact_id: c.id,
          email: c.email,
          status: "pending",
        }));

      if (rows.length) {
        // chunk inserts to stay within payload limits
        for (let i = 0; i < rows.length; i += 1000) {
          await db.from("email_campaign_recipients")
            .upsert(rows.slice(i, i + 1000), { onConflict: "campaign_id,contact_id", ignoreDuplicates: true });
        }
      }
      await db.from("email_campaigns").update({
        status: "sending",
        send_started_at: new Date().toISOString(),
        recipient_count: rows.length,
      }).eq("id", campaignId);
    } else if (campaign.status !== "sending") {
      await db.from("email_campaigns").update({ status: "sending" }).eq("id", campaignId);
    }

    // ---- base HTML (cache once) ----
    let baseHtml = campaign.html_cache;
    if (!baseHtml) {
      baseHtml = renderCampaignHtml({
        blocks: campaign.blocks ?? [],
        previewText: campaign.preview_text ?? "",
        orgName, orgAddress,
      });
      await db.from("email_campaigns").update({ html_cache: baseHtml }).eq("id", campaignId);
    }

    // ---- process pending recipients (resumable) ----
    const { data: pending } = await db.from("email_campaign_recipients")
      .select("id,contact_id,email")
      .eq("campaign_id", campaignId).eq("status", "pending").limit(MAX_PER_RUN);

    let sent = 0, failed = 0;
    for (const r of pending ?? []) {
      try {
        const { data: contact } = await db.from("email_contacts")
          .select("first_name,last_name,email").eq("id", r.contact_id).single();
        const token = await signUnsubToken({ org: orgId, contact: r.contact_id, campaign: campaignId });
        const unsubUrl = `${functionsBase}/email-unsubscribe?token=${token}`;
        const html = personalize(baseHtml, {
          first_name: contact?.first_name ?? "",
          last_name: contact?.last_name ?? "",
          email: r.email,
          unsubscribe_url: unsubUrl,
          org_name: orgName,
          org_address: orgAddress,
        });
        const res = await sendEmail({
          from,
          to: r.email,
          subject: campaign.subject ?? "(no subject)",
          html,
          reply_to: campaign.reply_to ?? settings.default_reply_to ?? undefined,
          headers: {
            "List-Unsubscribe": `<${unsubUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
          tags: [{ name: "campaign_id", value: campaignId }],
        });
        await db.from("email_campaign_recipients").update({
          status: "sent", resend_message_id: res.id ?? null, sent_at: new Date().toISOString(),
        }).eq("id", r.id);
        sent += 1;
      } catch (e) {
        failed += 1;
        await db.from("email_campaign_recipients").update({
          status: "failed", error: e instanceof Error ? e.message : "send failed",
        }).eq("id", r.id);
      }
    }

    // ---- finalize if drained ----
    const { count: stillPending } = await db.from("email_campaign_recipients")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaignId).eq("status", "pending");
    if (!stillPending) {
      await db.from("email_campaigns").update({
        status: "sent", sent_at: new Date().toISOString(),
      }).eq("id", campaignId);
    }

    return ok({ campaign_id: campaignId, sent, failed, remaining: stillPending ?? 0 });
  } catch (err) {
    return fail(err);
  }
});
