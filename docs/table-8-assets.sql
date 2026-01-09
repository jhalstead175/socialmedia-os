-- TABLE 8: assets (standalone)
-- Metadata for uploaded media (files stored in Supabase Storage)

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  uploader_id uuid not null references users(id) on delete cascade,
  file_name text not null,
  file_type text not null check (file_type in ('image', 'video', 'document')),
  file_size_bytes integer not null,
  storage_path text not null unique,
  mime_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_assets_org on assets(organization_id);
create index if not exists idx_assets_uploader on assets(uploader_id);
create index if not exists idx_assets_type on assets(file_type);
