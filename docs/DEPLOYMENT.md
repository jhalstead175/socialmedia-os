# SoshlOps v1 Deployment Guide

This guide covers deploying SoshlOps v1 to production.

## Prerequisites

- Supabase project created
- Clerk account configured
- Vercel account (for frontend)
- Domain configured (optional)

---

## 1. Database Setup

### Apply Schema

```bash
# In Supabase SQL Editor, run:
cat docs/schema.sql
```

**Tables created:**
- organizations
- users
- social_accounts
- posts
- post_platforms
- analytics_snapshots
- inbox_items
- assets

### Apply RLS Policies

```bash
# In Supabase SQL Editor, run:
cat docs/policies.sql
```

**Policies created:**
- Organization isolation for all tables
- Service role bypass for scheduler
- User-level read/write permissions

### Verify Setup

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Test function works
SELECT public.current_org_id();
```

---

## 2. Edge Function Deployment

### Deploy Scheduler Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy scheduler function
supabase functions deploy scheduler

# Verify deployment
supabase functions list
```

### Configure Secrets

```bash
# Set encryption key (generate with: openssl rand -hex 32)
supabase secrets set ENCRYPTION_KEY=your_64_char_hex_key

# Set OAuth credentials
supabase secrets set LINKEDIN_CLIENT_ID=your_linkedin_client_id
supabase secrets set LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Verify secrets (values hidden)
supabase secrets list
```

### Enable Cron

```sql
-- In Supabase SQL Editor:
SELECT cron.schedule(
  'scheduler-minutely',
  '* * * * *',  -- Every minute
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/scheduler',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Verify cron job created
SELECT * FROM cron.job;
```

**Replace:**
- `YOUR_PROJECT_REF` with your Supabase project reference
- `YOUR_SERVICE_ROLE_KEY` with your service role key (Settings → API)

### Test Scheduler

```bash
# Manually trigger scheduler
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/scheduler \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"

# Check logs
supabase functions logs scheduler --tail
```

---

## 3. Environment Variables

### Vercel (Frontend)

Set in Vercel Dashboard → Settings → Environment Variables:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...

# Supabase
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### API Functions

Set in Vercel Dashboard for serverless functions:

```env
# Supabase (Server-side)
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OAuth Credentials
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
X_CLIENT_ID=your_x_client_id  # Optional for v1
X_CLIENT_SECRET=your_x_client_secret  # Optional for v1
META_APP_ID=your_meta_app_id  # Optional for v1
META_APP_SECRET=your_meta_app_secret  # Optional for v1

# Encryption
ENCRYPTION_KEY=your_64_char_hex_key  # Same as Edge Function

# App Config
APP_ORIGIN=https://yourdomain.com
```

**Security notes:**
- Never commit secrets to git
- Use different keys for staging/production
- Rotate keys quarterly
- Store `ENCRYPTION_KEY` securely (cannot change without re-encrypting all tokens)

---

## 4. OAuth App Configuration

### LinkedIn Developer App

1. Go to: https://www.linkedin.com/developers/apps
2. Create new app
3. Set Redirect URLs:
   ```
   https://yourdomain.com/api/oauth/linkedin/callback
   http://localhost:5173/api/oauth/linkedin/callback  # Dev only
   ```
4. Request these products:
   - Sign In with LinkedIn using OpenID Connect
   - Share on LinkedIn
5. Copy Client ID and Client Secret

### X (Twitter) Developer App (Optional for v1)

1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Create new app
3. Set Callback URLs:
   ```
   https://yourdomain.com/api/oauth/x/callback
   ```
4. Enable OAuth 2.0
5. Copy Client ID and Client Secret

### Meta Developer App (Optional for v1)

1. Go to: https://developers.facebook.com/apps
2. Create new app → Business type
3. Add Facebook Login product
4. Set Valid OAuth Redirect URIs:
   ```
   https://yourdomain.com/api/oauth/meta/callback
   ```
5. Request permissions: `pages_manage_posts`, `pages_read_engagement`
6. Copy App ID and App Secret

---

## 5. Verification Checklist

### Database

