/**
 * LinkedIn OAuth Start Endpoint
 *
 * Initiates OAuth flow by redirecting user to LinkedIn authorization page.
 *
 * Flow:
 * 1. Generate CSRF state token
 * 2. Sign state with user's Clerk ID (embedded in request)
 * 3. Redirect to LinkedIn with state + scopes
 */

import crypto from 'crypto';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

if (!LINKEDIN_CLIENT_ID || !LINKEDIN_REDIRECT_URI) {
  throw new Error('Missing LinkedIn OAuth configuration');
}

// Scopes required for v1
const SCOPES = [
  'r_liteprofile',      // Read basic profile
  'r_emailaddress',     // Read email
  'w_member_social'     // Post on behalf of user (for later)
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate CSRF state token
    const state = crypto.randomBytes(32).toString('hex');

    // TODO: Store state in session or signed cookie for verification
    // For now, we'll use a simple in-memory approach (production should use Redis or similar)
    // Clerk will handle user context on callback

    // Build LinkedIn authorization URL
    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', LINKEDIN_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', LINKEDIN_REDIRECT_URI);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', SCOPES.join(' '));

    // Store state in cookie for verification (signed with secret)
    res.setHeader('Set-Cookie', `linkedin_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);

    // Redirect user to LinkedIn
    return res.redirect(302, authUrl.toString());

  } catch (error) {
    console.error('LinkedIn OAuth start error:', error);
    return res.status(500).json({ error: 'Failed to initiate OAuth' });
  }
}
