# SoshlOps v1 "DONE" Checklist

Use this checklist to verify v1 is complete and ready to ship.

## ✅ Core Value Proposition

**Goal:** "Professionals can reliably schedule and publish social media posts from one place."

### Users Can:
- [ ] Connect at least one platform (LinkedIn minimum)
- [ ] Create a text post in Composer
- [ ] Schedule it for future publishing
- [ ] See it publish automatically at scheduled time
- [ ] View scheduled posts in calendar
- [ ] See publishing status (scheduled/published/failed)

### System Guarantees:
- [ ] Never double-publishes same post
- [ ] Never lies about post status
- [ ] Never hides failures (visible in UI)
- [ ] Posts publish within 1 minute of scheduled time
- [ ] Failed posts show error reason

---

## 🧱 Feature Scope Verification

### ✅ IN SCOPE (Must Work)

#### Publishing
- [ ] Text-only posts supported
- [ ] LinkedIn publishing works
- [ ] Scheduled publishing works
- [ ] Immediate publishing works
- [ ] Scheduler runs every minute

#### UI Pages
- [ ] Dashboard shows real stats from Supabase
- [ ] Composer saves drafts, publishes, schedules
- [ ] Scheduler shows calendar with scheduled posts
- [ ] Account Settings for OAuth connections
- [ ] Profile page (clean, non-Rezemai)
- [ ] Assets page (upload placeholder)
- [ ] Inbox page (read-only)
- [ ] Analytics page (zeros OK)

#### Backend
- [ ] Supabase schema deployed (8 tables)
- [ ] RLS policies active
- [ ] Edge Function scheduler deployed
- [ ] Cron runs every minute
- [ ] Service-role bypasses RLS
- [ ] Organization isolation enforced

#### Billing
- [ ] Plan limits enforced (50 scheduled posts)
- [ ] Limits checked server-side
- [ ] User sees plan details in Profile

### ❌ OUT OF SCOPE (OK if Missing)

These are **not bugs** in v1:
- [ ] AI writing assistance (v2)
- [ ] Image/video publishing (v1.1)
- [ ] Cross-platform post variants (v1.1)
- [ ] Analytics ingestion (v1.1)
- [ ] Inbox replies (v1.1)
- [ ] Team roles (v1.1)
- [ ] Approval workflows (v2)
- [ ] Bulk upload (v2)
- [ ] Mobile app (v2)
- [ ] Webhooks (v2)

---

## 🧪 Non-Negotiable Quality Bars

### 🔒 Trust (Must Never Violate)
- [ ] No "coming soon" claims in UI
- [ ] No AI feature claims
- [ ] No fake/simulated metrics
- [ ] No silent failures
- [ ] Landing page claims are accurate
- [ ] Empty states explain next steps

### 🧠 Clarity (Must Be Obvious)
- [ ] Scheduling flow is discoverable
- [ ] Buttons explain themselves (text + tooltips)
- [ ] Empty states teach what to do next
- [ ] Disabled buttons explain why
- [ ] Error messages are clear

### 🧯 Safety (Must Be Secure)
- [ ] Publish failures visible in UI
- [ ] Scheduler errors don't crash app
- [ ] Users can't see other orgs' data
- [ ] Tokens are encrypted (AES-256-GCM)
- [ ] RLS prevents cross-org access

---

## 🚦 Go / No-Go Checklist

### Backend
- [ ] Scheduler cron active (`SELECT * FROM cron.job;`)
- [ ] Manual publish works (test in Composer)
- [ ] Scheduled publish works (test 2-minute delay)
- [ ] Failure recorded in DB when OAuth revoked
- [ ] Logs accessible (`supabase functions logs scheduler`)

### Frontend
- [ ] Scheduler has "Schedule Post" CTA button
- [ ] Composer shows schedule confirmation toast
- [ ] No hover-only critical actions
- [ ] Profile page cleaned (no Rezemai metrics)
- [ ] All icon buttons have tooltips
- [ ] Cursor styles correct (pointer/not-allowed)

### Product
- [ ] LinkedIn documented as supported (PLATFORM_SUPPORT.md)
- [ ] v1 limitations stated clearly (FAQ.md)
- [ ] Landing page updated (no false claims)
- [ ] FAQ created and accessible
- [ ] Demo mode works (?demo=1)

### Operations
- [ ] Supabase backups enabled (Pro plan)
- [ ] Logs accessible (Supabase + Vercel)
- [ ] Plan limits enforced (MAX_SCHEDULED_POSTS: 50)
- [ ] Support contact visible (Account Settings)
- [ ] Deployment guide complete (DEPLOYMENT.md)

---

## 🎯 End-to-End Test Scenarios

