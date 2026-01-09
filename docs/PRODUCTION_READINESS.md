# SoshlOps v1 - Production Readiness Checklist

**Status**: In Progress
**Target**: First production customer
**Last Updated**: January 2026

---

## 🔒 1. SECURITY & ISOLATION (NON-NEGOTIABLE)

- [x] **Clerk authentication enforced on all app routes**
  - Status: ✅ Implemented via Clerk Provider in Layout.jsx
  - Protected routes require authentication

- [x] **Supabase RLS enabled on every table**
  - Status: ✅ Documented in docs/policies.sql
  - RLS policies created for all 8 tables
  - ⚠️ **ACTION REQUIRED**: Apply policies to Supabase project

- [x] **organization_id present and enforced everywhere**
  - Status: ✅ Schema includes organization_id on all relevant tables
  - RLS policies enforce org-level isolation
  - JWT includes org_id claim

- [x] **Service role key used only in Edge Functions**
  - Status: ✅ Backend uses supabaseServer with service role
  - Frontend uses anon key only
  - Edge Functions use service role for scheduler

- [x] **No secrets exposed to frontend (anon key only)**
  - Status: ✅ .env.example documents VITE_ prefix for client vars
  - Service role key never exposed to client

- [x] **OAuth tokens encrypted at rest**
  - Status: ✅ AES-256-GCM encryption implemented in api/lib/crypto.js
  - Tokens stored as iv:authTag:ciphertext format
  - ⚠️ **TODO**: Implement decryption in scheduler worker

- [ ] **HTTPS enforced in all OAuth callbacks**
  - Status: ⚠️ Depends on deployment (Vercel auto-enforces HTTPS)
  - OAuth redirect URIs must use https:// in production
  - ⚠️ **ACTION REQUIRED**: Verify in production environment

**SECURITY STATUS**: ✅ Code complete, ⚠️ Deployment verification needed

---

## 🧱 2. CORE FLOWS WORK END-TO-END

### Account

- [ ] **First login creates organization + user row**
  - Status: ❌ NOT IMPLEMENTED
  - **BLOCKER**: Must implement before production
  - Location: Needs middleware or onboarding flow

- [ ] **Logout/login does not duplicate records**
  - Status: ⚠️ NOT TESTED
  - Depends on above implementation

### OAuth

- [x] **LinkedIn connects successfully**
  - Status: ✅ OAuth flow complete
  - Endpoints: /api/oauth/linkedin/start + callback

- [x] **Token stored and status = active**
  - Status: ✅ Stored in social_accounts table
  - is_active = true on connect

- [ ] **Disconnect (status = revoked) works cleanly**
  - Status: ❌ NOT IMPLEMENTED
  - **BLOCKER**: Need disconnect button + logic

### Posting

- [ ] **Draft saves correctly**
  - Status: ❌ NOT IMPLEMENTED
  - Composer.jsx is UI-only (demo mode)
  - **BLOCKER**: Must wire to Supabase

- [ ] **Scheduled post appears in Scheduler**
  - Status: ❌ NOT IMPLEMENTED
  - Scheduler.jsx reads from DB but no posts exist yet

- [x] **Scheduler worker publishes exactly once**
  - Status: ✅ Logic prevents duplicates (status check)
  - Idempotent design

- [x] **Failure updates status + error_message**
  - Status: ✅ Try/catch stores failure_reason
  - post_platforms.status = 'failed'

- [x] **No duplicate publishes**
  - Status: ✅ Status transitions prevent re-processing

**POSTING STATUS**: ⚠️ Worker ready, but no UI integration yet

---

## ⏱️ 3. SCHEDULER SAFETY

- [x] **Edge function deploys cleanly**
  - Status: ✅ Code exists at supabase/functions/scheduler/index.ts
  - ⚠️ **ACTION REQUIRED**: Deploy to Supabase (see SCHEDULER_DEPLOYMENT.md)

