-- =====================================================================
-- 20260608000300_storage_assets.sql
-- SoshlOps Storage — RECOVERED from docs/SUPABASE_SETUP.md (Phase 8).
-- Private `assets` bucket; objects laid out as {org_id}/{uuid}.{ext};
-- org isolation enforced via the first path segment.
-- Uses public.current_org_id() (claim-name tolerant) for consistency
-- with 20260608000200_rls_policies.sql (original docs used a divergent
-- auth.current_org_id() helper that did not otherwise exist).
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('assets', 'assets', false)
on conflict (id) do nothing;

-- Upload only into your own org's folder
create policy "org upload" on storage.objects
  for insert
  with check (
    bucket_id = 'assets'
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );

-- Read only from your own org's folder
create policy "org read" on storage.objects
  for select
  using (
    bucket_id = 'assets'
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );

-- Delete only from your own org's folder
create policy "org delete" on storage.objects
  for delete
  using (
    bucket_id = 'assets'
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );
