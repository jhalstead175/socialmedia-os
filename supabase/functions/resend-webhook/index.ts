// resend-webhook — ingest Resend events (Svix-signed). No Clerk JWT.
// Idempotent via email_analytics_events.provider_event_id (svix-id).
// Deploy with verify_jwt = false (custom Svix auth below).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Webhook } from "https://esm.sh/svix@1.24.0";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";

const EVENT_MAP: Record<string, string> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.delivery_delayed": "delivery_delayed",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.bounced": "bounced",
  "email.complained": "complained",
};

serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });
  try {
    const secret = Deno.env.get("RESEND_WEBHOOK_SECRET");
    if (!secret) return new Response("not configured", { status: 500 });

    const payload = await req.text();
    const headers = {
      "svix-id": req.headers.get("svix-id") ?? "",
      "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
      "svix-signature": req.headers.get("svix-signature") ?? "",
    };

    let evt: any;
    try {
      evt = new Webhook(secret).verify(payload, headers);
    } catch (_e) {
      return new Response("invalid signature", { status: 401 });
    }

    const type = EVENT_MAP[evt.type];
    const db = supabaseAdmin();
    const messageId = evt.data?.email_id ?? evt.data?.id ?? null;
    const providerEventId = headers["svix-id"] || `${messageId}:${evt.type}:${evt.created_at ?? ""}`;
    const occurredAt = evt.created_at ?? new Date().toISOString();

    // correlate to recipient
    const { data: recipient } = messageId
      ? await db.from("email_campaign_recipients")
          .select("id,organization_id,campaign_id,contact_id,email,status,open_count,click_count")
          .eq("resend_message_id", messageId).maybeSingle()
      : { data: null as any };

    // idempotent raw event
    await db.from("email_analytics_events").upsert({
      organization_id: recipient?.organization_id ?? null,
      campaign_id: recipient?.campaign_id ?? null,
      recipient_id: recipient?.id ?? null,
      contact_id: recipient?.contact_id ?? null,
      event_type: type ?? "sent",
      resend_message_id: messageId,
      provider_event_id: providerEventId,
      url: evt.data?.click?.link ?? null,
      user_agent: evt.data?.click?.userAgent ?? evt.data?.open?.userAgent ?? null,
      occurred_at: occurredAt,
      metadata: evt.data ?? {},
    }, { onConflict: "provider_event_id", ignoreDuplicates: true });

    if (recipient) {
      const patch: Record<string, unknown> = {};
      const rank = (s: string) =>
        ["pending", "sent", "delivered", "opened", "clicked"].indexOf(s);
      if (type === "delivered") { patch.status = "delivered"; patch.delivered_at = occurredAt; }
      else if (type === "opened") {
        patch.open_count = (recipient.open_count ?? 0) + 1;
        if (!recipient.first_opened_at) patch.first_opened_at = occurredAt;
        if (rank(recipient.status) < rank("opened")) patch.status = "opened";
      } else if (type === "clicked") {
        patch.click_count = (recipient.click_count ?? 0) + 1;
        if (!recipient.first_clicked_at) patch.first_clicked_at = occurredAt;
        patch.status = "clicked";
      } else if (type === "bounced") { patch.status = "bounced"; }
      else if (type === "complained") { patch.status = "complained"; }
      if (Object.keys(patch).length) {
        await db.from("email_campaign_recipients").update(patch).eq("id", recipient.id);
      }

      // suppression + consent on bounce(hard)/complaint
      const isHardBounce = type === "bounced" &&
        (evt.data?.bounce?.type ?? "").toLowerCase() !== "soft";
      if (isHardBounce || type === "complained") {
        const reason = type === "complained" ? "complained" : "hard_bounce";
        await db.from("email_suppressions").upsert({
          organization_id: recipient.organization_id,
          email: recipient.email,
          reason,
          source_campaign_id: recipient.campaign_id,
        }, { onConflict: "organization_id,email", ignoreDuplicates: true });
        await db.from("email_contacts").update({
          consent_status: type === "complained" ? "complained" : "cleaned",
        }).eq("id", recipient.contact_id);
      }
    }

    return new Response(JSON.stringify({ data: { ok: true } }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("resend-webhook error:", err);
    return new Response("error", { status: 500 });
  }
});
