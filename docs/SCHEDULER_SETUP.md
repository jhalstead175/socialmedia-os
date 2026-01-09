# SoshlOps Scheduler Setup (GitHub Actions)

This guide walks you through setting up the automated scheduler using GitHub Actions.

## Why GitHub Actions?

GitHub Actions is **simpler and more reliable** than pg_cron for v1:
- ✅ Runs every minute reliably
- ✅ Easy to monitor (Actions tab in GitHub)
- ✅ Free for public repos, generous free tier for private
- ✅ Can manually trigger for testing
- ✅ No Supabase extensions needed
- ✅ Built-in logging and error alerts

---

## Step 1: Get Your Supabase Credentials

You need two pieces of information from Supabase:

### 1. Supabase URL

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** (looks like: `https://abcdefghijklm.supabase.co`)

### 2. Service Role Key

1. Still in **Settings** → **API**
2. Scroll to **Project API keys**
3. Find **service_role** key
4. Click **Reveal** and copy it (starts with `eyJ...`)

⚠️ **IMPORTANT:** The service_role key is SECRET. Never commit it to your code!

---

## Step 2: Add Secrets to GitHub

1. Go to your GitHub repository: `https://github.com/jhalstead175/socialmedia-os`

2. Click **Settings** (top menu)

3. In the left sidebar, click **Secrets and variables** → **Actions**

4. Click **New repository secret** (green button)

5. Add the first secret:
   - Name: `SUPABASE_URL`
   - Secret: Paste your Supabase Project URL
   - Click **Add secret**

6. Add the second secret:
   - Click **New repository secret** again
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Secret: Paste your service_role key
   - Click **Add secret**

7. Verify both secrets are listed (values will be hidden)

---

## Step 3: Enable the Workflow

The workflow file is already in your repository at `.github/workflows/scheduler.yml`.

### Push the Workflow to GitHub

```bash
# Make sure you're on your branch
git status

# The workflow file should already be committed
# If not, commit it:
git add .github/workflows/scheduler.yml
git commit -m "Add GitHub Actions scheduler workflow"
git push
```

### Verify the Workflow Appears

1. Go to your GitHub repo
2. Click the **Actions** tab (top menu)
3. You should see "SoshlOps Scheduler" in the left sidebar

---

## Step 4: Test the Scheduler Manually

Before waiting for the cron schedule, test it manually:

1. Go to **Actions** tab in GitHub
2. Click **SoshlOps Scheduler** (left sidebar)
3. Click **Run workflow** (right side)
4. Select your branch (`claude/rezemai-social-media-transform-VNGa2`)
5. Click **Run workflow** (green button)

### Check the Results

1. Wait 10-20 seconds
2. Refresh the page
3. Click on the workflow run that just appeared
4. Click **run-scheduler** job
5. Expand the steps to see logs

**What you should see:**
```
Triggering scheduler at 2026-01-09 15:30:45 UTC
HTTP Status: 200
Response: {"message":"Scheduler completed successfully","processed":0}
✅ Scheduler executed successfully
```

**If it fails:**
- Check that secrets are set correctly
- Verify Edge Function is deployed (`supabase functions list`)
- Check Edge Function logs (`supabase functions logs scheduler`)

---

## Step 5: Verify Automatic Runs

The scheduler will now run **every minute** automatically.

### Check Workflow Runs

1. Go to **Actions** tab
2. Click **SoshlOps Scheduler**
3. You should see new runs appearing every minute

### Monitor in Real-Time

```bash
# Watch the workflow runs (optional)
gh run list --workflow=scheduler.yml --limit 10
```

---

## Step 6: Test End-to-End Publishing

Now test that posts actually publish:

### Create a Test Post

1. Sign in to SoshlOps
2. Connect your LinkedIn account (if not already)
3. Go to **Composer**
4. Write: "Test post from automated scheduler"
5. Click **Schedule** button
6. Set time to **2 minutes from now**
7. Click **Schedule Post**

### Verify It Publishes

1. Wait 2-3 minutes
2. Go to **Scheduler** page
3. The post should change from "scheduled" to "published"
4. Check your LinkedIn profile - the post should appear

### Check GitHub Actions Logs

