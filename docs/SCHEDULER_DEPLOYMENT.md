# Scheduler Worker Deployment Guide

**Status**: Ready for deployment
**Location**: `supabase/functions/scheduler/index.ts`
**Runtime**: Deno (Supabase Edge Functions)
**Trigger**: Cron (every minute)

---

## What It Does

The scheduler worker runs every minute to publish scheduled posts when their time arrives:

1. **Fetch** posts where `status='scheduled'` and `scheduled_at <= now()`
2. **Publish** to LinkedIn via UGC API (v1: LinkedIn only, text-only)
3. **Record** success/failure in `post_platforms` table
4. **Update** post status to `published` or `failed`

**Design principles**:
- Stateless (no persistent state between runs)
- Idempotent (safe to run multiple times)
- Single pass (no retries in v1)

---

## Prerequisites (DO NOT SKIP)

Before deploying, ensure you have:

- ✅ Supabase project created
- ✅ Schema applied (`docs/schema.sql`)
- ✅ Supabase CLI installed (`npm install -g supabase`)
- ✅ Service role key (found in Supabase dashboard → Settings → API)
- ✅ Project ref (found in Supabase dashboard → Settings → General)

---

## Deployment Steps

### 1. Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

This will open a browser window for authentication.

### 3. Link Your Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

**Where to find project-ref**:
- Go to Supabase Dashboard
- Select your project
- Settings → General → Reference ID

### 4. Set Environment Secrets

The scheduler needs access to Supabase with the service role key (to bypass RLS):

```bash
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find these values**:
- Supabase Dashboard → Settings → API
- `SUPABASE_URL`: Project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role secret (⚠️ NEVER commit to git)

### 5. Deploy the Function

```bash
supabase functions deploy scheduler
```

Expected output:
```
Deploying scheduler (project ref: abc-xyz-123)
Deploying function...
Function URL: https://YOUR_PROJECT.supabase.co/functions/v1/scheduler
Completed successfully.
```

### 6. Test the Function Manually

Before enabling cron, test that it works:

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/scheduler \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Expected responses:
- `"No posts"` (200) - No scheduled posts found (expected if none exist)
- `"OK"` (200) - Posts processed successfully
- `"Error"` (500) - Something went wrong (check logs)

**View logs**:
```bash
supabase functions logs scheduler
```

Or in Supabase Dashboard → Edge Functions → scheduler → Logs

### 7. Enable Cron Schedule

Create or update `supabase/functions/scheduler/cron.yml`:

```yaml
# Run every minute
- schedule: "* * * * *"
  function: scheduler
```

Then apply the cron schedule:

```bash
supabase functions deploy scheduler --cron
```

Or configure via Supabase Dashboard:
1. Go to Database → Cron Jobs
2. Create new job:
   - **Schedule**: `* * * * *` (every minute)
   - **Function**: `scheduler`
   - **Enabled**: ✅

---

## Verification

### 1. Create a Test Post

Via Supabase Dashboard or your app:

```sql
INSERT INTO posts (organization_id, author_id, content, status, scheduled_at)
VALUES (
  'your-org-id',
  'your-user-id',
  'Test post from scheduler',
  'scheduled',
  NOW() + INTERVAL '2 minutes'
);