- [ ] All 8 tables exist in Supabase
- [ ] RLS is enabled on all tables
- [ ] `public.current_org_id()` function exists
- [ ] Test query with service role works
- [ ] Test query with anon key respects RLS

### Scheduler

- [ ] Edge Function deployed
- [ ] Secrets configured
- [ ] Cron job scheduled
- [ ] Manual trigger test successful
- [ ] Logs accessible

### Frontend

- [ ] Vercel deployment successful
- [ ] Environment variables set
- [ ] Landing page loads
- [ ] Sign in redirects to Clerk
- [ ] Dashboard loads after sign in

### OAuth

- [ ] LinkedIn app configured
- [ ] Redirect URLs match exactly
- [ ] OAuth flow completes successfully
- [ ] Token saved to database
- [ ] Token is encrypted

### End-to-End

- [ ] User can sign up
- [ ] User sees organization created
- [ ] User can connect LinkedIn
- [ ] User can create draft post
- [ ] User can publish immediately
- [ ] User can schedule post
- [ ] Scheduled post publishes automatically
- [ ] Failed posts show error message

---

## 6. Monitoring & Operations

### Logs

**Scheduler logs:**
```bash
supabase functions logs scheduler --tail
```

**Database logs:**
- Supabase Dashboard → Logs → Database Logs

**Vercel logs:**
- Vercel Dashboard → Deployments → View Function Logs

### Backups

**Enable Supabase backups:**
1. Supabase Dashboard → Database → Backups
2. Enable daily backups (Pro plan)
3. Verify backup schedule

**Manual backup:**
```bash
# Export schema
pg_dump -h db.YOUR_PROJECT_REF.supabase.co \
  -U postgres -d postgres --schema-only > schema_backup.sql

# Export data
pg_dump -h db.YOUR_PROJECT_REF.supabase.co \
  -U postgres -d postgres --data-only > data_backup.sql
```

### Health Checks

**Scheduler health:**
```sql
-- Check recent successful runs
SELECT * FROM posts
WHERE status = 'published'
  AND published_at > NOW() - INTERVAL '1 hour'
ORDER BY published_at DESC;

-- Check failures
SELECT * FROM posts
WHERE status = 'failed'
  AND updated_at > NOW() - INTERVAL '1 hour';
```

**Cron health:**
```sql
-- Verify cron is running
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

### Troubleshooting

**Scheduler not running:**
1. Check cron job exists: `SELECT * FROM cron.job;`
2. Verify service role key is correct
3. Check Edge Function logs
4. Test manual trigger

**Posts not publishing:**
1. Check scheduler logs for errors
2. Verify OAuth tokens are valid
3. Check platform API status
4. Verify RLS policies allow service role

**OAuth failures:**
1. Verify redirect URLs match exactly
2. Check OAuth app is approved/live
3. Verify secrets are set correctly
4. Check Clerk JWT includes `org_id`

---

## 7. Going Live

### Pre-Launch Checklist

- [ ] All v1 features tested end-to-end
- [ ] Error handling verified
- [ ] Backups enabled
- [ ] Monitoring configured
- [ ] Support email configured
- [ ] FAQ published
- [ ] Landing page claims accurate
- [ ] Demo mode tested
- [ ] Load tested (optional)

### Launch Day

1. Verify cron is running
2. Monitor logs for first hour
3. Test OAuth flow from production domain
4. Create test post and verify publishing
5. Watch for errors in dashboard

### Post-Launch

- Monitor scheduler logs daily
- Check for failed posts
- Respond to support emails
- Track usage metrics
- Plan v1.1 based on feedback

---

## 8. Rollback Plan

If critical issues arise:

1. **Disable scheduler:**
   ```sql
   SELECT cron.unschedule('scheduler-minutely');
   ```

2. **Revert Vercel deployment:**
   - Vercel Dashboard → Deployments → Previous → Promote to Production

3. **Restore database (if needed):**
   - Supabase Dashboard → Database → Backups → Restore

4. **Communicate:**
   - Email users about downtime
   - Post status update
   - Estimate resolution time

---

## Support

For deployment questions:
- Email: support@soshlops.com
- Documentation: /docs folder
- Supabase Support: https://supabase.com/support
