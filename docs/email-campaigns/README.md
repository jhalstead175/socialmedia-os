# SoshlOps — Email Campaigns Module · Phase A Design

> **STATUS: Phase A (Design) — awaiting owner approval. No application/runtime code
> has been written. This directory contains design documents only.**
> Per the handoff brief Section 5, implementation (Phase B) does not begin until
> these documents are approved at the checkpoint below.

This module adds a tenant-facing **Email Campaigns** product to SoshlOps,
integrating **Resend** (outbound) and **Anthropic Claude** (AI generation), built
to match the *existing* stack: Vite + React 18 SPA, Tailwind + shadcn/ui,
react-router-dom, **Clerk** auth, **Supabase** Postgres + RLS, Supabase Edge
Functions (Deno) + Vercel serverless (`api/`), and **Stripe** billing.

## Document index

| # | Document | Brief deliverable |
|---|----------|-------------------|
| — | [README.md](./README.md) (this file) — reconciliation decisions, tier mapping, open questions | §2, §7 |
| 1 | [01-PRD.md](./01-PRD.md) — Product Requirements Document | Deliverable 1 |
| 2 | [02-user-stories.md](./02-user-stories.md) — User Stories | Deliverable 2 |
| 3 | [03-database-schema.sql](./03-database-schema.sql) — Postgres DDL + RLS + indexes | Deliverable 3 |
| 4 | [04-api-spec.md](./04-api-spec.md) — Edge Function / serverless specification | Deliverable 4 |
| 5 | [05-ai-architecture.md](./05-ai-architecture.md) — Anthropic Claude prompt architecture | Deliverable 4 (AI) |
| 6 | [06-wireframes.md](./06-wireframes.md) — UI wireframe descriptions | Deliverable 5 |
| 7 | [07-roadmap.md](./07-roadmap.md) — Development roadmap + effort estimates | Deliverable 6 |
| 8 | [08-folder-structure.md](./08-folder-structure.md) — Folder structure (matches existing layout) | Deliverable 7 |
| 9 | [09-future-enhancements.md](./09-future-enhancements.md) — Future enhancement opportunities | Deliverable 8 |

---

## Section 2 reconciliation decisions (required by the brief)

For each of the five contaminated/partial artifacts, the decision is stated below.
Details and call-site impact are in [01-PRD.md](./01-PRD.md) §8.

| # | Existing artifact | Decision | Rationale |
|---|-------------------|----------|-----------|
| 1 | `src/api/entities.js` stubs `EmailCampaign`, `EmailTemplate`, `ScheduledEmail` (mock `createMockEntity`, throw *"Backend not implemented"*) | **REPLACE** | These throw on use. Real data access is built as a typed hook/service layer (`src/api/email/`) on top of `useSupabaseClient()` (Clerk-JWT + RLS), matching how the rest of the app already accesses Supabase directly rather than through `entities.js`. The three mock exports are deleted. |
| 2 | `src/api/integrations.js` stubs `InvokeLLM`, `SendEmail` (and `UploadFile`, `GenerateImage`…) | **REPLACE (server-side)** | `SendEmail` → thin client wrapper that invokes the `email-send` / `email-test` **Edge Functions** (Resend lives server-side). `InvokeLLM` → wrapper that invokes the `ai-generate` Edge Function (Anthropic lives server-side). No provider keys ever reach the browser (brief §1.3). |
| 3 | `src/components/admin/EmailCampaignManager.jsx` (clean generic admin broadcast sender) | **EXTEND / REPURPOSE** | It is brand-clean and reusable. It becomes the **platform-admin broadcast tool** (admin-only, gated by `useAdminAuth`), rewired to the real `email-send` Edge Function. It is **distinct** from the new tenant-facing Campaigns product and is *not* the customer UI. |
| 4 | `src/components/email/EmailService.jsx` — hardcoded **REZEMAI** résumé content + `app.rezemai.com` URLs | **REMOVE** | All REZEMAI subjects, body copy, branding, and `app.rezemai.com` URLs are stripped. The *lifecycle/transactional* emails it represented (welcome, trial-ending, etc.) are rebuilt as SoshlOps-branded, server-side templates — separate from the marketing Campaigns module and out of this module's MVP scope (tracked as a follow-up). |
| 5 | `src/lib/role.js` `COPY` — résumé/interview persona copy from REZEMAI | **QUARANTINE (do not propagate)** | The email module does **not** import `role.js` `COPY`. Email tone presets are an independent set of 8 tones (see [05-ai-architecture.md](./05-ai-architecture.md)). Cleaning the residual REZEMAI copy in `role.js` is flagged as a separate rebrand task, not bundled here. |

### Naming
Canonical product name is **SoshlOps** (per `package.json` `"name": "SoshlOps"`). All
new email-module code and docs use **SoshlOps**. The existing **109 "SoshOps"
occurrences across 51 files** are a pre-existing rebrand debt — flagged here, fixed
as a **separate sweep**, not folded into this module (doing so would bloat the diff
and mix concerns).

