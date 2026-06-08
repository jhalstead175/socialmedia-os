# 08 — Recommended Folder Structure

Consistent with the existing layout (`src/pages/`, `src/components/`, `src/api/`,
`src/hooks/`, `supabase/functions/`, `api/`). **No Next.js structures.** New files
are additive; the only removals are the contaminated stubs called out in
[README](./README.md) §2.

```
src/
  pages/
    Email.jsx                      # dashboard (route /Email)
    EmailContacts.jsx              # contacts + segments tabs
    EmailCampaigns.jsx             # campaign list
    EmailCampaignBuilder.jsx       # builder (content/settings/AI + preview)
    EmailAnalytics.jsx
    EmailTemplates.jsx             # Phase 2
    EmailSettings.jsx              # sending domains, compliance, usage
    index.jsx                      # EDIT: register the above in PAGES + <Route>

  components/
    email/
      EmailService.jsx             # EDIT: strip ALL REZEMAI content (§2.4)
      builder/
        BlockList.jsx
        BlockEditor.jsx            # heading/text/button/image/divider/spacer
        BlockRenderer.jsx          # blocks -> preview HTML (shared w/ server render)
        AiPanel.jsx                # tone select + generate modes
        CampaignPreview.jsx
        SendTestDialog.jsx
        ScheduleDialog.jsx
      contacts/
        ContactsTable.jsx
        ContactDialog.jsx
        CsvImportDialog.jsx        # 3-step upload/map/summary
        SegmentBuilderDialog.jsx   # Phase 2
      analytics/
        EmailKpiCards.jsx
        EmailTrendChart.jsx        # uses ui/chart.jsx
        TopCampaignsTable.jsx
        CampaignReport.jsx
      settings/
        SendingDomains.jsx         # DNS records + verify
        ComplianceSettings.jsx
        EmailUsage.jsx             # reuses subscription/UsageTracker
    admin/
      EmailCampaignManager.jsx     # EDIT: repurpose -> platform-admin broadcast

  api/
    entities.js                    # EDIT: remove EmailCampaign/EmailTemplate/ScheduledEmail stubs
    integrations.js                # EDIT: remove InvokeLLM/SendEmail email stubs (replaced server-side)
    email/                         # NEW client data-access layer (no secrets)
      contacts.js                  # useContacts() over useSupabaseClient()
      segments.js                  # useSegments()
      campaigns.js                 # useCampaigns()
      templates.js                 # useTemplates()
      analytics.js                 # useCampaignAnalytics()
      domains.js                   # useSendingDomains()
      functions.js                 # invoke email-send/email-test/email-domain/ai-generate

  hooks/
    useSupabaseClient.ts           # (existing, reused)
    useEmailUsage.js               # NEW: remaining contacts/sends/AI for tier
  lib/
    supabaseClient.ts              # EDIT: add Email* TypeScript types (see 03)
    emailBlocks.js                 # NEW: shared block schema + helpers (client+server parity)

supabase/
  functions/
    _shared/                       # NEW (none today; each fn is self-contained)
      cors.ts
      supabaseAdmin.ts             # service-role client factory
      clerk.ts                     # JWKS-verified Clerk JWT
      resend.ts                    # Resend API helpers
      blocks.ts                    # blocks -> HTML/text renderer (server)
    email-send/index.ts
    email-test/index.ts
    email-domain/index.ts
    email-unsubscribe/index.ts     # public, signed-token
    resend-webhook/index.ts        # Svix-verified
    ai-generate/
      index.ts
      tones.ts                     # 8 tone presets
      tools.ts                     # emit_email / emit_variants schemas
    campaign-scheduler/index.ts    # cron dispatcher (mirrors scheduler/)

api/                               # NO new files (Resend is on Edge Functions per §1.4)

docs/
  email-campaigns/                 # this design set
```

## Edits vs. new (summary)

| File | Action |
|---|---|
| `src/pages/index.jsx` | EDIT — register new pages |
| `src/api/entities.js` | EDIT — remove 3 email stubs |
| `src/api/integrations.js` | EDIT — remove `InvokeLLM`/`SendEmail` email stubs |
| `src/lib/supabaseClient.ts` | EDIT — add `Email*` types |
| `src/components/email/EmailService.jsx` | EDIT — strip REZEMAI |
| `src/components/admin/EmailCampaignManager.jsx` | EDIT — repurpose to admin broadcast |
| `src/lib/role.js` | NO EDIT here — REZEMAI `COPY` cleanup is a separate task |
| everything else above | NEW |

> The 109 `SoshOps`→`SoshlOps` occurrences are a **separate rebrand sweep**, not
> part of this module's diff.