Run these tests before declaring v1 "DONE":

### Test 1: New User Signup
1. [ ] Sign up with new email via Clerk
2. [ ] Redirected to Dashboard
3. [ ] Organization auto-created in Supabase
4. [ ] User record created with org_id
5. [ ] Dashboard shows 0 stats

### Test 2: LinkedIn Connection
1. [ ] Click "Connect" on LinkedIn in Account Settings
2. [ ] Redirected to LinkedIn OAuth
3. [ ] Approve permissions
4. [ ] Redirected back to Account Settings
5. [ ] LinkedIn shows as connected
6. [ ] Token encrypted in `social_accounts` table

### Test 3: Immediate Publish
1. [ ] Write post in Composer
2. [ ] Select LinkedIn platform
3. [ ] Click "Publish Now"
4. [ ] Toast confirms: "Post published"
5. [ ] Post appears on LinkedIn
6. [ ] Post status = "published" in Scheduler

### Test 4: Scheduled Publish
1. [ ] Write post in Composer
2. [ ] Click "Schedule" button
3. [ ] Pick date/time 2 minutes from now
4. [ ] Click "Schedule Post"
5. [ ] Toast shows: "Post scheduled for [date] at [time]"
6. [ ] Post appears in Scheduler with "scheduled" status
7. [ ] Wait 2+ minutes
8. [ ] Refresh Scheduler
9. [ ] Post status = "published"
10. [ ] Post appears on LinkedIn

### Test 5: Failure Handling
1. [ ] Revoke LinkedIn access externally (linkedin.com/settings)
2. [ ] Try to publish from Composer
3. [ ] Post status = "failed" in Scheduler
4. [ ] Error reason visible in UI
5. [ ] No silent failure

### Test 6: Organization Isolation
1. [ ] Sign up User A
2. [ ] Create post as User A
3. [ ] Sign up User B (different org)
4. [ ] User B cannot see User A's posts
5. [ ] Query database to verify RLS working

### Test 7: Plan Limits
1. [ ] Create 50 scheduled posts (hit limit)
2. [ ] Try to schedule 51st post
3. [ ] Toast error: "Maximum of 50 scheduled posts reached"
4. [ ] Post not created
5. [ ] Limit enforced server-side (check DB)

---

## 📊 Metrics to Track

Once live, monitor these:

### Health Metrics
- **Scheduler success rate:** % of scheduled posts that publish
- **Avg publish latency:** Time from scheduled_at to published_at
- **Error rate:** % of posts with status = "failed"
- **Cron uptime:** % of minutes cron runs successfully

### Usage Metrics
- **Active users:** Users who published/scheduled in last 7 days
- **Posts per user:** Avg scheduled + published posts
- **Platform adoption:** % using LinkedIn vs placeholders
- **Retention:** % of week-1 users still active in week-4

### Quality Metrics
- **Time to first post:** Minutes from signup to first publish
- **Support tickets:** Count per week
- **Bug reports:** Count per week
- **OAuth failures:** % of connection attempts that fail

---

## 🚀 Launch Readiness

v1 is **GO for launch** when:

1. ✅ All "Go/No-Go" items checked
2. ✅ All end-to-end tests pass
3. ✅ Non-negotiable quality bars met
4. ✅ Operations checklist complete
5. ✅ Documentation accurate
6. ✅ Support system ready

v1 is **NO-GO** if:

1. ❌ Scheduler doesn't publish automatically
2. ❌ OAuth flow fails
3. ❌ Data leaks between orgs
4. ❌ Silent failures occur
5. ❌ Landing page makes false claims

---

## 📋 Post-Launch Actions

After v1 goes live:

### Day 1
- [ ] Monitor scheduler logs hourly
- [ ] Check for failed posts
- [ ] Respond to support emails < 2 hours
- [ ] Watch error rate metrics

### Week 1
- [ ] Daily log review
- [ ] Track metrics (posts, users, errors)
- [ ] Collect user feedback
- [ ] Document common issues
- [ ] Plan v1.1 priority fixes

### Month 1
- [ ] Weekly metrics review
- [ ] Analyze usage patterns
- [ ] Prioritize v1.1 features based on requests
- [ ] Optimize scheduler performance
- [ ] Consider additional platforms

---

## 🎓 Definition of Done

v1 is **DONE** when a new user can:

1. Sign up
2. Connect LinkedIn
3. Write a post
4. Schedule it for tomorrow
5. See it publish automatically
6. Trust that the system works

**And the system:**
- Never lies
- Never hides failures
- Never double-publishes
- Shows accurate status
- Isolates orgs correctly

If all above are true → **Ship v1 ✅**
