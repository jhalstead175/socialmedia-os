# 09 — Future Enhancement Opportunities

Beyond the three-phase roadmap. Roughly priority-ordered within groups.

## Channel & cross-product
- **Unified cross-channel campaigns** — coordinate an email with the existing social
  posting product (same content repurposed to X/LinkedIn/Meta + email in one flow).
- **SMS / push** as additional channels behind the same campaign + analytics model.
- **Landing pages / forms** — hosted signup forms that write directly to
  `email_contacts` with consent capture (feeds double opt-in).

## AI depth (Anthropic)
- **Send-time + subject optimization** — model-assisted best-time-to-send and
  predictive subject scoring from the tenant's own open history.
- **Brand-voice memory** — persist a per-org voice profile (could integrate the
  existing `brand-voice` skills) so AI output matches the tenant's tone without
  re-specifying.
- **Auto-segmentation** — AI proposes segments from engagement patterns.
- **Inline content assistant** — block-level rewrite/expand/shorten in the editor.
- **Image generation** — revisit the `GenerateImage` integration server-side for
  hero/illustration blocks.

## Deliverability & reputation
- **Dedicated IPs + warmup** for high-volume `elite` tenants.
- **Inbox-placement / spam-score testing** (seed lists, Google Postmaster signals).
- **Automatic list hygiene** — re-engagement campaigns + auto-sunset of cold
  contacts to protect sender reputation.
- **BIMI** support once DMARC enforcement is in place.

## Automation & lifecycle
- **Visual journey builder** — multi-branch automations with triggers (signup, tag
  added, link clicked, date-based).
- **Behavioral triggers from the social product** — e.g. email a segment when a
  social post hits an engagement threshold.
- **Transactional templates** — consolidate the rebuilt SoshlOps lifecycle emails
  (post-REZEMAI cleanup) into this template system with a transactional send API.

## Analytics & revenue
- **Revenue attribution** — UTM + (optional) Stripe linkage to tie campaigns to
  conversions.
- **Cohort & retention** reporting; heatmap of click positions.
- **Exportable reports / scheduled email digests** to stakeholders.

## Platform & compliance
- **Webhooks/Zapier out** — let tenants forward email events to their own tools.
- **Public API + API keys** for programmatic contact/campaign management.
- **Granular consent & preference center** — topic-level subscriptions, regional
  consent (GDPR/CCPA) handling, double opt-in flows.
- **Per-tenant data residency / region selection** for Resend + storage.
- **SOC2-aligned audit exports** building on the `AuditEvent` log.

## Technical debt to retire alongside
- Complete the **SoshOps → SoshlOps** rebrand sweep (109 refs / 51 files).
- Replace the remaining throwing stubs in `integrations.js`
  (`UploadFile`, `GenerateImage`, `ExtractDataFromUploadedFile`, …) with real
  server-side implementations as features need them.
- Add **signature-verifying** Clerk JWT checks everywhere (the existing
  `oauth-linkedin-start` decode-only check and the unauthenticated
  `api/create-checkout.js` are pre-existing gaps worth closing).