1. Go to **Actions** tab in GitHub
2. Find the workflow run from ~2 minutes ago
3. Look for log line showing posts processed:
   ```
   Response: {"message":"Scheduler completed successfully","processed":1}
   ```

---

## Troubleshooting

### Workflow doesn't appear in Actions tab

**Problem:** Workflow file not in default branch

**Solution:**
1. Make sure `.github/workflows/scheduler.yml` exists
2. Push to your main branch or merge your PR
3. GitHub Actions only runs on default branch

### "Error: secrets.SUPABASE_URL is not set"

**Problem:** Secrets not configured

**Solution:**
1. Go to Settings → Secrets and variables → Actions
2. Verify both secrets exist
3. Re-add them if needed
4. Make sure spelling is exact: `SUPABASE_URL` (all caps, underscore)

### Workflow runs but fails with HTTP 401

**Problem:** Invalid service role key

**Solution:**
1. Go to Supabase → Settings → API
2. Click "Reveal" on service_role key
3. Copy the entire key (starts with `eyJ`, very long)
4. Update the GitHub secret with new value

### Workflow runs but fails with HTTP 404

**Problem:** Edge Function not deployed

**Solution:**
```bash
# Deploy the scheduler function
supabase functions deploy scheduler

# Verify it exists
supabase functions list
```

### Post doesn't publish

**Problem:** Could be several things

**Debugging steps:**

1. **Check Scheduler logs:**
   ```bash
   supabase functions logs scheduler --tail
   ```

2. **Check post status in database:**
   ```sql
   SELECT id, content, status, scheduled_at, failure_reason
   FROM posts
   WHERE status = 'failed'
   ORDER BY updated_at DESC
   LIMIT 5;
   ```

3. **Verify OAuth token is valid:**
   - Try publishing immediately in Composer
   - If that fails, reconnect LinkedIn account

4. **Check GitHub Actions logs:**
   - Look for errors in workflow runs
   - Verify HTTP 200 responses

---

## Monitoring Best Practices

### Daily Checks (First Week)

1. Check Actions tab for failed runs
2. Look for red X marks
3. Review error logs if any

### Weekly Checks (Ongoing)

1. Verify posts are publishing on schedule
2. Check for any failed posts in Scheduler
3. Review GitHub Actions usage (Settings → Billing)

### Set Up Notifications

1. Go to GitHub → Settings (your profile, not repo)
2. Click **Notifications**
3. Enable **Actions** notifications
4. Choose email or GitHub notifications
5. You'll get alerts if workflows fail

---

## Cost & Limits

### GitHub Actions Free Tier

**Public repositories:** Unlimited

**Private repositories:**
- 2,000 minutes/month free
- Each workflow run takes ~5-10 seconds
- 1 run/minute = 60 runs/hour = 1,440 runs/day
- ~720 seconds/day = 12 minutes/day
- 30 days = 360 minutes/month

**You're well within free tier limits!**

### If You Hit Limits

Reduce frequency to every 5 minutes:
```yaml
schedule:
  - cron: '*/5 * * * *'  # Every 5 minutes instead of every 1 minute
```

---

## Alternative: Migrate to pg_cron Later

Once you're comfortable, you can migrate to pg_cron (Supabase built-in):

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule job
SELECT cron.schedule(
  'soshlops-scheduler',
  '* * * * *',
  $$SELECT net.http_post(...)$$
);
```

Then **disable** GitHub Actions workflow by renaming:
```bash
mv .github/workflows/scheduler.yml .github/workflows/scheduler.yml.disabled
```

---

## Summary

✅ **What you have now:**
- Automated scheduler running every minute
- Reliable execution via GitHub Actions
- Easy monitoring and debugging
- Free (within GitHub limits)
- Manual trigger for testing

✅ **What happens:**
1. Every minute, GitHub triggers the workflow
2. Workflow calls your Supabase Edge Function
3. Edge Function checks for posts due to publish
4. Posts get published to LinkedIn
5. Status updates in database
6. You see results in Scheduler page

✅ **Your v1 scheduler is DONE!** 🎉

---

## Support

Questions? Check:
- GitHub Actions logs (Actions tab)
- Supabase logs (`supabase functions logs scheduler`)
- FAQ.md for common issues
- Email: support@soshlops.com
