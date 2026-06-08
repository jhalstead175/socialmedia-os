-- =====================================================================
-- 20260608000200_rls_policies.sql
-- SoshlOps RLS — RECOVERED + HARDENED from docs/policies.sql.
-- Apply AFTER 20260608000100_base_schema.sql.
-- Enforces organization-level isolation using the Clerk JWT.
--
-- ⚠ CLAIM-NAME AMBIGUITY (resolved defensively):
--   The original docs disagreed on the org-id JWT claim name:
--     * docs/policies.sql + SUPABASE_SETUP.md  -> 'org_id'
--     * docs/JWT_TEMPLATE_CORRECT.md (latest)   -> 'organization_id' (root)
--   current_org_id() below accepts EITHER, so RLS works regardless of
--   which name the recreated Clerk `supabase` JWT template emits.
--   Recommended template claim (per JWT_TEMPLATE_CORRECT.md):
--     { "sub": "{{user.id}}",
--       "organization_id": "{{user.unsafe_metadata.organization_id}}" }
-- =====================================================================

-- ---------- HELPER: extract org_id from JWT (claim-name tolerant) ----------
create or replace function public.current_org_id()
returns uuid as $$
  select coalesce(
           nullif(auth.jwt() ->> 'organization_id', ''),
           nullif(auth.jwt() ->> 'org_id', '')
         )::uuid;
$$ language sql stable;

-- ---------- ENABLE RLS ----------
alter table organizations       enable row level security;
alter table users               enable row level security;
alter table social_accounts     enable row level security;
alter table posts               enable row level security;
alter table post_platforms      enable row level security;
alter table analytics_snapshots enable row level security;
alter table inbox_items         enable row level security;
alter table assets              enable row level security;

-- ---------- POLICIES (org isolation) ----------
create policy "org isolation" on organizations
  for all using (id = public.current_org_id());

create policy "org isolation" on users
  for all using (organization_id = public.current_org_id());

create policy "org isolation" on social_accounts
  for all using (organization_id = public.current_org_id());

create policy "org isolation" on posts
  for all using (organization_id = public.current_org_id());

-- post_platforms has no organization_id; join through posts
create policy "org isolation" on post_platforms
  for all using (
    exists (
      select 1 from posts
      where posts.id = post_platforms.post_id
        and posts.organization_id = public.current_org_id()
    )
  );

create policy "org isolation" on analytics_snapshots
  for all using (organization_id = public.current_org_id());

create policy "org isolation" on inbox_items
  for all using (organization_id = public.current_org_id());

create policy "org isolation" on assets
  for all using (organization_id = public.current_org_id());

-- NOTE: original helper was declared SECURITY DEFINER. It is not needed
-- here (the function only reads request JWT claims, touches no tables),
-- so it is omitted to keep least privilege. Re-add if a future policy
-- needs it to read a table the caller can't.
