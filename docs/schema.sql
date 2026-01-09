-- SoshlOps Database Schema (Production-Safe v1)
-- Apply this schema to a fresh Supabase project
-- No billing, roles, or teams in v1

-- Enable required extensions
create extension if not exists "pgcrypto";

-- ============================================
-- TABLE 1: organizations
-- ============================================
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- TABLE 2: users
-- ============================================
create table users (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  clerk_user_id text unique not null,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_users_org on users(organization_id);
create index idx_users_clerk on users(clerk_user_id);

-- ============================================
-- TABLE 3: social_accounts
-- ============================================
create table social_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  platform text not null check (platform in ('x', 'linkedin', 'meta')),
  platform_user_id text not null,
  platform_username text,
  access_token text not null, -- encrypted in application layer
  refresh_token text, -- encrypted in application layer
  token_expires_at timestamptz,
  is_active boolean not null default true,
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(organization_id, platform, platform_user_id)
);

create index idx_social_accounts_org on social_accounts(organization_id);
create index idx_social_accounts_platform on social_accounts(platform);
create index idx_social_accounts_active on social_accounts(is_active);

-- ============================================
-- TABLE 4: posts
-- ============================================
create table posts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  content text not null,
  media_urls text[], -- array of asset URLs
  status text not null check (status in ('draft', 'scheduled', 'published', 'failed')),
  scheduled_at timestamptz,
  published_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_posts_org on posts(organization_id);
create index idx_posts_author on posts(author_id);
create index idx_posts_status on posts(status);
create index idx_posts_scheduled on posts(scheduled_at) where status = 'scheduled';

-- ============================================
-- TABLE 5: post_platforms
-- ============================================
-- Junction table: which platforms a post targets
create table post_platforms (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  social_account_id uuid not null references social_accounts(id) on delete cascade,
  platform text not null check (platform in ('x', 'linkedin', 'meta')),
  platform_post_id text, -- ID from platform after publishing
  status text not null check (status in ('pending', 'published', 'failed')),
  published_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(post_id, social_account_id)
);

create index idx_post_platforms_post on post_platforms(post_id);
create index idx_post_platforms_account on post_platforms(social_account_id);
create index idx_post_platforms_status on post_platforms(status);

-- ============================================
-- TABLE 6: analytics_snapshots
-- ============================================
-- Daily snapshots of post performance
create table analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  post_platform_id uuid not null references post_platforms(id) on delete cascade,
  snapshot_date date not null,
  impressions integer not null default 0,
  engagements integer not null default 0,
  clicks integer not null default 0,
  shares integer not null default 0,
  created_at timestamptz not null default now(),

  unique(post_platform_id, snapshot_date)
);

create index idx_analytics_org on analytics_snapshots(organization_id);
create index idx_analytics_post_platform on analytics_snapshots(post_platform_id);
create index idx_analytics_date on analytics_snapshots(snapshot_date);

-- ============================================
-- TABLE 7: inbox_items
-- ============================================
-- Read-only awareness of mentions, comments, DMs
create table inbox_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  social_account_id uuid not null references social_accounts(id) on delete cascade,
  platform text not null check (platform in ('x', 'linkedin', 'meta')),
  item_type text not null check (item_type in ('mention', 'comment', 'dm')),
  platform_item_id text not null,
  author_name text,
  author_handle text,
  content text,
  is_read boolean not null default false,
  received_at timestamptz not null,
  created_at timestamptz not null default now(),

  unique(social_account_id, platform_item_id)
);

create index idx_inbox_org on inbox_items(organization_id);
create index idx_inbox_account on inbox_items(social_account_id);
create index idx_inbox_type on inbox_items(item_type);
create index idx_inbox_unread on inbox_items(is_read) where is_read = false;

-- ============================================
-- TABLE 8: assets
-- ============================================
-- Metadata for uploaded media (files stored in Supabase Storage)
create table assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  uploader_id uuid not null references users(id) on delete cascade,
  file_name text not null,
  file_type text not null check (file_type in ('image', 'video', 'document')),
  file_size_bytes integer not null,
  storage_path text not null unique, -- org/{org_id}/{uuid}.{ext}
  mime_type text not null,
  created_at timestamptz not null default now()
);

create index idx_assets_org on assets(organization_id);
create index idx_assets_uploader on assets(uploader_id);
create index idx_assets_type on assets(file_type);

-- ============================================
-- UPDATED_AT TRIGGER (DRY)
-- ============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to all tables with updated_at
create trigger update_organizations_updated_at before update on organizations
  for each row execute function update_updated_at_column();

create trigger update_users_updated_at before update on users
  for each row execute function update_updated_at_column();

create trigger update_social_accounts_updated_at before update on social_accounts
  for each row execute function update_updated_at_column();

create trigger update_posts_updated_at before update on posts
  for each row execute function update_updated_at_column();

create trigger update_post_platforms_updated_at before update on post_platforms
  for each row execute function update_updated_at_column();
