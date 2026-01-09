# SoshlOps v1 Platform Support

## Supported Platforms (v1)

### LinkedIn ✅
**Status:** Fully supported

**What works:**
- OAuth connection via LinkedIn API
- Text post publishing (UGC API)
- Scheduled publishing
- Immediate publishing
- Token refresh handling

**Limitations:**
- Text-only (no images/videos in v1)
- Personal profiles only (company pages coming soon)
- No polls or LinkedIn-specific features
- Character limit: LinkedIn's standard limit

**Setup required:**
1. LinkedIn Developer App
2. OAuth credentials configured
3. Redirect URI: `https://your-domain.com/api/oauth/linkedin/callback`

**Publishing flow:**
1. User connects via OAuth
2. Access token encrypted and stored
3. Scheduler publishes via LinkedIn UGC API
4. Success/failure recorded in database

---

## Coming Soon (v1.1)

### X (Twitter) ⏳
**Status:** OAuth flow ready, publishing in testing

**Planned support:**
- Text tweets (280 characters)
- Thread support
- Quote tweets
- Scheduled publishing

**Not planned for v1.1:**
- Images/videos
- Polls
- Twitter Spaces

### Meta (Facebook) ⏳
**Status:** OAuth flow ready, Page publishing in testing

**Planned support:**
- Facebook Page posts (text)
- Scheduled publishing
- Page selection during OAuth

**Not planned for v1.1:**
- Instagram
- Facebook Groups
- Stories
- Images/videos

---

## Platform Comparison

| Feature | LinkedIn | X | Meta | Instagram |
|---------|----------|---|------|-----------|
| Text posts | ✅ v1 | ⏳ v1.1 | ⏳ v1.1 | ❌ Future |
| Scheduled | ✅ v1 | ⏳ v1.1 | ⏳ v1.1 | ❌ Future |
| Images | ❌ Future | ❌ Future | ❌ Future | ❌ Future |
| Analytics | ❌ Future | ❌ Future | ❌ Future | ❌ Future |

---

## Integration Details

### OAuth Security
- All tokens encrypted with AES-256-GCM
- Tokens stored per organization
- Automatic token refresh where supported
- Tokens never shared between organizations

### Publishing Reliability
- Scheduler runs every minute
- Failed posts marked with error reason
- No double-publishing (idempotent design)
- Failures visible in UI

### Rate Limits
v1 enforces:
- Max 50 scheduled posts per organization
- Platform-specific rate limits respected
- No artificial daily post limits

---

## Testing Recommendations

Before production use:

1. **Test LinkedIn connection:**
   - Connect account in Account Settings
   - Verify connection shows as active
   - Check token is encrypted in DB

2. **Test immediate publish:**
   - Write test post in Composer
   - Click "Publish Now"
   - Verify post appears on LinkedIn
   - Check status in Scheduler

3. **Test scheduled publish:**
   - Schedule post for 2 minutes from now
   - Wait for scheduler to run
   - Verify post publishes automatically
   - Check status updates correctly

4. **Test failure handling:**
   - Disconnect LinkedIn account externally
   - Attempt to publish
   - Verify failure is recorded and visible

---

## API Endpoints

### LinkedIn
- **OAuth Start:** `/api/oauth/linkedin/start`
- **OAuth Callback:** `/api/oauth/linkedin/callback`
- **Publishing API:** LinkedIn UGC API v2

### X (Twitter)
- **OAuth Start:** `/api/oauth/x/start`
- **OAuth Callback:** `/api/oauth/x/callback`
- **Publishing API:** Twitter API v2

### Meta
- **OAuth Start:** `/api/oauth/meta/start`
- **OAuth Callback:** `/api/oauth/meta/callback`
- **Publishing API:** Facebook Graph API

---

## Troubleshooting

### LinkedIn OAuth fails
- Check `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`
- Verify redirect URI matches developer app
- Check Clerk JWT includes `org_id`

### Posts don't publish
- Check scheduler cron is running: `select cron.schedule()`
- Verify Edge Function deployed: `supabase functions list`
- Check logs: `supabase functions logs scheduler`
- Verify RLS policies allow service role

### Token errors
- Check encryption key is 64-character hex: `ENCRYPTION_KEY`
- Verify tokens are stored correctly in `social_accounts` table
- Check token decryption works in scheduler

---

## Roadmap

**v1.1 (Next):**
- X and Meta publishing
- Image uploads (single images)
- Basic analytics ingestion

**v1.2:**
- Multi-image posts
- Video support
- Instagram integration

**v2.0:**
- Cross-platform post variants
- Advanced scheduling rules
- AI writing assistance
- Approval workflows
