# End-to-End Request Lifecycle

**Purpose**: Document the complete user journey from click to platform publish.
**Scope**: All phases of SoshlOps v1 (LinkedIn-only, text posts)
**Updated**: January 2026

---

## Overview

This document traces every action a user can take in SoshlOps v1, from first login to seeing their post on LinkedIn. It covers:

1. **First Login** → Org/user bootstrap
2. **Connect LinkedIn** → OAuth flow
3. **Compose Post** → Draft creation and scheduling
4. **View Scheduler** → See upcoming posts
5. **Worker Runs** → Automated publishing
6. **Dashboard** → Post status visibility
7. **Analytics** → Read-only metrics (future)
8. **Inbox** → Read-only messages (future)
9. **Assets** → Media library (future)

---

## Phase 1: First Login (User Bootstrap)

### User Action
1. User clicks **Sign In** on landing page
2. Redirected to Clerk authentication
3. Signs in with Google/GitHub/Email
4. Clerk authenticates and redirects back to app

### System Response

**Clerk** (Identity Provider):
- Creates user record in Clerk database
- Generates JWT with `userId` and `email`
- Sets session cookie

**SoshlOps Backend** (First-time setup):
```typescript
// Triggered by middleware or first API call
async function bootstrapUser(clerkUserId: string, email: string) {
  // 1. Check if user exists
  const existing = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (existing.data) {
    return; // Already bootstrapped
  }

  // 2. Create organization (one per user in v1)
  const { data: org } = await supabase
    .from('organizations')
    .insert({ name: `${email}'s Organization` })
    .select('id')
    .single();

  // 3. Create user record
  await supabase
    .from('users')
    .insert({
      organization_id: org.id,
      clerk_user_id: clerkUserId,
      email: email
    });

  // 4. Update Clerk JWT to include org_id
  // (via Clerk webhook or session claim)
}
```

**Result**:
- User record in `users` table
- Organization record in `organizations` table
- JWT now includes `org_id` for RLS enforcement

**UI State**:
- Redirected to `/Dashboard`
- Dashboard shows empty state: "No posts yet"
- Profile page shows zero connected accounts

---

## Phase 2: Connect LinkedIn

### User Action
1. Navigate to **Profile** page
2. Click **Connect LinkedIn** button
3. Redirected to LinkedIn OAuth consent screen
4. Approves permissions (profile, email, post on their behalf)
5. Redirected back to SoshlOps

### System Flow

**Frontend** (`/Account` page):
```tsx
const handleConnectLinkedIn = () => {
  window.location.href = '/api/oauth/linkedin/start';
};
```

**Backend** (`/api/oauth/linkedin/start.js`):
```javascript
// 1. Generate CSRF token
const state = crypto.randomBytes(32).toString('hex');

// 2. Build LinkedIn authorization URL
const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
authUrl.searchParams.append('response_type', 'code');
authUrl.searchParams.append('client_id', LINKEDIN_CLIENT_ID);
authUrl.searchParams.append('redirect_uri', LINKEDIN_REDIRECT_URI);
authUrl.searchParams.append('state', state);
authUrl.searchParams.append('scope', 'r_liteprofile r_emailaddress w_member_social');

// 3. Store state in cookie (CSRF protection)
res.setHeader('Set-Cookie', `linkedin_oauth_state=${state}; HttpOnly; Secure`);

// 4. Redirect to LinkedIn
res.redirect(302, authUrl.toString());
```

**LinkedIn** (External):
- User sees permission request
- Clicks "Allow"
- Redirects to `LINKEDIN_REDIRECT_URI` with `?code=XXX&state=YYY`

**Backend** (`/api/oauth/linkedin/callback.js`):
```javascript
// 1. Validate state (CSRF check)
const cookies = parseCookies(req.headers.cookie);
if (cookies.linkedin_oauth_state !== state) {
  return res.redirect('/Account?error=state_mismatch');
}

// 2. Exchange code for access token
const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
  method: 'POST',
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: LINKEDIN_CLIENT_ID,
    client_secret: LINKEDIN_CLIENT_SECRET,
    redirect_uri: LINKEDIN_REDIRECT_URI
  })
});

