# Supabase migrations

Version-controlled database schema for SoshlOps. **This directory is the source of
truth** — apply these in order to stand up a fresh Supabase project so the schema
can always be rebuilt (it could not be, before 2026-06-08).

## Provenance

On 2026-06-08 the production Supabase project was deleted, losing all **row data**.
The **schema** survived only as loose SQL/Markdown under `docs/`. These migrations
faithfully reconstruct it and now live where they belong.

| Migration | Source | Notes |
|---|---|---|
| `20260608000100_base_schema.sql` | `docs/schema.sql` | 8 tables + indexes + `updated_at` triggers. Verbatim. |
| `20260608000200_rls_policies.sql` | `docs/policies.sql` | RLS + `public.current_org_id()`. **Hardened**: helper accepts JWT claim `organization_id` OR `org_id` (docs disagreed). |
| `20260608000300_storage_assets.sql` | `docs/SUPABASE_SETUP.md` §8 | Private `assets` bucket + org-folder storage policies. |

Pending (Phase B of the email module — see `docs/email-campaigns/`): an
`*_email_campaigns.sql` migration derived from
`docs/email-campaigns/03-database-schema.sql`, applied only after the design is
approved. Its RLS uses the same `public.current_org_id()` helper defined here.

## Apply to a fresh project

After recreating the Supabase project named **SoshlOps** and setting env
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, server `SUPABASE_SERVICE_ROLE_KEY`,
`ENCRYPTION_KEY`):

- **Supabase CLI:** `supabase link --project-ref <ref>` then `supabase db push`.
- **Or** paste each file (in filename order) into the SQL Editor.
- **Or** ask the assistant to apply them via the Supabase MCP `apply_migration`
  once the new `project_ref` is known.

Then configure the Clerk **`supabase`** JWT template (claim
`organization_id` from `unsafe_metadata.organization_id`, per
`docs/JWT_TEMPLATE_CORRECT.md`) and re-create the OAuth/app secrets.

## ⚠ Data is NOT restored

These rebuild structure only. Organizations, users, social accounts, posts,
analytics, inbox items, and assets must be re-created by users signing in again
(the bootstrap flow in `src/hooks/useUserBootstrap.js` recreates org+user on first
login). If a `pg_dump` backup of the old project exists, restore data separately.

## The old `docs/*.sql` files

`docs/schema.sql`, `docs/policies.sql`, `docs/table-8-assets.sql` are kept as
historical reference but are **superseded** by this directory. Treat these
migrations as canonical.
