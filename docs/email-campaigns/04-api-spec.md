# 04 — API / Edge Function Specification

All server logic for this module is **Supabase Edge Functions (Deno)**, modeled on
`supabase/functions/scheduler/index.ts` (service-role client, `Deno.env.get`,
idempotent per-item processing) and `oauth-linkedin-start` (CORS + Clerk-JWT). No
new `api/` Vercel functions are required.

## Conventions

**Env / secrets (Edge Function secrets, never `VITE_*`):**
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`,
`RESEND_WEBHOOK_SECRET`, `ANTHROPIC_API_KEY`, `CLERK_JWKS_URL` (or
`CLERK_ISSUER`), `APP_ORIGIN`.

**Service-role client (same as scheduler):**
```ts
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

**CORS (browser-callable functions):**
```ts
const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
```

**Auth — verify, don't just decode.** The existing `oauth-linkedin-start`
*decodes* the JWT without signature verification. Because sending email is
abuse-sensitive, browser-callable functions here **verify** the Clerk JWT against
Clerk JWKS, then resolve the tenant server-side:
```ts
async function authOrg(req: Request) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const { sub } = await verifyClerkJwt(token);          // JWKS verify (jose)
  const { data: user } = await supabase.from("users")
    .select("id, organization_id").eq("clerk_user_id", sub).single();
  if (!user) throw new HttpError(403, "No org for user");
  return { clerkUserId: sub, userId: user.id, orgId: user.organization_id };
}
```
Client invokes via the anon client with the Clerk JWT attached:
```ts
// src/api/email/functions.ts
const token = await getToken({ template: "supabase" });
const { data, error } = await supabase.functions.invoke("email-send", {
  body: { campaign_id },
  headers: { Authorization: `Bearer ${token}` },
});
```

**Error shape:** `{ "error": { "code": string, "message": string } }` with HTTP
4xx/5xx. **Success:** `{ "data": ... }` with 200.

**Idempotency:** per-recipient via `email_campaign_recipients (campaign_id,
contact_id)` unique key + `status`; webhook via `email_analytics_events
.provider_event_id` unique key.

---

## 1. `email-send` — send / dispatch a campaign

- **Trigger:** browser (send-now) **or** `campaign-scheduler` cron (service-role,
  internal call with a shared secret instead of JWT).
- **Method:** POST · **Auth:** Clerk JWT (browser) or internal secret (cron).
- **Request:** `{ "campaign_id": "uuid", "dry_run": false }`
- **Behavior (idempotent, batched — mirrors `scheduler`):**
  1. Load campaign; assert `org`, status ∈ {scheduled, sending, draft(send-now)}.
  2. **Server-side limit check:** remaining `email_sends` for the tier; abort with
     `quota_exceeded` if insufficient.
  3. Resolve audience (segment members or whole subscribed list), **minus**
     `email_suppressions` and non-`subscribed` contacts.
  4. Upsert `email_campaign_recipients` (one row/contact; `status='pending'`).
  5. Set campaign `status='sending'`, `send_started_at=now()`,
     snapshot `html_cache`.
  6. Loop in batches (Resend batch API where possible); for each pending recipient:
     render → send via Resend → store `resend_message_id`, set `status='sent'`,
     `sent_at`. Per-item try/catch (one failure ⇒ that row `failed`, continue) —
     exactly the scheduler's non-transactional pattern.
  7. When no pending remain: `status='sent'`, `sent_at=now()`; increment
     `UsageTracker` `email_sends` by delivered attempts.
- **Headers per message:** `List-Unsubscribe`, `List-Unsubscribe-Post`,
  per-recipient unsubscribe + open/click tracking links.
- **Response:** `{ "data": { "campaign_id", "queued": n, "sent": n, "skipped": n } }`
- **Re-invocation** resumes only `pending`/`failed` rows (safe to retry).

## 2. `email-test` — send a test email

- **Method:** POST · **Auth:** Clerk JWT.
- **Request:** `{ "campaign_id": "uuid"?, "draft": {subject, preview_text, blocks}?,
  "to": ["a@x.com"] (max 5) }`
- **Behavior:** render identical HTML/text; send via Resend with a `[TEST]` subject
  prefix; **not** recorded in `email_campaign_recipients`; small `email_sends`
  charge optional.
- **Response:** `{ "data": { "sent": n } }`

## 3. `email-domain` — create / verify sending domain

- **Method:** POST · **Auth:** Clerk JWT (admin). Gate: `requirePlan('pro',
  'email_domain')` client-side **and** server-side tier check.
