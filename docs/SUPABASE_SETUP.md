# Supabase Setup for SoshlOps

**Objective**: Transform SoshlOps from UI-only mockup to operational product with real data persistence.

**Stack**:
- **Auth**: Clerk (existing)
- **Database**: Supabase Postgres
- **Storage**: Supabase Storage
- **RLS**: Org-level isolation via JWT

---

## Phase 0: Create Supabase Project (10 minutes)

### 1. Create Project

1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Choose settings:
   - **Organization**: Your org or create new
   - **Name**: `soshlops-production` (or similar)
   - **Database Password**: Generate strong password, **store securely**
   - **Region**: Closest to your users (US-East recommended)
   - **Pricing Plan**: Free tier is fine for development
4. Click **Create new project**
5. Wait 2-3 minutes for provisioning

### 2. Get Credentials

Once provisioned, go to **Project Settings → API**:

- Copy **Project URL** → This is `VITE_SUPABASE_URL`
- Copy **anon public key** → This is `VITE_SUPABASE_ANON_KEY`
- **DO NOT** use service role key in frontend

### 3. Add to .env

Create `.env` (copy from `.env.example`):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Phase 1: Apply Database Schema (5 minutes)

### 1. Enable Extensions

Go to **SQL Editor** in Supabase dashboard.

Run:

```sql
create extension if not exists "pgcrypto";
```

### 2. Apply Schema

Copy contents of `docs/schema.sql` and paste into SQL Editor.

Click **Run**.

You should see:
- 8 tables created
- Indexes created
- Triggers created

### 3. Verify Tables

Run:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

You should see:
- `analytics_snapshots`
- `assets`
- `inbox_items`
- `organizations`
- `post_platforms`
- `posts`
- `social_accounts`
- `users`

---

## Phase 2: Apply RLS Policies (5 minutes)

### 1. Apply Policies

Copy contents of `docs/policies.sql` and paste into SQL Editor.

Click **Run**.

### 2. Verify RLS Enabled

Run:

```sql
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
```

All tables should show `rowsecurity = true`.

---

## Phase 3: Configure Clerk JWT (CRITICAL)

**Why**: RLS policies rely on `org_id` in the JWT. Without this, all queries will fail.

### 1. Add org_id to Clerk JWT

1. Go to **Clerk Dashboard** → **JWT Templates**
2. Create new template or edit existing
3. Add to claims:

```json
{
  "org_id": "{{organization.id}}"
}
```

4. Save template
5. Use this template in your Clerk provider

### 2. Test JWT (Optional but Recommended)

Use Clerk's test token to verify `org_id` is present:

```bash
# Decode JWT at jwt.io
# Verify "org_id" field exists
```

---

## Phase 4: Install Dependencies (1 minute)

```bash
npm install @supabase/supabase-js
```

---

## Phase 5: Wire Up Supabase Client (Already Done)

The client is already created at:
- `src/lib/supabaseClient.ts`

It will work once you add env vars from Phase 0.

---

## Phase 6: Bootstrap User & Org (Code to Write)

When a user logs in via Clerk for the first time, you need to:

1. Check if user exists in `users` table
2. If not:
   - Create `organization`
   - Create `users` row
   - Store Clerk user ID + org ID

**Example flow**:

```typescript
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@clerk/clerk-react';

async function bootstrapUser(clerkUser) {
  const clerkUserId = clerkUser.id;

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (existingUser) {
    return existingUser; // Already bootstrapped
  }

  // Create organization
  const { data: org } = await supabase
    .from('organizations')
    .insert({ name: clerkUser.fullName || 'My Organization' })
    .select()
    .single();

  // Create user
  const { data: newUser } = await supabase
    .from('users')
    .insert({
      organization_id: org.id,
      clerk_user_id: clerkUserId,
      full_name: clerkUser.fullName,
      email: clerkUser.primaryEmailAddress?.emailAddress
    })
    .select()
    .single();

  return newUser;
}
```

**Where to call this**:
- In `Layout.jsx` after Clerk auth succeeds
- Or in a React hook like `useBootstrapUser`

---

## Phase 7: Make Features Real (Incremental)

