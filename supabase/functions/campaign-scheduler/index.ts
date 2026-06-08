// campaign-scheduler — cron worker. Dispatches campaigns whose scheduled_at is
// due by invoking email-send with the internal secret. Mirrors functions/scheduler.
// Deploy verify_jwt=false; schedule via Supabase cron (e.g. every minute).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";

serve(async () => {
  try {
    const db = supabaseAdmin();
    const now = new Date().toISOString();
    const { data: due } = await db.from("email_campaigns")
      .select("id")
      .eq("status", "scheduled")
      .lte("scheduled_at", now)
      .limit(50);

    if (!due?.length) return new Response("no campaigns due", { status: 200 });

    const base = `${Deno.env.get("SUPABASE_URL")}/functions/v1`;
    const secret = Deno.env.get("INTERNAL_FUNCTION_SECRET") ?? "";
    let dispatched = 0;
    for (const c of due) {
      try {
        await fetch(`${base}/email-send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": secret,
            apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "",
          },
          body: JSON.stringify({ campaign_id: c.id }),
        });
        dispatched += 1;
      } catch (e) {
        console.error(`dispatch failed for ${c.id}:`, e);
      }
    }
    return new Response(`dispatched ${dispatched} campaign(s)`, { status: 200 });
  } catch (err) {
    console.error("campaign-scheduler error:", err);
    return new Response("error", { status: 500 });
  }
});