---

## Section 1.4 backend-host decision (locked by owner)

**Resend integration is hosted in Supabase Edge Functions (Deno).** Confirmed.
All of the following are **Edge Functions**, modeled on the existing
`supabase/functions/scheduler/index.ts` (stateless, idempotent, service-role):

- `email-send` — render + send a campaign (batched, idempotent per recipient)
- `email-test` — send a single test email
- `email-domain` — create/verify a Resend sending domain (DNS records)
- `resend-webhook` — ingest Resend events (delivered/open/click/bounce/complaint)
- `ai-generate` — Anthropic Claude generation (server-side)
- `campaign-scheduler` — cron worker that dispatches due campaigns (mirrors `scheduler`)

**No new `api/` Vercel serverless functions are required** for this module. The
`api/` precedent (`create-checkout.js`) is reserved for things that must sit next
to existing Vercel endpoints; nothing here qualifies.

---

## Subscription-tier reconciliation (brief §9 vs. reality)

The brief §9 asks for **Free / Starter / Professional / Agency**. The **actual**
billing system (`src/components/subscription/PaywallProvider.jsx`,
`src/lib/stripe.js`) defines exactly three tiers:

```js
// PaywallProvider.jsx
const planHierarchy = { starter: 0, pro: 1, elite: 2 };
const planDetails   = { pro: { monthlyPrice: 19, annualPrice: 144 },
                        elite: { monthlyPrice: 49, annualPrice: 468 } };
// stripe.js
export const STRIPE_PRICES = { PRO_MONTHLY: ..., ELITE_MONTHLY: ... };
```

**Decision (per brief §3 "do not invent a parallel subscription mechanism"):**
email quotas map onto the **existing `starter` / `pro` / `elite`** keys and the
existing `requirePlan(minPlan, featureKey)` + `UsageTracker` machinery. We do
**not** add a 4th plan or a separate billing system. The brief's four marketing
labels are treated as an optional naming question for the owner (see Open
Questions). Proposed mapping (full detail in [01-PRD.md](./01-PRD.md) §7):

| Capability | `starter` (Free) | `pro` ($19/mo) | `elite` ($49/mo) |
|---|---|---|---|
| Contacts | 500 | 5,000 | 25,000 |
| Emails / month | 1,000 | 25,000 | 150,000 |
| Campaigns / month | 2 | unlimited | unlimited |
| AI generations / month | 10 | 200 | 1,000 |
| Verified sending domains | 0 (shared subdomain) | 1 | 5 |
| Segments / automation | basic | segments | segments + sequences + A/B |

> Note: `UsageTracker.jsx` currently ships **REZEMAI-era limit keys**
> (`resume_created`, `interview_session`, `ai_optimization`…). New email keys
> (`email_contacts`, `email_sends`, `email_ai_generation`) are added alongside;
> the résumé keys are out of scope here and flagged for the separate cleanup.

---

## ⚠ Database recovery (2026-06-08)

The production Supabase project was **deleted** by the owner (cost cleanup), losing
all **row data**. The **schema, RLS, storage config, and Clerk JWT template
survived** in `docs/` and have been reconstructed as version-controlled migrations
under [`supabase/migrations/`](../../supabase/migrations/README.md):
`20260608000100_base_schema.sql`, `20260608000200_rls_policies.sql`,
`20260608000300_storage_assets.sql`. The owner is recreating an empty Supabase
project named **SoshlOps**; apply those migrations to it, configure the `supabase`
JWT template, and re-seed secrets before Phase B. **Data is not restored** — users
re-bootstrap org+user on next login (`src/hooks/useUserBootstrap.js`).

## Open questions — RESOLVED (owner, 2026-06-08)

1. **Supabase project ref.** ~~Unknown.~~ Old project deleted; owner is recreating
   it as **SoshlOps**. Provide the new `project_ref` so migrations can be applied
   (CLI `db push`, SQL Editor, or assistant via Supabase MCP `apply_migration`).
2. **Tier labels.** ✅ **Keep internal keys `starter/pro/elite`.** No new tier, no
   marketing-label remap.
3. **Shared sending domain for `starter`.** ✅ **Yes** — free tier sends from a
   SoshlOps-owned shared subdomain with enforced footer; custom domains are paid.
4. **Clerk `supabase` JWT claims.** ✅ **Resolved from recovered
   `docs/JWT_TEMPLATE_CORRECT.md`:** the JWT carries the org id as a **root claim**
   (`organization_id`, legacy `org_id`) plus `sub`. RLS reads it directly via
   `public.current_org_id()` — **no `users` lookup**. The recovered helper accepts
   either claim name. The email schema (`03-`) was updated to match.
5. **Resend account model.** ✅ **Former** — one SoshlOps-owned Resend account with
   per-tenant sending domains.

---

## Phase A checkpoint

→ **STOP. Please review documents 1–9 and the decisions above. Phase B
implementation begins only after approval.** Phase B sequencing and effort
estimates are in [07-roadmap.md](./07-roadmap.md).