### Composer → Real Save

Replace demo mode logic with:

```typescript
const handleSaveDraft = async () => {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      organization_id: user.organization_id,
      author_id: user.id,
      content: content,
      status: 'draft'
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to save draft:', error);
    return;
  }

  toast.success('Draft saved');
};
```

### Dashboard → Real Stats

Replace demo metrics with:

```typescript
const loadDashboardStats = async () => {
  // Get published posts count
  const { count: publishedCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  // Get scheduled posts count
  const { count: scheduledCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scheduled');

  // Get connected accounts
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('platform, is_active')
    .eq('is_active', true);

  setStats({
    postsPublished: publishedCount || 0,
    scheduledPosts: scheduledCount || 0,
    activeAccounts: accounts?.length || 0,
    // Analytics metrics require separate queries to analytics_snapshots
  });
};
```

### Scheduler → Real Fetch

Replace demo scheduled posts with:

```typescript
const loadScheduledPosts = async () => {
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      post_platforms (
        platform,
        social_account_id
      )
    `)
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true });

  setScheduledPosts(posts || []);
};
```

---

## Phase 8: Storage Setup (Assets)

### 1. Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Name: `assets`
4. **Public**: No (use signed URLs)
5. Click **Create Bucket**

### 2. Set Storage Policies

```sql
-- Allow authenticated users to upload to their org folder
create policy "org upload"
on storage.objects
for insert
with check (
  bucket_id = 'assets'
  and (storage.foldername(name))[1] = auth.current_org_id()::text
);

-- Allow authenticated users to read from their org folder
create policy "org read"
on storage.objects
for select
using (
  bucket_id = 'assets'
  and (storage.foldername(name))[1] = auth.current_org_id()::text
);
```

### 3. Upload Flow

```typescript
const handleUpload = async (file: File) => {
  const orgId = user.organization_id;
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const storagePath = `${orgId}/${fileName}`;

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('assets')
    .upload(storagePath, file);

  if (uploadError) {
    console.error('Upload failed:', uploadError);
    return;
  }

  // Store metadata in assets table
  const { data: asset, error: assetError } = await supabase
    .from('assets')
    .insert({
      organization_id: orgId,
      uploader_id: user.id,
      file_name: file.name,
      file_type: file.type.startsWith('image') ? 'image' : 'video',
      file_size_bytes: file.size,
      storage_path: storagePath,
      mime_type: file.type
    })
    .select()
    .single();

  return asset;
};
```

---

## Verification Checklist

- [ ] Supabase project created
- [ ] Database password stored securely
- [ ] Environment variables added to `.env`
- [ ] Schema applied (8 tables exist)
- [ ] RLS policies applied (all tables have RLS enabled)
- [ ] Clerk JWT includes `org_id`
- [ ] `@supabase/supabase-js` installed
- [ ] Supabase client works (no env var errors)
- [ ] User bootstrap logic implemented
- [ ] At least one feature (Composer/Dashboard) wired to real data

---

## Common Issues

### "Missing environment variables"

- Ensure `.env` exists (not just `.env.example`)
- Restart dev server after adding env vars

### "Row-level security policy violation"

- Verify Clerk JWT includes `org_id`
- Verify RLS policies are applied
- Check that user is authenticated

### "relation does not exist"

- Schema not applied correctly
- Run `docs/schema.sql` in SQL editor

### "permission denied for schema public"

- Supabase service role key used instead of anon key
- Only use `VITE_SUPABASE_ANON_KEY` in frontend

---

## Next Steps

Once setup is complete:

1. **Phase 2 (OAuth)**: Connect LinkedIn/X accounts
2. **Phase 3 (Composer)**: Save real drafts and schedule posts
3. **Phase 4 (Scheduler)**: Background worker to publish scheduled posts
4. **Phase 5 (Analytics)**: Fetch and store daily snapshots
5. **Phase 6 (Inbox)**: Read-only mentions and comments
6. **Phase 7 (Assets)**: Upload and manage media

---

**Remember**: SoshlOps is intentionally narrow. No smart queues, no AI agents, no optimization. Just operational clarity.