- **Actions:** `{ "action": "create"|"verify"|"status", "domain": "mail.acme.com" }`
  - `create`: call Resend `POST /domains`; store `resend_domain_id`,
    `dns_records`, `status='pending'`.
  - `verify`: call Resend `POST /domains/:id/verify`; update `status`,
    `verified_at`.
  - `status`: refresh from Resend.
- **Response:** `{ "data": { "domain", "status", "dns_records":
  [{type,name,value,priority,status}] } }`

## 4. `resend-webhook` — ingest Resend events

- **Method:** POST · **Auth:** **Svix signature** verification with
  `RESEND_WEBHOOK_SECRET` (Resend signs via Svix). No Clerk JWT (server-to-server).
  Reject on bad signature → 401.
- **Events handled:** `email.sent`, `email.delivered`, `email.delivery_delayed`,
  `email.opened`, `email.clicked`, `email.bounced`, `email.complained`.
- **Behavior (idempotent):**
  1. Verify signature; parse event; extract `resend_message_id` + provider event id.
  2. Insert into `email_analytics_events` (`on conflict (provider_event_id) do
     nothing` ⇒ dedupe). Resolve `recipient_id`/`campaign_id`/`org` via
     `resend_message_id`.
  3. Update the `email_campaign_recipients` row status + timestamps/counters.
  4. Increment the campaign's denormalized counters
     (`delivered/opened/clicked/bounced/complained_count`).
  5. **bounced(hard) / complained** ⇒ upsert `email_suppressions` + set the
     contact's `consent_status` (`cleaned`/`complained`); future sends skip them.
  6. **unsubscribed** ⇒ suppression + `consent_status='unsubscribed'`,
     `unsubscribed_at`.
  7. Log receipt via existing `WebhookLog` / `ProcessedEvent` pattern.
- **Response:** `200 {"data":{"ok":true}}` quickly (heavy work kept minimal;
  webhook must ack fast).

## 5. `ai-generate` — Anthropic Claude generation

- **Method:** POST · **Auth:** Clerk JWT. Full prompt/IO contract in
  [05-ai-architecture.md](./05-ai-architecture.md).
- **Request:** `{ "kind": "generate"|"blog_to_email"|"social_to_email"|
  "subject_lines"|"preview_text"|"tone_rewrite", "tone": "Professional",
  "input": { ... }, "campaign_id": "uuid"? }`
- **Behavior:** server-side tier check on `email_ai_generation`; call Anthropic with
  the structured-output tool; persist `email_ai_generations` (tokens, model);
  increment `UsageTracker`.
- **Response:** `{ "data": { "subject"?, "preview_text"?, "blocks"?,
  "variants"? } }`

## 6. `campaign-scheduler` — cron dispatcher

- **Trigger:** Supabase scheduled cron (e.g. every minute), like `scheduler`.
- **Auth:** none (cron); service-role.
- **Behavior:** `select … from email_campaigns where status='scheduled' and
  scheduled_at <= now()` (partial index), set `status='sending'`, then invoke
  `email-send` per campaign with the internal secret. Idempotent; safe to overlap.
- **Response:** `200` plain (cron, like `scheduler`).

---

## Public unsubscribe endpoint

One-click unsubscribe must work **without login**. Two options:

- **A (preferred):** a lightweight Edge Function `email-unsubscribe` (GET/POST, no
  auth) that validates a signed token (`HMAC(org_id|contact_id|campaign_id)`),
  writes the suppression, and returns a confirmation page. Supports
  `List-Unsubscribe-Post` one-click (RFC 8058).
- **B:** a public SPA route `/unsubscribe` that calls option A.

Token signing uses a server secret (never client). Suppression is immediate.

---

## Client data-access layer (no secrets)

`src/api/email/` hooks use `useSupabaseClient()` for **direct RLS-scoped CRUD**
(contacts, segments, campaigns drafts, templates, reading analytics rollups) and
the `functions.ts` wrappers for the **privileged actions** above
(send/test/domain/ai). This mirrors how the app already mixes direct Supabase
queries with server functions.

| Client call | Mechanism |
|---|---|
| list/create/update contacts, segments, draft campaigns, templates | `useSupabaseClient()` → RLS |
| read campaign counters / analytics rollups | `useSupabaseClient()` → RLS |
| send campaign / test / verify domain / AI generate | `supabase.functions.invoke(...)` with Clerk JWT |
| Resend → events | `resend-webhook` (server-to-server) |
