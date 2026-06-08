# 01 — Product Requirements Document: Email Campaigns

**Product:** SoshlOps — Email Campaigns module
**Audience:** small businesses, law firms, nonprofits, consultants, coaches, content creators
**Author:** Phase A design · **Status:** Draft for owner approval

---

## 1. Summary

SoshlOps is an existing social-media marketing platform. This module adds an
**email marketing product** so a tenant can manage contacts, build and send email
campaigns (with AI-assisted copy), and measure results — without leaving SoshlOps
and without a second tool (Mailchimp/Constant Contact). It reuses the existing
multi-tenant data model, Clerk auth, Stripe billing, and shadcn/ui design system.
Outbound delivery is **Resend**; content generation is **Anthropic Claude**. Both
run **server-side only** (Supabase Edge Functions).

## 2. Goals & non-goals

**Goals**
- Let a tenant import/manage contacts with consent tracking and unsubscribe.
- Compose and send branded campaigns; preview and test before sending.
- Generate and rewrite copy with Claude across 8 tones; repurpose social posts and
  blog content into email.
- Verify a sending domain (SPF/DKIM/DMARC via Resend) and track
  delivered/open/click/bounce/complaint/unsubscribe.
- Surface KPIs and trends using the existing Recharts-based `chart.jsx`.
- Enforce per-tier limits through the **existing** Stripe + `PaywallProvider` +
  `UsageTracker` system.
- Be CAN-SPAM and GDPR-aware (consent records, unsubscribe, export/erasure).

**Non-goals (this module)**
- Transactional/lifecycle email (welcome, trial-ending) — rebuilt separately when
  REZEMAI residue is cleaned (see §8).
- Replacing the existing social-posting product.
- SMS/push channels.
- Introducing a new billing tier or a parallel subscription system.

## 3. Personas

| Persona | Need | Tier fit |
|---|---|---|
| Solo consultant / coach | Newsletter to a small list, fast AI copy | `starter`→`pro` |
| Small-business owner | Promotions + segments, branded domain | `pro` |
| Law firm marketer | Compliant, "Legal" tone, audit trail, consent records | `pro`→`elite` |
| Nonprofit comms lead | Donor segments, campaigns, modest volume | `pro` |
| Agency / content creator | High volume, multiple domains, A/B, sequences | `elite` |

## 4. Architectural constraints (inherited, non-negotiable)

These come from the existing code and govern every requirement below.

- **Auth = Clerk; data = Supabase + RLS via Clerk JWT.** Authenticated reads/writes
  from the SPA use `useSupabaseClient()` (injects Clerk JWT template `supabase`).
  The anon client (`src/lib/supabaseClient.ts`) is only for public data / function
  invocation. Confirmed pattern: `oauth-linkedin-callback` resolves tenant via
  `select organization_id from users where clerk_user_id = <jwt.sub>`.
- **Multi-tenancy.** Every new table carries `organization_id` and is isolated by
  RLS. Users come from Clerk (mirrored as `users.clerk_user_id`) — not recreated.
- **Secrets server-side only.** `RESEND_API_KEY`, `ANTHROPIC_API_KEY`,
  `RESEND_WEBHOOK_SECRET` live as Edge Function secrets, never `VITE_*`.
- **Server patterns.** Sending/scheduling/webhooks model on
  `supabase/functions/scheduler/index.ts` (Deno `serve`, `Deno.env.get`,
  service-role client, idempotent per-item processing). Edge Functions reachable
  from the browser must do CORS + Clerk-JWT verification (the
  `oauth-linkedin-start` pattern).

## 5. Functional requirements

