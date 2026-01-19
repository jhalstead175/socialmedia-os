# LinkedIn-Only MVP Deployment Checklist

## Pre-Deployment Fixes ✅ COMPLETED

All critical blockers have been fixed:

- [x] **BLOCKER A**: Removed Base44 auth dependencies (entities.js already stubbed)
- [x] **BLOCKER B**: Implemented Clerk→Supabase JWT integration for RLS
- [x] **BLOCKER C**: Secured oauth-linkedin-start (requires Clerk JWT, no client userId)
- [x] **BLOCKER D**: Added nonce verification in oauth-linkedin-callback (CSRF protection)
- [x] **BLOCKER E**: Hidden X/Meta platforms everywhere (LinkedIn-only UI)
- [x] Updated all pages to use authenticated Supabase client
- [x] node_modules properly excluded from git

## Environment Setup

### 1. Clerk Configuration

- [ ] Create Clerk app at https://dashboard.clerk.com
- [ ] Create JWT template named "supabase" (see CLERK_SUPABASE_SETUP.md)
- [ ] Configure JWT claims with organization_id
- [ ] Enable email authentication
- [ ] Set redirect URLs:
  - Sign-in: `https://your-app.vercel.app/signin`
  - After sign-in: `https://your-app.vercel.app/dashboard`

### 2. Supabase Configuration

#### Database Setup
- [ ] Create Supabase project at https://supabase.com
- [ ] Run schema.sql from /docs/schema.sql
- [ ] Run policies.sql from /docs/policies.sql (enable RLS)
- [ ] Verify all 8 tables exist:
  - organizations
  - users
  - social_accounts
  - posts
  - post_platforms
  - analytics_snapshots
  - inbox_items
  - assets

#### Edge Functions Setup
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Login: `supabase login`
- [ ] Link to project: `supabase link --project-ref [your-ref]`
- [ ] Deploy functions:
  ```bash
  supabase functions deploy oauth-linkedin-start
  supabase functions deploy oauth-linkedin-callback
  supabase functions deploy scheduler
  ```

#### Environment Variables (Supabase)
Set these in Supabase Dashboard → Edge Functions → Secrets:

```bash
LINKEDIN_CLIENT_ID=your_linkedin_app_id
LINKEDIN_CLIENT_SECRET=your_linkedin_app_secret
LINKEDIN_REDIRECT_URI=https://[project-ref].supabase.co/functions/v1/oauth-linkedin-callback
ENCRYPTION_KEY=[generate 32-char random string]
APP_ORIGIN=https://your-app.vercel.app
```

**Generate ENCRYPTION_KEY:**
```bash
openssl rand -base64 32
```

#### Cron Setup
- [ ] Enable pg_cron extension in Supabase Dashboard
- [ ] Create cron job (SQL Editor):
  ```sql
  SELECT cron.schedule(
    'publish-scheduled-posts',
    '* * * * *',  -- Every minute
    $$SELECT net.http_post(
      url := 'https://[project-ref].supabase.co/functions/v1/scheduler',
      headers := jsonb_build_object('Authorization', 'Bearer [service-role-key]')
    )$$
  );
  ```

### 3. LinkedIn OAuth App Setup

- [ ] Go to https://www.linkedin.com/developers/apps
- [ ] Create new app
- [ ] Request "Sign In with LinkedIn using OpenID Connect" product
- [ ] Add redirect URL: `https://[project-ref].supabase.co/functions/v1/oauth-linkedin-callback`
- [ ] Add scopes:
  - `profile`
  - `email`
  - `w_member_social` (for posting)
- [ ] Copy Client ID and Client Secret to Supabase secrets

### 4. Vercel Deployment

#### Environment Variables (Vercel)
- [ ] Create Vercel project
- [ ] Set environment variables:
  ```
  VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
  VITE_SUPABASE_URL=https://[project-ref].supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhb...
  ```

#### Build Settings
- [ ] Framework Preset: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm ci`
- [ ] Node Version: 18.x or higher

#### Deploy
- [ ] Push to main branch (triggers auto-deploy)
- [ ] Or manual deploy: `vercel --prod`
- [ ] Verify build succeeds

## Post-Deployment Testing

### 1. Authentication Flow
- [ ] Visit your deployed app
- [ ] Sign up with email
- [ ] Verify redirect to onboarding/dashboard
- [ ] Sign out and sign in again
- [ ] Verify session persists

### 2. User Bootstrap (First Sign-In)
- [ ] After first sign-in, verify:
  - New organization created in `organizations` table
  - User row created in `users` table with correct org_id
  - Clerk metadata updated with organization_id

**Note:** If you don't have a bootstrap hook, manually create org and user:
```sql
-- Create org
INSERT INTO organizations (id, name) VALUES (gen_random_uuid(), 'Test Org');

-- Create user
INSERT INTO users (id, organization_id, clerk_user_id, full_name, email)
VALUES (
  gen_random_uuid(),
  '[org-id-from-above]',
  '[clerk-user-id]',
  'Test User',
  'test@example.com'
);

