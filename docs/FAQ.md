# SoshlOps v1 FAQ

## What is SoshlOps v1?

SoshlOps v1 is a professional social media publishing platform focused on **reliable scheduling and publishing**. It's built for teams and individuals who need dependable, auditable social media operations.

## What platforms are supported?

**v1 supports:**
- LinkedIn (text posts)

**Coming soon:**
- X (Twitter)
- Meta (Facebook/Instagram)

## What can I publish?

v1 supports **text-only posts**. You can:
- Write posts up to platform character limits
- Schedule posts for future publishing
- Publish immediately
- View your publishing calendar

**Not yet supported:**
- Images and videos
- Polls
- Multi-image carousels
- Link previews (automatic only)

## How does scheduling work?

1. Write your post in the Composer
2. Click "Schedule" and choose date/time
3. Your post is saved to the schedule
4. The scheduler runs every minute and publishes posts when due

**Reliability:**
- Posts publish within 1 minute of scheduled time
- Failed posts are marked and visible
- You can see exactly what's scheduled

## What analytics are available?

v1 shows:
- Number of posts published (last 7 days)
- Number of posts scheduled
- Connected accounts

**Native platform analytics (impressions, engagement) are coming in v1.1.**

## Can I manage a team?

v1 supports **organization accounts** where multiple users share:
- Connected social accounts
- Scheduled posts
- Publishing history

**Coming in v1.1:**
- Team roles (admin, editor, viewer)
- Approval workflows
- Activity logs

## What are the limitations?

**v1 intentionally does not include:**
- AI writing assistance
- Advanced analytics ingestion
- Inbox replies (read-only for now)
- Bulk upload
- Mobile app
- Webhooks

These aren't bugs—they're planned for future releases.

## Is my data secure?

Yes:
- All OAuth tokens are encrypted (AES-256-GCM)
- Row-level security isolates organization data
- Supabase handles authentication
- Your posts are never shared between orgs

## What happens if a post fails to publish?

If publishing fails:
- The post status is marked as "failed"
- The error reason is recorded
- You'll see it in the Scheduler with failure details
- You can reschedule or publish manually

**We never hide failures or pretend posts succeeded.**

## How do I get support?

For v1:
- Email: support@soshlops.com (check Account Settings page)
- Documentation: See docs/ folder in repository

## What's the pricing?

**v1 Plan:**
- 1 paid plan or free tier with limits
- Limits enforced server-side
- See Account Settings → Plan for your limits

Pricing details are on the landing page.

## What's coming next?

**v1.1 priorities:**
- X (Twitter) and Meta publishing
- Image/video attachments
- Analytics ingestion
- Team roles
- Approval workflows

**v2 considerations:**
- AI writing assistance
- Multi-platform post variants
- Mobile app
- Advanced scheduling rules

## Why is v1 so focused?

We're shipping a **reliable, trustworthy foundation** first. Better to do scheduling perfectly than do everything poorly.

Every feature we ship:
- Works reliably
- Shows accurate status
- Never lies to users
- Is fully documented

## Can I request features?

Yes! Email feature requests to support@soshlops.com.

We're prioritizing:
1. Reliability over features
2. Common needs over edge cases
3. Correctness over speed

## Is there a demo mode?

Yes! Add `?demo=1` to any page URL to see SoshlOps with sample data. Perfect for exploring before connecting accounts.

## Technical details?

**Stack:**
- Frontend: React + Vite
- Backend: Supabase (PostgreSQL + Edge Functions)
- Auth: Clerk
- Hosting: Vercel
- Scheduler: Supabase Cron (1-minute resolution)

**Architecture:**
- Organization-level data isolation
- Row-level security (RLS)
- Encrypted token storage
- Idempotent scheduler design