const { access_token, expires_in } = await tokenResponse.json();

// 3. Fetch LinkedIn profile
const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
  headers: { Authorization: `Bearer ${access_token}` }
});

const profile = await profileResponse.json();

// 4. Encrypt and store credentials
const encryptedToken = encryptToken(access_token);
const expiresAt = new Date(Date.now() + expires_in * 1000);

await supabase.from('social_accounts').upsert({
  organization_id: user.organization_id,
  platform: 'linkedin',
  platform_user_id: profile.id,
  platform_username: `${profile.localizedFirstName} ${profile.localizedLastName}`,
  access_token: encryptedToken,
  token_expires_at: expiresAt.toISOString(),
  is_active: true
});

// 5. Redirect with success
res.redirect('/Account?connected=linkedin');
```

**Frontend** (Account page reload):
```tsx
// Detect success
const connected = searchParams.get('connected');
if (connected === 'linkedin') {
  toast.success('LinkedIn connected successfully');

  // Reload connected accounts
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('platform, is_active')
    .eq('is_active', true);

  setConnectedAccounts({ ...accounts });
}
```

**Result**:
- `social_accounts` row created with encrypted token
- Profile page shows ✅ LinkedIn connected
- Composer now allows LinkedIn as publish target

---

## Phase 3: Compose Post (Real Save)

### User Action
1. Navigate to **Composer** page
2. Type post content: "Excited to announce our new product launch!"
3. Select **LinkedIn** as target platform
4. Choose **Schedule for later**
5. Pick date/time: Tomorrow at 10:00 AM
6. Click **Schedule Post**

### System Flow

**Frontend** (`/Composer` page):
```tsx
const handleSchedulePost = async () => {
  // 1. Validate content
  if (!content.trim()) {
    toast.error('Post content cannot be empty');
    return;
  }

  // 2. Get user and org context
  const { data: user } = await supabase
    .from('users')
    .select('id, organization_id')
    .eq('clerk_user_id', clerkUser.id)
    .single();

  // 3. Create post record
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      organization_id: user.organization_id,
      author_id: user.id,
      content: content,
      media_urls: [], // v1: text-only
      status: 'scheduled',
      scheduled_at: scheduledTime.toISOString()
    })
    .select('id')
    .single();

  if (postError) {
    toast.error('Failed to create post');
    return;
  }

  // 4. Link to selected platforms
  for (const platform of selectedPlatforms) {
    // Get social account for this platform
    const { data: account } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('organization_id', user.organization_id)
      .eq('platform', platform)
      .eq('is_active', true)
      .single();

    if (!account) {
      toast.error(`No connected ${platform} account`);
      continue;
    }

    // Create post_platforms entry
    await supabase.from('post_platforms').insert({
      post_id: post.id,
      social_account_id: account.id,
      platform: platform,
      status: 'pending'
    });
  }

  // 5. Success feedback
  toast.success('Post scheduled successfully');
  router.push('/Scheduler'); // Redirect to scheduler view
};
```

**Database State After Save**:

**posts** table:
```
id: 550e8400-e29b-41d4-a716-446655440000
organization_id: 123e4567-e89b-12d3-a456-426614174000
author_id: 789e4567-e89b-12d3-a456-426614174000
content: "Excited to announce our new product launch!"
media_urls: []
status: "scheduled"
scheduled_at: "2026-01-10T10:00:00Z"
published_at: null
created_at: "2026-01-09T15:30:00Z"
```

**post_platforms** table:
```
id: 660e8400-e29b-41d4-a716-446655440000
post_id: 550e8400-e29b-41d4-a716-446655440000
social_account_id: 890e8400-e29b-41d4-a716-446655440000
platform: "linkedin"
platform_post_id: null
status: "pending"
published_at: null
```

**Result**:
- Post record created with `status='scheduled'`
- Platform linkage created with `status='pending'`
- User sees post in Scheduler view

---

## Phase 4: View Scheduler

### User Action
1. Navigate to **Scheduler** page
2. Views calendar or list of scheduled posts

### System Flow

**Frontend** (`/Scheduler` page):
```tsx
useEffect(() => {
  async function loadScheduledPosts() {
    const { data: user } = await supabase
      .from('users')
      .select('organization_id')
      .eq('clerk_user_id', clerkUser.id)
      .single();

    // Fetch all scheduled posts for this org
    const { data: posts } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        scheduled_at,
        status,
        post_platforms (
          platform,
          status
        )
      `)
      .eq('organization_id', user.organization_id)
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true });

    setScheduledPosts(posts);
  }

  loadScheduledPosts();
}, [clerkUser]);
```

**UI Rendering**:
```tsx
{scheduledPosts.map(post => (
  <div key={post.id} className="post-card">
    <div className="content">{post.content}</div>
    <div className="scheduled-time">
      📅 Scheduled for {formatDate(post.scheduled_at)}
    </div>
    <div className="platforms">
      {post.post_platforms.map(pp => (
        <Badge key={pp.platform}>
          {pp.platform} - {pp.status}
        </Badge>
      ))}
    </div>
  </div>
))}
```

**Result**:
- User sees upcoming post: "Excited to announce..." scheduled for tomorrow 10 AM
- Badge shows "linkedin - pending"
- Can edit or cancel if needed (v1: read-only)

---

## Phase 5: Worker Runs (Automated Publishing)

### Trigger
- **Cron schedule**: `* * * * *` (every minute)
- **Execution**: Supabase Edge Function at `/functions/v1/scheduler`

### System Flow

**Supabase Cron** (Automatic):
```
[2026-01-10 10:00:00] Triggering scheduler function...
```

**Edge Function** (`supabase/functions/scheduler/index.ts`):
```typescript
serve(async () => {
  const now = new Date().toISOString(); // "2026-01-10T10:00:00Z"

  // 1. Fetch due posts
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id,
      content,
      media_urls,
      post_platforms (
        id,
        platform,
        social_account_id
      )
    `)
    .eq('status', 'scheduled')
    .lte('scheduled_at', now); // scheduled_at <= now

  console.log(`Processing ${posts.length} scheduled posts`);

  // 2. Process each post
  for (const post of posts) {
    let anySuccess = false;

    // 3. Publish to each platform
    for (const platform of post.post_platforms) {
      try {
        if (platform.platform === 'linkedin') {
          const platformPostId = await publishToLinkedIn(post, platform);

          // Record success
          await supabase.from('post_platforms').update({
            status: 'published',
            published_at: new Date().toISOString(),
            platform_post_id: platformPostId
          }).eq('id', platform.id);

          anySuccess = true;
          console.log(`✅ Published post ${post.id} to LinkedIn`);
        }
      } catch (err) {
        // Record failure
        await supabase.from('post_platforms').update({
          status: 'failed',
          failure_reason: err.message
        }).eq('id', platform.id);

        console.error(`❌ Failed to publish ${post.id} to ${platform.platform}:`, err);
      }
    }

    // 4. Update post status
    await supabase.from('posts').update({
      status: anySuccess ? 'published' : 'failed',
      published_at: anySuccess ? new Date().toISOString() : null
    }).eq('id', post.id);
  }

  return new Response('OK', { status: 200 });
});
```

**LinkedIn API Call** (Inside `publishToLinkedIn`):
```typescript
// 1. Fetch social account with access token
const { data: account } = await supabase
  .from('social_accounts')
  .select('access_token, platform_user_id')
  .eq('id', platform.social_account_id)
  .single();