### 5.1 Dashboard (FR-DASH)
KPI cards: Total Contacts, Active Campaigns, Emails Sent (period), Open Rate,
Click Rate, Unsubscribes; plus Recent Activity feed and a Performance Trend chart.
Built from shadcn `card` + `chart.jsx`. Wireframe: [06](./06-wireframes.md#dashboard).

### 5.2 Contact management (FR-CONTACT)
- CRUD contacts; fields: email (required, unique per org), first/last name, tags[],
  custom fields (JSONB), consent status, source.
- **CSV import** with column mapping, dedupe by email, per-row validation, and an
  import summary (created/updated/skipped/invalid). Large files processed in an
  Edge Function in batches.
- Manual single-add.
- Tags + saved **Segments** (rule-based, see 5.7).
- Search/filter; pagination.
- **Opt-in tracking** (timestamp, source, IP/UA when available) and
  **unsubscribe management** (suppression list; unsubscribed contacts never
  receive campaign sends; double opt-in optional).

### 5.3 Campaign builder (FR-BUILD)
Fields: name, subject, preview text, sender name, sender email (must belong to a
verified domain on paid tiers), template selection. Content via **block model**
(JSONB array of blocks: `text`, `heading`, `image`, `button/cta`, `divider`,
`spacer`, `social`, `footer`). MVP = form-based block list; Phase 2 = drag-and-drop
reorder. AI-generated content inserts blocks (see 5.5). Footer + unsubscribe link
are **mandatory and auto-injected** (CAN-SPAM). Save as draft; schedule or send.

### 5.4 Test sends (FR-TEST)
Send the current draft to up to N owner-specified addresses via `email-test`.
Renders identical HTML/text to the real send. Does not count against campaign
recipients (counts as AI/usage-neutral; small send-quota cost).

### 5.5 AI email generator (FR-AI)
Server-side Claude (Edge Function `ai-generate`). Capabilities: generate from a
prompt; blog→email; social post→email; subject-line variants (N); preview text;
tone rewrite. Tones: **Professional, Legal, Nonprofit, Corporate, Conversational,
Sales, Urgent, Educational**. Returns structured blocks via tool-use. Metered per
tier. Full spec: [05-ai-architecture.md](./05-ai-architecture.md).

### 5.6 Resend integration (FR-RESEND)
Domain verification (DNS records surfaced to the user), campaign sending (batched,
idempotent per recipient using `campaign_recipients`), test emails, and webhook
ingestion for delivery/open/click/bounce/complaint. Bounces/complaints
auto-suppress the contact. Full spec: [04-api-spec.md](./04-api-spec.md).

### 5.7 Segments (FR-SEG, Phase 2)
Rule-based segments (`segments.definition` JSONB: tag in/any, custom-field match,
engagement: opened/clicked in last N days, date joined). Materialized membership
in `segment_members` refreshed on edit and before send; campaigns target a segment
or the full list.

### 5.8 Analytics (FR-ANALYTICS)
Per-campaign: Delivered, Opened, Clicked, Bounced, Unsubscribed, Complained, plus
rates. Account: Top Campaigns, Performance Trends over time. Charts use
`chart.jsx`. Derived from `analytics_events` (raw) rolled up into
`campaign_recipients` counters + a daily rollup.

### 5.9 Security & compliance (FR-SEC) — see §6.
### 5.10 Subscription plans (FR-PLAN) — see §7.

## 6. Non-functional requirements

- **Security:** RLS on every table; Edge Functions verify Clerk JWT (signature
  verification via Clerk JWKS — *stronger than the existing decode-only check in
  `oauth-linkedin-start`*, because sending email is abuse-sensitive); service-role
  used only inside functions; no provider keys client-side; signed Resend webhook
  verification (`svix`/`RESEND_WEBHOOK_SECRET`); rate limiting on send + AI.
- **Privacy / compliance:** consent record per contact; one-click unsubscribe +
  `List-Unsubscribe` header (CAN-SPAM/RFC 8058); physical mailing address in
  footer (CAN-SPAM); GDPR data export + erasure endpoints; audit logging via the
  existing `AuditEvent` entity.
- **Deliverability:** enforce verified domain on paid tiers; SPF/DKIM/DMARC;
  suppress hard bounces + complaints automatically; cap send rate per Resend
  limits.
- **Performance:** contact list paginated; CSV import + sends batched in Edge
  Functions; analytics from pre-aggregated counters, not full event scans.
- **Reliability/idempotency:** per-recipient send guarded by
  `campaign_recipients.status` + a unique key (mirrors `scheduler` idempotency);
  webhook ingestion deduped via `analytics_events` provider id (reuse the existing
  `ProcessedEvent` idea).
- **Observability:** reuse `PerformanceLog` / `WebhookLog` entities for function
  timing and webhook receipts.

## 7. Subscription plan mapping (FR-PLAN)

Maps onto **existing** `starter/pro/elite` via `requirePlan(minPlan, featureKey)`
and `UsageTracker`. New usage keys: `email_contacts`, `email_sends`,
`email_ai_generation`. (See [README](./README.md#subscription-tier-reconciliation)
for the limits table.) Gating points:

- Creating a campaign beyond the monthly cap → `requirePlan('pro','email_campaigns')`.
- Adding a verified domain on `starter` → `requirePlan('pro','email_domain')`.
- Segments / sequences / A/B → `requirePlan('pro'|'elite', …)`.
- Send + AI calls increment `UsageTracker`; Edge Functions re-check the limit
  server-side (client gate is UX only, not enforcement).

## 8. Reconciliation of existing code (brief §2) — detail

| Artifact | Decision | Call-site impact |
|---|---|---|
| `entities.js` → `EmailCampaign`, `EmailTemplate`, `ScheduledEmail` | **Replace** | Remove the 3 mock exports. New typed hooks in `src/api/email/` (`useCampaigns`, `useContacts`, …) over `useSupabaseClient()`. `admin/EmailCampaignManager.jsx` migrates off `EmailCampaign.list()`/`SendEmail()` onto the new hooks + `email-send` function. |
| `integrations.js` → `InvokeLLM`, `SendEmail` | **Replace (server-side)** | New client wrappers `invokeAiGenerate()` / `sendCampaign()` / `sendTestEmail()` call Edge Functions via the anon client's `functions.invoke` with the Clerk JWT attached. Old throwing stubs removed once no longer referenced. |
| `admin/EmailCampaignManager.jsx` | **Extend** as admin broadcast tool | Keep file; rewire data layer; gate with `useAdminAuth`. Not the tenant UI. |
| `email/EmailService.jsx` | **Remove REZEMAI** | Delete REZEMAI subjects/body/`app.rezemai.com`. Lifecycle emails rebuilt later as SoshlOps templates (out of scope). |
| `role.js` `COPY` | **Quarantine** | Email module never imports it. 8 email tones live in the AI layer. |

## 9. Success metrics

- Activation: % of tenants who import contacts + verify a domain within 7 days.
- Engagement: campaigns sent / active tenant / month.
- Quality: average open rate ≥ industry baseline; complaint rate < 0.1%; bounce
  rate < 2%.
- Monetization: `starter`→`pro` upgrades attributed to email gating.
- AI adoption: % of campaigns using AI-generated content.

## 10. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Deliverability/spam reputation | Verified domains on paid tiers, auto-suppression, complaint monitoring, rate caps, mandatory unsubscribe + physical address. |
| Tenant data leakage | RLS on every table + server-side org resolution; service-role only in functions; tests for cross-tenant access. |
| Prompt injection via imported content (blog/social → email) | Treat all retrieved content as untrusted data, never instructions; structured tool-use output; never interpolate raw contact PII into prompts (see [05](./05-ai-architecture.md#safety)). |
| Compliance gaps (CAN-SPAM/GDPR) | Consent records, unsubscribe enforcement, export/erasure endpoints, audit log. |
| Existing `create-checkout.js` has **no auth** | New endpoints (incl. any billing additions) verify Clerk JWT; flagged as pre-existing debt, not extended. |
| Scope creep | Strict phase gates (MVP → Growth → Enterprise) in [07](./07-roadmap.md). |
