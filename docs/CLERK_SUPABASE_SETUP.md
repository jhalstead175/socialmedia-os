# Clerk + Supabase Integration Setup

## Overview

SoshlOps uses Clerk for authentication and Supabase for data storage. To enable Row Level Security (RLS) in Supabase, we pass Clerk JWTs with Supabase requests.

## Required Setup Steps

### 1. Create Clerk JWT Template

**CRITICAL:** You MUST create a Clerk JWT template named "supabase" for the app to work properly.

1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Navigate to **Configure** → **JWT Templates**
3. Click **New template** → **Supabase**
4. Name it exactly: `supabase`
5. Configure the claims:

```json
{
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "user_metadata": {
    "full_name": "{{user.full_name}}",
    "organization_id": "{{user.public_metadata.organization_id}}"
  }
}
```

6. Save the template

### 2. Supabase RLS Configuration

Update your Supabase RLS policies to read from JWT claims:

```sql
-- Example RLS policy for posts table
CREATE POLICY "Users can view their org's posts"
ON posts FOR SELECT
USING (
  organization_id = (auth.jwt()->>'user_metadata'->>'organization_id')::uuid
);

-- Example RLS policy for social_accounts table
CREATE POLICY "Users can view their org's social accounts"
ON social_accounts FOR SELECT
USING (
  organization_id = (auth.jwt()->>'user_metadata'->>'organization_id')::uuid
);
```

### 3. Environment Variables

Ensure these are set:

#### Frontend (.env)
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb...
```

#### Supabase Edge Functions
```bash
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=https://[project-ref].supabase.co/functions/v1/oauth-linkedin-callback
ENCRYPTION_KEY=your_32_char_encryption_key
APP_ORIGIN=https://your-app.vercel.app
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhb... (service_role key, not anon)
```

## How It Works

### Frontend Flow

1. User signs in with Clerk
2. App calls `useSupabaseClient()` hook
3. Hook gets Clerk JWT using `getToken({ template: 'supabase' })`
4. JWT is attached to all Supabase requests
5. Supabase RLS policies read org_id from JWT claims
6. Data is filtered automatically by organization

### OAuth Flow

1. User clicks "Connect LinkedIn" in Account page
2. Frontend gets Clerk JWT and calls `oauth-linkedin-start` Edge Function
3. Edge Function verifies JWT and extracts user ID (server-side, secure)
4. User completes OAuth flow with LinkedIn
5. `oauth-linkedin-callback` stores tokens in user's organization
6. Tokens are encrypted with AES-256-GCM

## Security Model

### ✅ SECURE (After MVP Fixes)
- User ID is extracted from verified JWT (not client input)
- OAuth nonce is verified (CSRF protection)
- RLS enforces organization isolation
- Access tokens are encrypted at rest

### ❌ INSECURE (If you skip Clerk template setup)
- RLS policies will fail (no org_id in JWT)
- All queries will be blocked or leak data
- OAuth will fail (no valid JWT)

## Testing

### Verify JWT Template Works

```javascript
// In browser console after signing in:
const { getToken } = useAuth();
const token = await getToken({ template: 'supabase' });
console.log(JSON.parse(atob(token.split('.')[1])));
// Should show: { sub, email, user_metadata: { organization_id } }
```

### Verify RLS Works

1. Create two users in different organizations
2. User A creates a post
3. Sign in as User B
4. Try to query posts table
5. User B should NOT see User A's posts

## Troubleshooting

### "Template 'supabase' not found"
- You didn't create the Clerk JWT template
- Template name is case-sensitive, must be exactly "supabase"

### "organization_id is null in JWT"
- User's Clerk metadata doesn't have organization_id set
- Run user bootstrap hook or manually set in Clerk dashboard

### RLS policies blocking everything
- JWT template isn't configured correctly
- Verify claims match your RLS policy queries
- Check Supabase logs for RLS errors

### OAuth fails with 401
- Edge Function isn't receiving valid Clerk JWT
- Check that frontend is calling `getToken({ template: 'supabase' })`
- Verify CORS headers allow Authorization header

## Migration Checklist

- [ ] Create Clerk JWT template named "supabase"
- [ ] Configure JWT claims (sub, email, user_metadata)
- [ ] Update Supabase RLS policies to read from JWT
- [ ] Test with two users in different orgs
- [ ] Deploy Edge Functions with correct env vars
- [ ] Verify OAuth flow works end-to-end
- [ ] Enable RLS on all tables
- [ ] Test that cross-org leakage is impossible
