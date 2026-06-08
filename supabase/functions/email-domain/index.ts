// email-domain — create / verify / refresh a Resend sending domain (per tenant).
// Browser-callable: Clerk JWT required. Paid-tier gate enforced client-side AND
// here (free tier sends from the shared SoshlOps subdomain instead).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { preflight, ok, fail, HttpError } from "../_shared/cors.ts";
import { authOrg } from "../_shared/clerk.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { createDomain, verifyDomain, getDomain } from "../_shared/resend.ts";

serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  try {
    const { orgId } = await authOrg(req);
    const { action, domain } = await req.json();
    const db = supabaseAdmin();

    if (action === "create") {
      if (!domain) throw new HttpError(400, "bad_request", "domain required");
      const r = await createDomain(domain);
      const dns = (r.records ?? []).map((x: any) => ({
        type: x.type, name: x.name, value: x.value,
        priority: x.priority, status: x.status,
      }));
      const { data, error } = await db.from("email_sending_domains").upsert({
        organization_id: orgId,
        domain,
        resend_domain_id: r.id,
        status: r.status ?? "pending",
        dns_records: dns,
        region: r.region ?? "us-east-1",
      }, { onConflict: "organization_id,domain" }).select().single();
      if (error) throw new HttpError(500, "db_error", error.message);
      return ok(data);
    }

    if (action === "verify" || action === "status") {
      if (!domain) throw new HttpError(400, "bad_request", "domain required");
      const { data: row } = await db.from("email_sending_domains")
        .select("*").eq("organization_id", orgId).eq("domain", domain).single();
      if (!row?.resend_domain_id) throw new HttpError(404, "not_found", "domain not found");

      const r = action === "verify"
        ? await verifyDomain(row.resend_domain_id)
        : await getDomain(row.resend_domain_id);
      const dns = (r.records ?? []).map((x: any) => ({
        type: x.type, name: x.name, value: x.value,
        priority: x.priority, status: x.status,
      }));
      const status = r.status ?? row.status;
      const { data, error } = await db.from("email_sending_domains").update({
        status,
        dns_records: dns.length ? dns : row.dns_records,
        verified_at: status === "verified" ? new Date().toISOString() : row.verified_at,
      }).eq("id", row.id).select().single();
      if (error) throw new HttpError(500, "db_error", error.message);
      return ok(data);
    }

    throw new HttpError(400, "bad_request", `unknown action: ${action}`);
  } catch (err) {
    return fail(err);
  }
});