-- Update Clerk metadata via API or dashboard:
-- publicMetadata.organization_id = [org-id]
```

### 3. LinkedIn OAuth Flow
- [ ] Go to Account page
- [ ] Click "Connect LinkedIn"
- [ ] Should redirect to LinkedIn authorization
- [ ] Approve permissions
- [ ] Should redirect back to Account page with success message
- [ ] Verify in Supabase:
  ```sql
  SELECT * FROM social_accounts WHERE platform = 'linkedin';
  ```
- [ ] Verify token is encrypted (should be base64 string)

### 4. Post Scheduling
- [ ] Go to Composer
- [ ] Should see LinkedIn platform available
- [ ] Write a test post (DO NOT actually publish to real LinkedIn yet)
- [ ] Select LinkedIn platform
- [ ] Click "Schedule for later"
- [ ] Pick a time 2 minutes in the future
- [ ] Click "Schedule Post"
- [ ] Verify in Supabase:
  ```sql
  SELECT * FROM posts WHERE status = 'scheduled';
  SELECT * FROM post_platforms WHERE status = 'pending';
  ```

### 5. Scheduler Worker Test
- [ ] Wait for scheduled time to pass
- [ ] Check Supabase Edge Function logs for scheduler execution
- [ ] Verify post status changed:
  ```sql
  SELECT * FROM posts WHERE id = '[post-id]';
  SELECT * FROM post_platforms WHERE post_id = '[post-id]';
  ```
- [ ] Check LinkedIn for the actual post (if you used a real account)
- [ ] If failed, check `failure_reason` column

### 6. Organization Isolation (Critical Security Test)
- [ ] Create second user account (different email)
- [ ] Sign in as User A, create a post
- [ ] Sign out, sign in as User B
- [ ] Go to Scheduler page
- [ ] User B should NOT see User A's post
- [ ] Verify in browser DevTools Network tab that RLS is filtering correctly

### 7. Dashboard Metrics
- [ ] Verify dashboard shows correct counts:
  - Posts this week
  - Scheduled posts
  - Active accounts (should be 1 for LinkedIn)
- [ ] Create a test post and verify counts update

## Monitoring & Operations

### Supabase Edge Function Logs
Monitor scheduler for errors:
```bash
supabase functions logs scheduler --project-ref [ref]
```

### Common Issues

#### "Template 'supabase' not found"
→ You didn't create the Clerk JWT template. See CLERK_SUPABASE_SETUP.md

#### OAuth fails with state_mismatch
→ Cookie domain misconfigured or nonce verification failing
→ Check Edge Function logs

#### Posts not publishing
→ Check scheduler Edge Function logs
→ Verify cron job is running
→ Check token hasn't expired
→ Verify LinkedIn API permissions

#### RLS blocking all queries
→ JWT claims don't match RLS policies
→ Verify Clerk template includes organization_id
→ Check Supabase logs for RLS denials

## MVP Scope Reminder

### ✅ Included in v1
- LinkedIn text-only posts
- Scheduling and publish-now
- Draft saving
- Account connection management
- Basic dashboard metrics (post counts)
- Organization isolation (multi-tenant ready)
- Secure OAuth flow
- Encrypted token storage

### ❌ NOT in v1 (defer to v1.1+)
- X (Twitter) integration
- Meta (Facebook) integration
- Media uploads (images/video)
- Analytics and engagement data
- Inbox (mentions/comments)
- Asset management
- Team collaboration
- Advanced scheduling (content calendar, best time)
- AI features
- Bulk operations
- Post templates

## Launch Checklist

- [ ] All environment variables set
- [ ] Database schema deployed
- [ ] RLS policies enabled and tested
- [ ] Edge Functions deployed
- [ ] Cron job configured
- [ ] Clerk JWT template created
- [ ] LinkedIn OAuth app configured
- [ ] Frontend deployed to Vercel
- [ ] End-to-end OAuth tested
- [ ] Post scheduling tested
- [ ] Organization isolation verified
- [ ] Error monitoring configured (optional: Sentry)
- [ ] Backup strategy in place (Supabase auto-backups enabled)

## Rollback Plan

If critical issues arise:

1. **Vercel:** Rollback to previous deployment in Vercel dashboard
2. **Supabase Functions:** Redeploy previous version
3. **Database:** Restore from Supabase backup (Settings → Database → Backups)

## Next Steps After MVP Launch

1. Monitor error logs and user feedback
2. Fix any critical bugs that emerge
3. Plan v1.1 scope (X integration? Media uploads? Analytics?)
4. Set up proper CI/CD pipeline
5. Add integration tests
6. Implement proper error tracking (Sentry)
7. Add usage analytics (PostHog, etc.)

---

**IMPORTANT:** Before going live with real users:
- Test with a personal LinkedIn account first
- Verify no data leakage between orgs
- Ensure tokens are encrypted
- Review all Edge Function logs for errors
