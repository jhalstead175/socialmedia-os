-- =====================================================================
-- 03 — Email Campaigns module: Postgres schema (DDL + RLS + indexes)
-- SoshlOps · Supabase Postgres 17 · Phase A design (NOT YET APPLIED)
-- ---------------------------------------------------------------------
-- Conventions matched from existing app (src/lib/supabaseClient.ts):
--   * every tenant table has organization_id uuid (FK -> organizations)
--   * uuid PKs, created_at/updated_at timestamptz
--   * status/type columns as text + CHECK (app uses literal unions)
--   * users come from Clerk, mirrored in public.users(clerk_user_id)
--
-- Tenancy / RLS model (CONFIRMED from recovered docs/policies.sql ->
-- supabase/migrations/20260608000200_rls_policies.sql):
--   The Clerk `supabase` JWT carries the org id as a ROOT claim
--   ('organization_id', or legacy 'org_id'). RLS reads it directly via
--   the existing helper public.current_org_id() — NO users-table lookup.
--   -> every policy: organization_id = public.current_org_id()
--   Edge Functions use the service role (RLS bypassed) and MUST scope
--   organization_id explicitly in code.
--
-- This file REUSES objects created by the base migrations:
--   * public.current_org_id()        (20260608000200_rls_policies.sql)
--   * update_updated_at_column()     (20260608000100_base_schema.sql)
-- so it must be applied AFTER them. No new helper schema is introduced.
-- =====================================================================

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists citext;      -- case-insensitive email

-- (No helper/trigger functions defined here — see note above; this module
--  reuses public.current_org_id() and update_updated_at_column().)

-- =====================================================================
-- SENDING DOMAINS  (Resend domain verification, per tenant)
-- =====================================================================
create table public.email_sending_domains (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  domain          text not null,
  resend_domain_id text,                       -- id returned by Resend
  status          text not null default 'pending'
                    check (status in ('pending','verifying','verified','failed','disabled')),
  dns_records     jsonb not null default '[]', -- [{type,name,value,priority,status}]
  region          text default 'us-east-1',
  is_shared       boolean not null default false,  -- SoshlOps shared subdomain (free tier)
  verified_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (organization_id, domain)
);
create index on public.email_sending_domains (organization_id, status);

-- =====================================================================
-- CONTACTS
-- =====================================================================
create table public.email_contacts (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email           citext not null,
  first_name      text,
  last_name       text,
  tags            text[] not null default '{}',
  custom_fields   jsonb not null default '{}',
  -- consent / compliance
  consent_status  text not null default 'subscribed'
                    check (consent_status in ('subscribed','unsubscribed','pending','cleaned','complained')),
  consent_source  text,                         -- 'csv_import','manual','signup_form','api'
  consent_at      timestamptz,
  consent_ip      inet,
  consent_user_agent text,
  unsubscribed_at timestamptz,
  -- denormalized engagement (updated by webhook rollup) for fast segmenting
  last_emailed_at timestamptz,
  last_opened_at  timestamptz,
  last_clicked_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (organization_id, email)
);
create index on public.email_contacts (organization_id, consent_status);
create index on public.email_contacts (organization_id, last_opened_at);
create index on public.email_contacts using gin (tags);
create index on public.email_contacts using gin (custom_fields jsonb_path_ops);

-- =====================================================================
-- SEGMENTS  (+ materialized membership)
-- =====================================================================
create table public.email_segments (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name            text not null,
  description     text,
  -- rule tree, e.g. {"match":"all","rules":[{"field":"tags","op":"contains","value":"vip"}]}
  definition      jsonb not null default '{"match":"all","rules":[]}',
  member_count    integer not null default 0,
  last_refreshed_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (organization_id, name)
);
create index on public.email_segments (organization_id);