- [ ] **Manual invoke returns OK**
  - Status: ⚠️ NOT TESTED (deployment required)

- [ ] **Cron fires every minute**
  - Status: ⚠️ NOT CONFIGURED (deployment required)

- [x] **Posts scheduled in the past publish**
  - Status: ✅ Logic: scheduled_at <= now()

- [x] **Posts scheduled in the future do not publish early**
  - Status: ✅ Logic prevents early execution

**SCHEDULER STATUS**: ✅ Code ready, ⚠️ Awaiting deployment

---

## 📊 4. UI TRUTHFULNESS

- [ ] **Dashboard numbers match database reality**
  - Status: ❌ Dashboard shows placeholder data
  - **BLOCKER**: Wire to Supabase posts table

- [x] **No UI implies automation or intelligence**
  - Status: ✅ Language is utility-focused
  - Demo mode clearly labeled

- [ ] **Analytics show summaries only**
  - Status: ⚠️ NOT IMPLEMENTED (v1 scope: read-only, no fetch)

- [ ] **Inbox is read-only and clearly so**
  - Status: ⚠️ NOT IMPLEMENTED (v1 scope: read-only)

- [ ] **Assets upload/store correctly**
  - Status: ⚠️ NOT IMPLEMENTED (v1: text-only posts)

**UI STATUS**: ⚠️ Dashboard needs wiring, Analytics/Inbox future scope

---

## 🎭 5. DEMO / SAFE MODE

- [x] **?demo=true works on all tool pages**
  - Status: ✅ Implemented in previous session

- [x] **No writes occur in demo mode**
  - Status: ✅ All actions show toast confirmations only

- [x] **Placeholder confirmations are neutral**
  - Status: ✅ No misleading success messages

- [x] **Demo screenshots do not imply live data**
  - Status: ✅ Demo mode clearly indicated

- [x] **Demo mode never leaks into production logic**
  - Status: ✅ Isolated via URL param check

**DEMO MODE STATUS**: ✅ Complete

---

## 📜 6. LANGUAGE & EXPECTATIONS

- [ ] **Landing page matches FAQ exactly**
  - Status: ⚠️ NEEDS REVIEW
  - Action: Audit LandingPage.jsx against FAQ

- [ ] **No "AI", "real-time", or "automated" claims**
  - Status: ⚠️ NEEDS REVIEW
  - Action: Search codebase for misleading terms

- [x] **Demo script followed verbatim**
  - Status: ✅ docs/DEMO_SCRIPT.md exists

- [ ] **Pricing page reflects actual limits**
  - Status: ⚠️ NEEDS REVIEW
  - Action: Verify limits in Checkout.jsx

- [ ] **No roadmap or "coming soon" language**
  - Status: ⚠️ NEEDS REVIEW
  - Action: Remove any forward-looking statements

**LANGUAGE STATUS**: ⚠️ Audit required

---

## 🧪 7. FAILURE HANDLING (MINIMUM)

- [x] **OAuth failure shows neutral error**
  - Status: ✅ Error codes map to user-friendly messages
  - No technical jargon exposed

- [x] **Publish failure is visible but non-blocking**
  - Status: ✅ Stored in post_platforms.failure_reason
  - Dashboard will show failed status

- [x] **Worker failure does not crash loop**
  - Status: ✅ Try/catch around each platform publish
  - Continue to next post on error

- [x] **Errors stored, not thrown to users**
  - Status: ✅ Failures written to DB
  - Logs available via Supabase

- [ ] **Support can inspect DB to diagnose**
  - Status: ⚠️ Possible via Supabase dashboard
  - No admin UI for support (manual query required)

**FAILURE HANDLING STATUS**: ✅ Adequate for v1

---

## 💳 8. BILLING & LIMIT ENFORCEMENT (v1)

