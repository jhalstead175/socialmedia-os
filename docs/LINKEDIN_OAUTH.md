# LinkedIn OAuth Setup for SoshlOps

**Objective**: Enable users to connect their LinkedIn accounts for social media publishing.

**Scope (v1)**: Connect only. No publishing, no analytics fetch, no background jobs.

---

## Prerequisites

1. Supabase project created with schema applied
2. Clerk authentication configured
3. LinkedIn Developer account

---

## Step 1: Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click **Create App**
3. Fill in app details:
   - **App name**: SoshlOps
   - **LinkedIn Page**: Your company page (required)
   - **Privacy policy URL**: Your privacy policy
   - **App logo**: Upload S Monolith logo
4. Click **Create App**

### Request Products

1. Go to **Products** tab
2. Request access to:
   - ✅ **Sign In with LinkedIn** (immediate)
   - ✅ **Share on LinkedIn** (may require review)

### Configure OAuth

1. Go to **Auth** tab
2. Add **Authorized redirect URLs**:
   ```
   https://yourdomain.com/api/oauth/linkedin/callback
   http://localhost:5173/api/oauth/linkedin/callback (for development)
   ```
3. Copy credentials:
   - **Client ID**
   - **Client Secret** (click "Show")

---

## Step 2: Set Environment Variables

Add to `.env`:

```bash
# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-actual-client-id
LINKEDIN_CLIENT_SECRET=your-actual-client-secret
LINKEDIN_REDIRECT_URI=https://yourdomain.com/api/oauth/linkedin/callback

# Supabase (server-side)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Encryption
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

**Important**:
- Never commit these values
- Service role key bypasses RLS - server-side only
- Encryption key must be 64-char hex string

---

## Step 3: Verify Database Schema

Ensure `social_accounts` table exists:

```sql
select * from social_accounts limit 1;
```

If missing, run `docs/schema.sql`.

---

## Step 4: Test OAuth Flow

### Local Development

1. Start dev server: `npm run dev`
2. Navigate to `/Account`
3. Click **Connect** on LinkedIn card
4. You should be redirected to LinkedIn auth
5. Authorize the app
6. You should be redirected back to `/Account?connected=linkedin`
7. Toast notification should appear: "LinkedIn account connected successfully"

### Verify in Database

```sql
select
  platform,
  platform_username,
  is_active,
  connected_at
from social_accounts
where platform = 'linkedin';
```

You should see your LinkedIn account.

---

## API Endpoints

### `GET /api/oauth/linkedin/start`

**Purpose**: Initiate OAuth flow

**Flow**:
1. Generate CSRF state token
2. Store state in cookie (600s expiry)
3. Redirect to LinkedIn authorization page

**Scopes Requested**:
- `r_liteprofile` - Read basic profile
- `r_emailaddress` - Read email
- `w_member_social` - Post on behalf of user (for later)

**Security**:
- State parameter prevents CSRF
- HttpOnly cookie prevents XSS
- 10-minute expiry

### `GET /api/oauth/linkedin/callback`

**Purpose**: Handle OAuth callback

**Flow**:
1. Validate state (CSRF protection)
2. Exchange code for access token
3. Fetch LinkedIn profile (id, name)
4. Get user's org from Supabase
5. Encrypt access token
6. Store in `social_accounts` table
7. Redirect to `/Account?connected=linkedin`

**Error Handling**:
- Invalid state → `/Account?error=state_mismatch`
- Token exchange failed → `/Account?error=token_exchange_failed`
- Profile fetch failed → `/Account?error=profile_fetch_failed`
- User not found → `/Account?error=user_not_found`
- Storage failed → `/Account?error=storage_failed`

---

## Security Considerations

### ✅ Implemented

- **State parameter** for CSRF protection
- **Access tokens encrypted** at rest (AES-256-GCM)
- **Secrets server-side only** (never in frontend)
- **RLS enforces org isolation** (via Clerk JWT org_id)
- **HTTPS only** in production
- **HttpOnly cookies** for state storage

### ❌ Not Implemented (v1)

- Token refresh (LinkedIn v2 tokens don't refresh)
- Token revocation endpoint
- Webhook for connection status
- Organization page publishing (person only for now)
- Rate limit handling

---

## Token Storage

**Format in Database**:
```
iv:authTag:ciphertext
```

Example:
```
a1b2c3d4...:e5f6g7h8...:i9j0k1l2...
```

**Decryption** (server-side only):
```javascript
import { decryptToken } from '@/api/lib/crypto';

const plaintext = decryptToken(encryptedToken);
```

**Never**:
- Send decrypted tokens to frontend
- Log tokens in production
- Store tokens in localStorage/sessionStorage

---

## Troubleshooting

### "Missing LinkedIn OAuth configuration"

- Check `.env` has all required vars
- Restart dev server after adding env vars
- Verify `.env` is not `.env.example`

### "State mismatch"

- Cookie was cleared/expired (10min timeout)
- Multiple tabs opened during OAuth
- Browser blocking cookies

### "User not found in database"

- User hasn't been bootstrapped yet
- Clerk user ID doesn't match Supabase users table
- Run bootstrap logic on first login

### "Permission denied for table social_accounts"

- Service role key not set
- Wrong Supabase URL
- RLS policies blocking query (shouldn't happen with service role)

---

## Next Steps (Post-MVP)

After LinkedIn OAuth is working:

1. **X (Twitter) OAuth** - Similar flow, different endpoints
2. **Meta OAuth** - Facebook/Instagram (more complex)
3. **Token refresh** - If LinkedIn adds refresh tokens
4. **Publishing** - Use stored tokens to post content
5. **Analytics** - Fetch engagement metrics
6. **Webhooks** - Listen for connection revocations

---

## LinkedIn API Documentation

- [OAuth 2.0](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [Profile API](https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api)
- [UGC Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/ugc-post-api) (for publishing)

---

**Last Updated**: January 2026
**Status**: v1 - Connect only, no publishing yet