create table public.email_segment_members (
  segment_id      uuid not null references public.email_segments(id) on delete cascade,
  contact_id      uuid not null references public.email_contacts(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  added_at        timestamptz not null default now(),
  primary key (segment_id, contact_id)
);
create index on public.email_segment_members (organization_id);
create index on public.email_segment_members (contact_id);

-- =====================================================================
-- TEMPLATES
-- =====================================================================
create table public.email_templates (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name            text not null,
  category        text,                         -- 'newsletter','promo','announcement',...
  subject         text,
  preview_text    text,
  blocks          jsonb not null default '[]',  -- canonical block model (see 04/06)
  is_system       boolean not null default false, -- SoshlOps-provided starter templates
  thumbnail_url   text,
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index on public.email_templates (organization_id, category);

-- =====================================================================
-- CAMPAIGNS
-- =====================================================================
create table public.email_campaigns (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name            text not null,
  subject         text,
  preview_text    text,
  from_name       text,
  from_email      text,                         -- must belong to a verified domain (paid)
  reply_to        text,
  sending_domain_id uuid references public.email_sending_domains(id) on delete set null,
  template_id     uuid references public.email_templates(id) on delete set null,
  blocks          jsonb not null default '[]',
  html_cache      text,                         -- rendered HTML snapshot at send time
  -- targeting: a segment, or whole list when segment_id is null
  segment_id      uuid references public.email_segments(id) on delete set null,
  target_all      boolean not null default false,
  status          text not null default 'draft'
                    check (status in ('draft','scheduled','sending','sent','paused','failed','canceled')),
  scheduled_at    timestamptz,
  send_started_at timestamptz,
  sent_at         timestamptz,
  -- denormalized counters (updated by send + webhooks) for cheap analytics
  recipient_count integer not null default 0,
  delivered_count integer not null default 0,
  opened_count    integer not null default 0,
  clicked_count   integer not null default 0,
  bounced_count   integer not null default 0,
  complained_count integer not null default 0,
  unsubscribed_count integer not null default 0,
  failed_count    integer not null default 0,
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index on public.email_campaigns (organization_id, status);
create index on public.email_campaigns (status, scheduled_at)
  where status = 'scheduled';   -- cron pickup (partial index)

-- =====================================================================
-- CAMPAIGN RECIPIENTS  (per-recipient send ledger; idempotency unit)
-- =====================================================================
create table public.email_campaign_recipients (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  campaign_id     uuid not null references public.email_campaigns(id) on delete cascade,
  contact_id      uuid not null references public.email_contacts(id) on delete cascade,
  email           citext not null,              -- snapshot at send time
  status          text not null default 'pending'
                    check (status in ('pending','sent','delivered','opened','clicked',
                                      'bounced','complained','unsubscribed','failed','skipped')),
  resend_message_id text,                        -- Resend id -> webhook correlation
  error           text,
  sent_at         timestamptz,
  delivered_at    timestamptz,
  first_opened_at timestamptz,
  first_clicked_at timestamptz,
  open_count      integer not null default 0,
  click_count     integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (campaign_id, contact_id)              -- idempotency: one row per recipient
);
create index on public.email_campaign_recipients (organization_id);
create index on public.email_campaign_recipients (campaign_id, status);
create index on public.email_campaign_recipients (resend_message_id);

-- =====================================================================
-- ANALYTICS EVENTS  (raw, append-only; from Resend webhook)
-- =====================================================================
create table public.email_analytics_events (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  campaign_id     uuid references public.email_campaigns(id) on delete cascade,
  recipient_id    uuid references public.email_campaign_recipients(id) on delete cascade,
  contact_id      uuid references public.email_contacts(id) on delete set null,
  event_type      text not null
                    check (event_type in ('sent','delivered','delivery_delayed','opened','clicked',
                                          'bounced','complained','unsubscribed')),
  resend_message_id text,
  provider_event_id text,                        -- dedupe key from Resend
  url             text,                          -- for click events
  user_agent      text,
  ip              inet,
  metadata        jsonb not null default '{}',
  occurred_at     timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  unique (provider_event_id)                     -- idempotent ingestion
);
create index on public.email_analytics_events (organization_id, event_type, occurred_at);
create index on public.email_analytics_events (campaign_id, event_type);
create index on public.email_analytics_events (recipient_id);

-- =====================================================================
-- SUPPRESSION LIST  (org-wide do-not-send: unsub, hard bounce, complaint)
-- =====================================================================
create table public.email_suppressions (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email           citext not null,
  reason          text not null
                    check (reason in ('unsubscribed','hard_bounce','complained','manual')),
  source_campaign_id uuid references public.email_campaigns(id) on delete set null,
  created_at      timestamptz not null default now(),
  unique (organization_id, email)
);
create index on public.email_suppressions (organization_id, email);

-- =====================================================================
-- AI GENERATIONS  (usage/audit for Anthropic calls; feeds UsageTracker)
-- =====================================================================
create table public.email_ai_generations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id         uuid references public.users(id) on delete set null,
  campaign_id     uuid references public.email_campaigns(id) on delete set null,
  kind            text not null
                    check (kind in ('generate','blog_to_email','social_to_email',
                                    'subject_lines','preview_text','tone_rewrite')),
  tone            text,
  model           text,                          -- e.g. 'claude-sonnet-4-6'
  input_tokens    integer,
  output_tokens   integer,
  created_at      timestamptz not null default now()
);
create index on public.email_ai_generations (organization_id, created_at);

-- =====================================================================
-- updated_at triggers
-- =====================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'email_sending_domains','email_contacts','email_segments','email_templates',
    'email_campaigns','email_campaign_recipients'
  ] loop
    execute format(
      'create trigger trg_%1$s_touch before update on public.%1$s
         for each row execute function update_updated_at_column();', t);
  end loop;
end $$;

-- =====================================================================
-- ROW LEVEL SECURITY
-- Read/write from the SPA only for rows in the caller's org.
-- Uses public.current_org_id() (recovered base RLS helper, claim-tolerant).
-- Service-role (Edge Functions) bypasses RLS and scopes org in code.
-- =====================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'email_sending_domains','email_contacts','email_segments','email_segment_members',
    'email_templates','email_campaigns','email_campaign_recipients',
    'email_analytics_events','email_suppressions','email_ai_generations'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force row level security;', t);

    -- SELECT: own org only
    execute format($f$
      create policy %1$s_select on public.%1$s
        for select using (organization_id = public.current_org_id());
    $f$, t);

    -- INSERT: must stamp own org
    execute format($f$
      create policy %1$s_insert on public.%1$s
        for insert with check (organization_id = public.current_org_id());
    $f$, t);

    -- UPDATE: own org both sides
    execute format($f$
      create policy %1$s_update on public.%1$s
        for update using (organization_id = public.current_org_id())
                   with check (organization_id = public.current_org_id());
    $f$, t);

    -- DELETE: own org only
    execute format($f$
      create policy %1$s_delete on public.%1$s
        for delete using (organization_id = public.current_org_id());
    $f$, t);
  end loop;
end $$;

-- NOTE: system templates (is_system = true) are global. Either seed them per-org,
-- or add a permissive read policy:
--   create policy email_templates_system_read on public.email_templates
--     for select using (is_system = true);
-- (Left commented; decide at implementation — README Open Question.)

-- =====================================================================
-- Mapping to TypeScript types (add to src/lib/supabaseClient.ts in Phase B)
-- =====================================================================
--   EmailContact, EmailSegment, EmailTemplate, EmailCampaign,
--   EmailCampaignRecipient, EmailAnalyticsEvent, EmailSendingDomain,
--   EmailSuppression  — same style as Organization/User/Post/etc.
-- =====================================================================
