/**
 * Meta (Facebook) OAuth Start Endpoint
 *
 * Initiates OAuth 2.0 flow with Meta:
 * 1. Generate CSRF state token
 * 2. Build authorization URL with required scopes
 * 3. Store state in cookie
 * 4. Redirect to Facebook authorization page
 */

import crypto from 'crypto';

const META_CLIENT_ID = process.env.META_CLIENT_ID;
const META_REDIRECT_URI = process.env.META_REDIRECT_URI;
const APP_ORIGIN = process.env.ORIGIN;

if (!META_CLIENT_ID || !META_REDIRECT_URI) {
  throw new Error('Missing Meta OAuth configuration');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate CSRF protection token
    const state = crypto.randomBytes(32).toString('hex');

    // Build Meta OAuth authorization URL
    const authUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth');
    authUrl.searchParams.append('client_id', META_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', META_REDIRECT_URI);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', 'pages_manage_posts,pages_read_engagement');
    authUrl.searchParams.append('response_type', 'code');

    // Store state in HttpOnly cookie (10 min expiry)
    res.setHeader('Set-Cookie', `meta_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);

    // Redirect to Facebook authorization page
    return res.redirect(302, authUrl.toString());

  } catch (error) {
    console.error('Meta OAuth start error:', error);
    return res.redirect(302, `${APP_ORIGIN}/Account?error=oauth_init_failed`);
  }
}
