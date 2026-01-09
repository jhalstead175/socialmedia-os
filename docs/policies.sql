-- SoshlOps RLS Policies (Production-Safe)
-- Apply AFTER schema.sql
-- Enforces organization-level isolation using Clerk JWT

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
alter table organizations enable row level security;
alter table users enable row level security;
alter table social_accounts enable row level security;
alter table posts enable row level security;
alter table post_platforms enable row level security;
alter table analytics_snapshots enable row level security;
alter table inbox_items enable row level security;
alter table assets enable row level security;

-- ============================================
-- HELPER FUNCTION: Extract org_id from JWT
-- ============================================
-- Assumes Clerk JWT includes org_id in custom claims
create or replace function auth.current_org_id()
returns uuid as $$
  select (auth.jwt() ->> 'org_id')::uuid;
$$ language sql stable;

-- ============================================
-- POLICY: organizations
-- ============================================
create policy "org isolation"
  on organizations
  for all
  using (id = auth.current_org_id());

-- ============================================
-- POLICY: users
-- ============================================
create policy "org isolation"
  on users
  for all
  using (organization_id = auth.current_org_id());

-- ============================================
-- POLICY: social_accounts
-- ============================================
create policy "org isolation"
  on social_accounts
  for all
  using (organization_id = auth.current_org_id());

-- ============================================
-- POLICY: posts
-- ============================================
create policy "org isolation"
  on posts
  for all
  using (organization_id = auth.current_org_id());

-- ============================================
-- POLICY: post_platforms
-- ============================================
-- Join through posts to get org_id
create policy "org isolation"
  on post_platforms
  for all
  using (
    exists (
      select 1 from posts
      where posts.id = post_platforms.post_id
      and posts.organization_id = auth.current_org_id()
    )
  );

-- ============================================
-- POLICY: analytics_snapshots
-- ============================================
create policy "org isolation"
  on analytics_snapshots
  for all
  using (organization_id = auth.current_org_id());

-- ============================================
-- POLICY: inbox_items
-- ============================================
create policy "org isolation"
  on inbox_items
  for all
  using (organization_id = auth.current_org_id());

-- ============================================
-- POLICY: assets
-- ============================================
create policy "org isolation"
  on assets
  for all
  using (organization_id = auth.current_org_id());

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify all tables have RLS enabled:
/*
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
and tablename in (
  'organizations',
  'users',
  'social_accounts',
  'posts',
  'post_platforms',
  'analytics_snapshots',
  'inbox_items',
  'assets'
)
order by tablename;
*/
