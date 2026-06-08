# 06 — UI Wireframe Descriptions

Built from existing **shadcn/ui** primitives in `src/components/ui/` and the
existing dashboard look. New pages register in `src/pages/index.jsx` (PAGES dict +
`<Route>`), matching the existing pattern (PascalCase route + lowercase alias).
Navigation entry "Email" added to the existing sidebar/`Layout`. Charts use
`src/components/ui/chart.jsx` (Recharts). All copy uses **SoshlOps** branding.

Routes added: `Email` (dashboard), `EmailContacts`, `EmailCampaigns`,
`EmailCampaignBuilder`, `EmailAnalytics`, `EmailTemplates`, `EmailSettings`.

---

## Dashboard — `/Email` {#dashboard}

- **Header row:** title "Email" + primary button **New Campaign** (→ builder).
- **KPI cards (shadcn `card`), 6 across, responsive:** Total Contacts ·
  Active Campaigns · Emails Sent (30d) · Open Rate · Click Rate · Unsubscribes.
  Each card: big number + small delta vs. prior period.
- **Performance Trend (`ChartContainer` line chart):** sent / opened / clicked over
  time, date-range select (`select`).
- **Recent Activity (`table` or list):** last campaigns with status `badge`,
  recipients, open/click %, sent date. Mirrors `dashboard/RecentActivity.jsx`.
- **Empty state:** "Import your contacts to get started" CTA when no contacts.

## Contacts — `/EmailContacts`

- **Toolbar:** search `input` · tag/consent `select` filters · **Import CSV** and
  **Add Contact** buttons.
- **Contacts `table`:** checkbox · email · name · tags (`badge`s) · consent
  `badge` (subscribed/unsub/pending) · last activity · row actions (`dropdown-menu`:
  edit, add to segment, unsubscribe, export, delete). Server-paginated.
- **Add/Edit contact (`dialog`):** email, first/last name, tags, custom fields.
- **CSV import (`dialog`, 3 steps):** (1) upload + drop zone; (2) **column mapping**
  table (CSV header → contact field `select`); (3) preview + summary
  (created/updated/skipped/invalid). Progress bar for large files.
- **Bulk bar** when rows selected: tag, add-to-segment, delete, export.

## Segments — within Contacts (tab) / `/EmailContacts?tab=segments` (Phase 2)

- **Segment list `table`:** name, member count, last refreshed, actions.
- **Segment builder (`dialog`):** rule rows — field `select` (tag / custom field /
  engagement / date joined) + operator `select` + value; match **All/Any**
  (`radio-group`); live estimated count; Save.

## Campaign builder — `/EmailCampaignBuilder`

Two-pane layout (`resizable`):

- **Left = editor (`tabs`): Content · Settings · AI.**
  - **Content:** ordered **block list** (Phase 1 = add/remove/move-up-down;
    Phase 2 = drag-and-drop via existing dnd). Block types: heading, text,
    button/CTA (label + url), image (upload/url + alt), divider, spacer. Footer +
    unsubscribe block is pinned, **non-removable**.
    - **AI panel (`tabs`/sheet):** tone `select` (8 tones) · mode `select`
      (generate / blog→email / social→email / subject lines / preview / rewrite) ·
      input `textarea` · **Generate** → inserts blocks; remaining AI-credits shown.
  - **Settings:** name, subject, preview text, from name, from email (`select` of
    verified senders), reply-to, template `select`, audience (segment `select` or
    "entire list"), schedule (`calendar` + time) or send now.
- **Right = live preview** (rendered HTML, desktop/mobile toggle), subject + preview
  shown as an inbox row mock.
- **Top bar:** campaign name (inline edit) · status `badge` · **Send Test**
  (`dialog`, up to 5 emails) · **Save Draft** · **Schedule/Send** (confirm
  `alert-dialog` with audience size + suppression note).

## Campaigns list — `/EmailCampaigns`

- **`table`:** name · status `badge` · audience · recipients · delivered/open/click %
  · scheduled/sent date · actions (edit draft, duplicate, view report, cancel
  scheduled). Filter by status `tabs` (All/Draft/Scheduled/Sent).

## Analytics — `/EmailAnalytics`

- **Account KPIs (cards):** Delivered · Opened · Clicked · Bounced · Unsubscribed ·
  Complained (with rates).
- **Performance Trends (`ChartContainer` line):** opens/clicks over time.
- **Top Campaigns (`table` + small bar chart):** sorted by open/click rate.
- **Per-campaign report (drill-in):** funnel (sent→delivered→opened→clicked),
  bounce/complaint breakdown, link-click table, recipient activity.
- **Date range + campaign filter (`select`).** All charts via `chart.jsx` config
  shape `{ key: { label, color } }`.

## Templates — `/EmailTemplates` (Phase 2)

- **Gallery (`card` grid):** thumbnail, name, category `badge`, actions (use,
  duplicate, edit, delete). SoshlOps system templates marked with a `badge`.
- **Template editor:** same block editor as the campaign builder, minus
  send/schedule.

## Settings — `/EmailSettings`

- **Sending domains:** list with status `badge`; **Add domain** (`dialog`) → shows
  **DNS records `table`** (type/name/value) with copy buttons + **Verify** button;
  re-check status. Free tier shows "Sending from shared SoshlOps subdomain — upgrade
  to use your own domain" with `requirePlan` upgrade CTA.
- **Compliance:** physical mailing address (required in footer), default from
  name/reply-to, double opt-in toggle.
- **Usage:** contacts / sends / AI credits used vs. tier limit (reuse
  `UsageTracker`), upgrade CTA via existing paywall.

## Platform-admin broadcast — existing `EmailCampaignManager.jsx` (repurposed)

Lives under the admin area (`useAdminAuth`). Simple form: subject, body, audience
`select` (all/segment of SoshlOps users), send. Rewired to the `email-send`
function; honors suppression/unsubscribe. **Not** part of tenant navigation.