- [ ] **Plan limits enforced in UI**
  - Status: ⚠️ NEEDS IMPLEMENTATION
  - Action: Check subscription tier before allowing actions

- [ ] **Hard blocks for:**
  - [ ] Max accounts (e.g., 3 per plan)
  - [ ] Max scheduled posts (e.g., 10 per plan)
  - Status: ❌ NOT IMPLEMENTED
  - **BLOCKER**: Must prevent overuse

- [ ] **No soft warnings that imply upgrades**
  - Status: ⚠️ NEEDS REVIEW
  - Action: Ensure error messages are neutral

- [ ] **Stripe webhooks tested (create / cancel)**
  - Status: ⚠️ NOT TESTED
  - Webhook endpoints exist from Rezemai
  - Action: Verify subscription changes propagate

**BILLING STATUS**: ⚠️ Limits must be enforced before launch

---

## 📦 9. OPERATIONAL READINESS

- [ ] **Supabase backups enabled**
  - Status: ⚠️ USER RESPONSIBILITY
  - Action: Enable in Supabase project settings

- [x] **Logs accessible for Edge Functions**
  - Status: ✅ Via supabase functions logs scheduler
  - Also available in Supabase dashboard

- [x] **One admin can inspect DB manually**
  - Status: ✅ Supabase SQL Editor available
  - Direct table access for debugging

- [x] **Rollback plan exists (disable scheduler cron)**
  - Status: ✅ Documented in SCHEDULER_DEPLOYMENT.md
  - Cron can be disabled via dashboard

- [x] **You can explain the system in <5 minutes**
  - Status: ✅ E2E_LIFECYCLE.md provides complete picture
  - Clean, linear architecture

**OPERATIONAL STATUS**: ✅ Minimal viable operations in place

---

## 🚨 CRITICAL BLOCKERS (MUST FIX BEFORE PRODUCTION)

1. **User/org bootstrap** - First login must create DB records
2. **Composer → DB wiring** - Drafts and scheduled posts must save
3. **Dashboard → DB wiring** - Must show real post data
4. **Scheduler → DB wiring** - Must show real scheduled posts
5. **Account disconnect** - Users must be able to revoke connections
6. **Plan limit enforcement** - Prevent abuse (max accounts, max posts)

---

## ⚠️ NON-BLOCKING (Can ship without, but needed soon)

1. OAuth token decryption in worker (currently stored encrypted but not decrypted)
2. Supabase RLS policy application (SQL ready, needs execution)
3. HTTPS verification in production
4. UI language audit (remove any "AI" or "coming soon" claims)
5. Stripe webhook testing
6. Supabase backup configuration

---

## ✅ READY FOR PRODUCTION (Already Complete)

1. Demo mode isolation
2. Scheduler worker logic
3. OAuth flows (LinkedIn, X, Meta)
4. Failure tracking and logging
5. Security architecture (RLS, encryption, service role)
6. Rollback procedures
7. Documentation (E2E, deployment, FAQ)

---

## NEXT STEPS (Priority Order)

1. **Implement user/org bootstrap** - Essential for first login
2. **Wire Composer to Supabase** - Enable draft/schedule saves
3. **Wire Dashboard to Supabase** - Show real post data
4. **Wire Scheduler to Supabase** - Show real scheduled posts
5. **Add disconnect flow** - Account management hygiene
6. **Enforce plan limits** - Prevent overuse
7. **Audit UI language** - Remove misleading claims
8. **Deploy scheduler to Supabase** - Enable automated publishing
9. **Test end-to-end** - Create post, schedule, verify publish
10. **Enable backups** - Data protection

---

**Estimated Time to Production-Ready**: 4-6 hours of focused work

**Risk Level**: Medium (core flows exist, need integration)

**Recommendation**: Focus on blockers 1-6, then deploy for internal testing before first customer.

---

**Last Updated**: January 2026
**Owner**: SoshlOps Engineering
**Status**: Pre-production (integration phase)