-- Link to a LinkedIn account
INSERT INTO post_platforms (post_id, social_account_id, platform, status)
VALUES (
  'the-post-id-from-above',
  'your-linkedin-social-account-id',
  'linkedin',
  'pending'
);
```

### 2. Wait for Scheduled Time

The scheduler runs every minute. After the `scheduled_at` time passes:

1. Check post status:
```sql
SELECT id, content, status, published_at FROM posts WHERE id = 'your-test-post-id';
```

Expected: `status = 'published'`, `published_at` is set

2. Check platform status:
```sql
SELECT platform, status, platform_post_id, failure_reason
FROM post_platforms
WHERE post_id = 'your-test-post-id';
```

Expected: `status = 'published'`, `platform_post_id` contains LinkedIn URN

3. Check LinkedIn:
Go to your LinkedIn profile and verify the post appears.

### 3. Monitor Logs

```bash
supabase functions logs scheduler --tail
```

Successful execution logs:
```
Processing 1 scheduled posts
Published post abc-123 to LinkedIn
```

---

## Troubleshooting

### Function Returns "Error" (500)

**Check logs**:
```bash
supabase functions logs scheduler
```

Common causes:
- Missing environment secrets (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- LinkedIn access token expired or invalid
- Network error calling LinkedIn API
- Database schema mismatch

### Post Status = 'failed'

Check `failure_reason` in `post_platforms`:
```sql
SELECT platform, failure_reason FROM post_platforms WHERE status = 'failed';
```

Common failures:
- `"Social account not found"` - LinkedIn account disconnected or deleted
- `"LinkedIn publish failed: 401"` - Access token expired
- `"LinkedIn publish failed: 400"` - Invalid post content or format
- `"Platform not implemented"` - Attempted to publish to X or Meta (not yet supported)

### Cron Not Triggering

**Verify cron is enabled**:
- Supabase Dashboard → Database → Cron Jobs
- Ensure schedule is `* * * * *` and status is ✅ Enabled

**Check logs** for automatic invocations:
```bash
supabase functions logs scheduler --tail
```

You should see entries every minute (even if "No posts").

---

## What's NOT Implemented (v1 Exclusions)

Per the v1 scope, the following are intentionally excluded:

- ❌ Retries on failure
- ❌ Token refresh
- ❌ Analytics fetch after publish
- ❌ Performance optimization
- ❌ Media upload (text-only posts)
- ❌ X (Twitter) publishing
- ❌ Meta (Facebook/Instagram) publishing
- ❌ Rate limiting
- ❌ Dead letter queue
- ❌ Exponential backoff

These may be added in future versions based on user feedback.

---

## Security Notes

⚠️ **Service Role Key**:
- Grants full database access (bypasses RLS)
- NEVER expose in client-side code
- NEVER commit to git
- Only use in Edge Functions or backend API routes

⚠️ **Access Tokens**:
- Stored encrypted in `social_accounts.access_token`
- Decryption logic not yet implemented (v1 stores as-is)
- TODO: Implement decryptToken() before production

---

## Cost Estimation

**Supabase Edge Functions pricing** (as of January 2026):
- Free tier: 500K invocations/month
- Beyond: $2 per 1M invocations

**Expected usage**:
- 1 cron run per minute = 1,440 invocations/day = 43,200/month
- Well within free tier
- Actual publishes don't count separately (same invocation)

**LinkedIn API limits**:
- No official rate limit published
- Recommended: Don't publish more than 1 post per minute per account
- Current design: Natural throttle via scheduler frequency

---

## Rollback Procedure

If the scheduler causes issues:

### 1. Disable Cron Immediately

Via Supabase Dashboard:
- Database → Cron Jobs → scheduler → Disable

### 2. Undeploy Function (optional)

```bash
supabase functions delete scheduler
```

### 3. Mark Scheduled Posts as Draft (if needed)

```sql
UPDATE posts SET status = 'draft' WHERE status = 'scheduled';
```

This prevents accidental publishing if you re-enable the scheduler.

---

## Next Steps

After successful deployment:

1. **Connect LinkedIn Account** (via OAuth flow in app)
2. **Create a Post** in the Composer with a future scheduled time
3. **Verify Scheduler** publishes it when time arrives
4. **Monitor Logs** for first few days to catch any edge cases

Once stable, consider:
- Implementing token refresh logic
- Adding X and Meta platform support
- Implementing retry logic with exponential backoff
- Fetching analytics after publish

---

**Last Updated**: January 2026
**Owner**: SoshlOps Engineering
