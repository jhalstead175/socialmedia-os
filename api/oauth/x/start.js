/**
 * X (Twitter) OAuth Start Endpoint
 *
 * Initiates OAuth 2.0 flow with X:
 * 1. Generate CSRF state token
 * 2. Build authorization URL
 * 3. Store state in cookie
 * 4. Redirect to X authorization page
 */

import crypto from 'crypto';

const X_CLIENT_ID = process.env.X_CLIENT_ID;
const X_REDIRECT_URI = process.env.X_REDIRECT_URI;
const APP_ORIGIN = process.env.ORIGIN;

if (!X_CLIENT_ID || !X_REDIRECT_URI) {
  throw new Error('Missing X OAuth configuration');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate CSRF protection token
    const state = crypto.randomBytes(32).toString('hex');

    // Build X OAuth 2.0 authorization URL
    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', X_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', X_REDIRECT_URI);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', 'tweet.write tweet.read users.read offline.access');
    authUrl.searchParams.append('code_challenge', 'challenge'); // PKCE required by X
    authUrl.searchParams.append('code_challenge_method', 'plain');

    // Store state in HttpOnly cookie (10 min expiry)
    res.setHeader('Set-Cookie', `x_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);

    // Redirect to X authorization page
    return res.redirect(302, authUrl.toString());

  } catch (error) {
    console.error('X OAuth start error:', error);
    return res.redirect(302, `${APP_ORIGIN}/Account?error=oauth_init_failed`);
  }
}
