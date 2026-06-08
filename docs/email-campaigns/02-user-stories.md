# 02 — User Stories

Format: `As a <role>, I want <capability> so that <value>.` Each story lists
acceptance criteria (AC) and the phase it lands in ([roadmap](./07-roadmap.md)).
Roles: **Member** (tenant user), **Admin** (tenant admin), **PlatformAdmin**
(SoshlOps staff via `useAdminAuth`).

## Epic A — Contacts (Phase 1)

**A1 — Import contacts via CSV.**
As a Member, I want to upload a CSV and map columns so that I can bring my existing
list into SoshlOps.
- AC: column-mapping step; dedupe by email within org; invalid emails reported, not
  imported; summary shows created/updated/skipped/invalid; import runs in an Edge
  Function for files > 1k rows; respects contact limit for the tier (overflow
  blocked with upgrade prompt).

**A2 — Add a contact manually.**
As a Member, I want to add one contact with name, email, and tags so that I can
capture a lead quickly.
- AC: email validated + unique per org; duplicate surfaces the existing contact.

**A3 — Tag and search contacts.**
As a Member, I want to tag, search, and filter contacts so that I can find the right
audience.
- AC: filter by tag/consent/engagement; server-side pagination; search by email/name.

**A4 — Track consent & unsubscribes.**
As an Admin, I want consent and unsubscribe state recorded so that I stay compliant.
- AC: consent status + source + timestamp stored; unsubscribed/complained contacts
  are excluded from all campaign sends; suppression is irreversible without explicit
  re-consent.

**A5 — Export / erase a contact (GDPR).**
As an Admin, I want to export or delete a contact's data so that I can honor a
data-subject request.
- AC: export returns the contact + their events as JSON; erase removes PII and
  tombstones the row; action written to the audit log.

## Epic B — Sending domain (Phase 1)

**B1 — Verify a sending domain.**
As an Admin, I want to add and verify my domain so that emails send from my brand.
- AC: `email-domain` returns DNS records (SPF/DKIM/DMARC); UI shows
  pending/verified; sending from an unverified sender is blocked on paid tiers;
  `starter` uses the shared SoshlOps subdomain.

## Epic C — Campaign builder (Phase 1 → 2)

**C1 — Create a campaign draft.**
As a Member, I want to set name/subject/preview/sender and add content blocks so
that I can compose an email. (P1)
- AC: required fields validated; footer + unsubscribe auto-injected and not
  removable; draft autosaves.

**C2 — Choose a template.** (P2)
As a Member, I want to start from a saved template so that I don't start blank.
- AC: org templates + SoshlOps starter templates; selecting one populates blocks.

**C3 — Drag-and-drop blocks.** (P2)
As a Member, I want to reorder/add blocks by drag-and-drop so that layout is fast.
- AC: reorder persists to `campaigns.blocks`; image + CTA blocks supported.

**C4 — Send a test.** (P1)
As a Member, I want to send a test to myself so that I can verify rendering.
- AC: up to 5 addresses; identical render; doesn't affect campaign recipient counts.

**C5 — Schedule / send.** (P1)
As a Member, I want to send now or schedule so that timing fits my audience.
- AC: send dispatches via `email-send` (idempotent per recipient); schedule is
  picked up by `campaign-scheduler` cron; status transitions
  draft→scheduled→sending→sent (or failed) and is visible.

## Epic D — AI generation (Phase 2)

**D1 — Generate from a prompt.**
As a Member, I want to describe an email and get a draft so that I write faster.
- AC: tone selectable from 8; returns subject + preview + blocks; counts against
  `email_ai_generation`; server enforces the limit.

**D2 — Repurpose a social post / blog.**
As a Member, I want to turn a post or blog URL/text into an email so that I reuse
content.
- AC: source treated as untrusted data; output is structured blocks; no PII leakage.

**D3 — Subject-line & preview variants.**
As a Member, I want several subject lines and preview texts so that I can pick the
best.
- AC: N variants returned; selecting one updates the draft.

**D4 — Tone rewrite.**
As a Member, I want to rewrite existing copy in another tone so that I match the
audience.
- AC: preserves meaning/links; returns rewritten blocks.

## Epic E — Analytics (Phase 1 core → 2 full)

**E1 — See campaign results.** (P1 core)
As a Member, I want delivered/open/click/bounce/unsub per campaign so that I know
performance.
- AC: counters update from `resend-webhook`; rates computed; zero-state handled.

**E2 — See trends and top campaigns.** (P2)
As an Admin, I want trend lines and a top-campaigns table so that I can compare.
- AC: `chart.jsx` line/bar; date-range filter; data from daily rollup.

## Epic F — Billing & limits (Phase 1)

**F1 — Hit a limit and upgrade.**
As a Member, when I exceed my tier's contacts/sends/AI, I want a clear upgrade path
so that I can continue.
- AC: `requirePlan` modal with the right copy; server-side enforcement; usage shown
  in `UsageTracker`.

## Epic G — Platform admin (Phase 1)

**G1 — Admin broadcast.**
As a PlatformAdmin, I want to send an announcement to a user segment so that I can
reach customers.
- AC: repurposed `EmailCampaignManager.jsx`, gated by `useAdminAuth`, sends via
  `email-send`; never bypasses unsubscribe/suppression.

## Epic H — Compliance & security (cross-cutting)

**H1 — Unsubscribe in one click.**
As a recipient, I want a working one-click unsubscribe so that I can opt out.
- AC: `List-Unsubscribe` + `List-Unsubscribe-Post` headers; unsubscribe page
  records suppression without login; immediate exclusion from future sends.

**H2 — Audit trail.**
As an Admin, I want sensitive actions logged so that I can review activity.
- AC: campaign send, domain change, export/erase, suppression writes to
  `AuditEvent`.

## Epic I — Enterprise (Phase 3)

**I1 — Automated sequences.** Drip/sequence with delays + branching.
**I2 — A/B testing.** Subject/content split with winner selection.
**I3 — Team roles.** Per-tenant roles (editor/sender/viewer) on email resources.
**I4 — Deliverability tooling.** Spam-score preview, seed-list, domain health.
