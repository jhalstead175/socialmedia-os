# 07 — Development Roadmap & Effort Estimates

Estimates assume one full-stack engineer familiar with this stack, in
**engineer-days** (design-ready, excludes major QA cycles). Ranges reflect
unknowns (chiefly the Supabase project ref / live RLS reconciliation — README Open
Question #1). Phases are gated; Phase B begins only after Phase A approval.

## Phase 0 — Foundations (prereq for all) · ~4–6 d
- Resolve open questions (project ref, tier labels, Resend account model). · 0.5 d
- Apply schema migration (`03-database-schema.sql`) to the correct project;
  reconcile RLS helpers with live policies; generate TS types. · 1.5–2 d
- Edge Function scaffolding + secrets (`RESEND_API_KEY`, `ANTHROPIC_API_KEY`,
  `RESEND_WEBHOOK_SECRET`); shared `_shared` helpers (CORS, service client, Clerk
  JWKS verify) — currently each function is self-contained, so introduce a small
  shared module. · 1.5 d
- Add `UsageTracker` email keys; remove the 3 `entities.js` email stubs; add
  `src/api/email/` client layer skeleton. · 0.5–1 d

## Phase 1 — MVP · ~15–20 d
Goal: a tenant can import contacts, verify a domain, build a basic campaign, test,
send, and see core KPIs.

| Workstream | Est. |
|---|---|
| Contacts: CRUD hooks + page (`/EmailContacts`), search/filter/pagination | 2–3 d |
| CSV import (`dialog` + column mapping) + batched import Edge Function | 2–3 d |
| Consent/unsubscribe model + public `email-unsubscribe` function + page | 1.5 d |
| `email-domain` function + Settings domain UI (DNS records, verify) | 2 d |
| Campaign builder MVP (block list, settings, preview) `/EmailCampaignBuilder` | 3 d |
| `email-send` (idempotent, batched) + `email-test` | 2.5 d |
| `resend-webhook` (delivered/open/click/bounce/complaint) + counters | 2 d |
| Email dashboard (`/Email`) with core KPIs + recent activity | 1.5 d |
| Billing gates (`requirePlan` + server checks) for contacts/sends | 1 d |
| Repurpose admin `EmailCampaignManager.jsx` onto real backend | 0.5–1 d |

**Exit:** send a real campaign to a verified domain; webhook updates KPIs;
suppression works; limits enforced.

## Phase 2 — Growth · ~14–18 d
Goal: segmentation, AI suite, full analytics, templates, drag-and-drop.

| Workstream | Est. |
|---|---|
| Segments: builder UI + `segment_members` materialization + refresh-before-send | 3 d |
| `ai-generate` function (Anthropic, 8 tones, structured tool output) | 3–4 d |
| AI panel in builder (generate / repurpose / subject / preview / rewrite) | 2 d |
| Drag-and-drop block editor + image upload (Supabase Storage) | 2.5 d |
| Templates: gallery, save/load, SoshlOps system templates | 2 d |
| Full analytics page (`chart.jsx` trends, top campaigns, per-campaign funnel) + daily rollup | 3 d |
| `campaign-scheduler` cron + scheduled sends UI | 1 d |

**Exit:** AI-assisted, segmented, scheduled campaigns with full analytics.

## Phase 3 — Enterprise · ~16–22 d
Goal: automation, A/B, team roles, deliverability tooling.

| Workstream | Est. |
|---|---|
| Sequences/automation (steps, delays, branching) data model + runner | 6–8 d |
| A/B testing (subject/content split + winner selection) | 3–4 d |
| Team roles on email resources (editor/sender/viewer) | 3 d |
| Deliverability tooling (spam-score preview, domain health, seed list) | 3 d |
| Advanced GDPR (self-serve export/erasure flows) + audit dashboards | 2–3 d |

## Cross-cutting (every phase)
- Tests for RLS / cross-tenant isolation, idempotency, webhook dedupe.
- Audit logging (`AuditEvent`) on send/domain/export/erase/suppression.
- `npm run lint` + `build` green; preview-deploy verification.

## Rough totals
- **Phase 0:** ~4–6 d · **Phase 1 (MVP):** ~15–20 d · **Phase 2:** ~14–18 d ·
  **Phase 3:** ~16–22 d.
- **To first shippable MVP:** ~**4–5 weeks** (Phase 0 + 1). Full module (0–2):
  ~**8–10 weeks**; with Enterprise (0–3): ~**12–15 weeks**.

> Parallelization: contacts, domain/sending, and webhook workstreams are largely
> independent within Phase 1 and can be split across engineers to compress the
> calendar.