// 2. Call LinkedIn UGC Posts API
const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${account.access_token}`,
    'Content-Type': 'application/json',
    'X-Restli-Protocol-Version': '2.0.0'
  },
  body: JSON.stringify({
    author: `urn:li:person:${account.platform_user_id}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: post.content },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  })
});

// 3. Extract post ID
const responseData = await response.json();
return responseData.id; // e.g., "urn:li:share:7123456789"
```

**LinkedIn Response** (External):
```json
{
  "id": "urn:li:share:7123456789",
  "created": {
    "actor": "urn:li:person:ABC123",
    "time": 1704884400000
  }
}
```

**Database State After Publish**:

**posts** table:
```
id: 550e8400-e29b-41d4-a716-446655440000
status: "published" ← Changed from "scheduled"
published_at: "2026-01-10T10:00:05Z" ← Now set
```

**post_platforms** table:
```
id: 660e8400-e29b-41d4-a716-446655440000
status: "published" ← Changed from "pending"
published_at: "2026-01-10T10:00:05Z"
platform_post_id: "urn:li:share:7123456789" ← LinkedIn URN
```

**Result**:
- Post is live on LinkedIn
- Database reflects published status
- Next cron run will NOT pick up this post (status changed)

---

## Phase 6: Dashboard Reflects Reality

### User Action
1. Navigate to **Dashboard** page
2. Views recent posts and their statuses

### System Flow

**Frontend** (`/Dashboard` page):
```tsx
useEffect(() => {
  async function loadRecentPosts() {
    const { data: user } = await supabase
      .from('users')
      .select('organization_id')
      .eq('clerk_user_id', clerkUser.id)
      .single();

    // Fetch recent posts (all statuses)
    const { data: posts } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        status,
        scheduled_at,
        published_at,
        created_at,
        post_platforms (
          platform,
          status,
          platform_post_id,
          failure_reason
        )
      `)
      .eq('organization_id', user.organization_id)
      .order('created_at', { ascending: false })
      .limit(20);

    setRecentPosts(posts);
  }

  loadRecentPosts();
}, [clerkUser]);
```

**UI Rendering**:
```tsx
{recentPosts.map(post => (
  <div key={post.id} className="post-card">
    <div className="content">{post.content}</div>

    <div className="status">
      {post.status === 'published' && (
        <Badge variant="success">
          ✅ Published {formatTimeAgo(post.published_at)}
        </Badge>
      )}
      {post.status === 'scheduled' && (
        <Badge variant="info">
          📅 Scheduled for {formatDate(post.scheduled_at)}
        </Badge>
      )}
      {post.status === 'failed' && (
        <Badge variant="error">
          ❌ Failed
        </Badge>
      )}
    </div>

    <div className="platforms">
      {post.post_platforms.map(pp => (
        <div key={pp.platform}>
          {pp.platform}: {pp.status}
          {pp.platform_post_id && (
            <a href={getLinkedInPostUrl(pp.platform_post_id)}>
              View on LinkedIn ↗
            </a>
          )}
          {pp.failure_reason && (
            <span className="error-text">{pp.failure_reason}</span>
          )}
        </div>
      ))}
    </div>
  </div>
))}
```

**Result**:
- Dashboard shows post with ✅ Published badge
- "View on LinkedIn" link appears
- Clicking link opens LinkedIn post in new tab

---

## Phase 7: Analytics (Read-Only, Future)

**v1 Status**: Not implemented yet

**Planned Flow**:

### User Action
1. Navigate to **Analytics** page
2. Select post to view metrics

### System Flow (Planned)

**Frontend**:
```tsx
// Fetch analytics snapshots for this post
const { data: snapshots } = await supabase
  .from('analytics_snapshots')
  .select('*')
  .eq('post_id', selectedPostId)
  .order('fetched_at', { ascending: false })
  .limit(1);

// Display metrics
<div className="analytics">
  <Metric label="Impressions" value={snapshots[0].impressions} />
  <Metric label="Likes" value={snapshots[0].likes} />
  <Metric label="Comments" value={snapshots[0].comments} />
  <Metric label="Shares" value={snapshots[0].shares} />
</div>
```

**Background Worker** (Not yet implemented):
- Cron job runs daily
- Fetches LinkedIn analytics via API
- Stores in `analytics_snapshots` table
- Allows time-series analysis

**Scope**:
- Read-only display (no actions)
- Historical data visible
- Comparison across posts

---

## Phase 8: Inbox (Read-Only, Future)

**v1 Status**: Not implemented yet

**Planned Flow**:

### User Action
1. Navigate to **Inbox** page
2. Views comments and mentions

### System Flow (Planned)

**Frontend**:
```tsx
// Fetch inbox items for this org
const { data: items } = await supabase
  .from('inbox_items')
  .select('*')
  .eq('organization_id', user.organization_id)
  .order('created_at', { ascending: false })
  .limit(50);

// Display inbox
{items.map(item => (
  <div key={item.id} className="inbox-item">
    <div className="type">{item.type}</div>
    <div className="content">{item.content}</div>
    <div className="from">{item.from_user}</div>
    <a href={item.platform_url}>View on {item.platform} ↗</a>
  </div>
))}
```

**Background Worker** (Not yet implemented):
- Cron job runs every 15 minutes
- Fetches comments/mentions from LinkedIn API
- Stores in `inbox_items` table
- Marks as read/unread

**Scope**:
- Read-only display (no replies in v1)
- Visibility into engagement
- Click to view on platform

---

## Phase 9: Assets (Media Library, Future)

**v1 Status**: Not implemented yet (text-only posts)

**Planned Flow**:

### User Action
1. Navigate to **Assets** page
2. Click **Upload Image**
3. Select file from device
4. File uploads to Supabase Storage

### System Flow (Planned)

**Frontend**:
```tsx
const handleUpload = async (file: File) => {
  // 1. Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('media')
    .upload(`${user.organization_id}/${uuidv4()}.${file.type.split('/')[1]}`, file);

  if (error) {
    toast.error('Upload failed');
    return;
  }

  // 2. Create asset record
  await supabase.from('assets').insert({
    organization_id: user.organization_id,
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
    storage_path: data.path
  });

  toast.success('Asset uploaded successfully');
};
```

**Composer Integration**:
```tsx
// Select asset from library
const handleSelectAsset = (asset) => {
  const { data } = supabase.storage
    .from('media')
    .getPublicUrl(asset.storage_path);

  setMediaUrls([...mediaUrls, data.publicUrl]);
};
```

**Scope**:
- Upload images/videos
- Organize in library
- Attach to posts
- Delete unused assets

---

## Summary: Complete Cycle

```
User Signs In
  ↓
[Clerk] Authenticates
  ↓
[Backend] Creates org + user in Supabase
  ↓
User Connects LinkedIn
  ↓
[OAuth] LinkedIn grants access token
  ↓
[Backend] Encrypts and stores token
  ↓
User Composes Post
  ↓
[Frontend] Saves to Supabase (status='scheduled')
  ↓
User Views Scheduler
  ↓
[Frontend] Displays upcoming posts
  ↓
[Time Passes...]
  ↓
[Cron] Triggers scheduler worker
  ↓
[Edge Function] Fetches due posts
  ↓
[LinkedIn API] Publishes post
  ↓
[Edge Function] Updates status to 'published'
  ↓
User Views Dashboard
  ↓
[Frontend] Shows ✅ Published status
  ↓
User Clicks "View on LinkedIn"
  ↓
[Browser] Opens LinkedIn post
  ↓
[User] Sees post live on LinkedIn! 🎉
```

---

## Data Flow Diagram

```
┌─────────────┐
│   Clerk     │ (Authentication)
└──────┬──────┘
       │ JWT (userId, org_id)
       ↓
┌─────────────┐
│  Frontend   │ (React + Supabase Client)
└──────┬──────┘
       │ Authenticated requests (JWT in headers)
       ↓
┌─────────────┐
│  Supabase   │ (Postgres + RLS)
│  Database   │
└──────┬──────┘
       │ Row-level security enforces org_id
       ↓
┌─────────────┐
│ Edge Func   │ (Scheduler Worker, Deno)
└──────┬──────┘
       │ Service role key (bypasses RLS)
       ↓
┌─────────────┐
│  LinkedIn   │ (UGC Posts API)
│     API     │
└─────────────┘
```

---

## Restraint as Design

**What we DON'T do in v1**:

- ❌ No retries on failure (user manually reschedules)
- ❌ No token refresh (user reconnects when expired)
- ❌ No analytics fetch (read-only, manual view)
- ❌ No inbox replies (read-only, click to platform)
- ❌ No media upload (text-only posts)
- ❌ No bulk operations (one post at a time)
- ❌ No AI features (pure utility)
- ❌ No collaboration (single user per org)

**Why**:
- **Simplicity** over features
- **Stability** over optimization
- **Clarity** over cleverness
- **MVP** over perfection

These constraints make v1 shippable, testable, and maintainable.

---

**Last Updated**: January 2026
**Owner**: SoshlOps Engineering
**Status**: Authoritative reference for v1 implementation
