/**
 * X (Twitter) OAuth Callback Endpoint
 *
 * Handles OAuth callback from X:
 * 1. Validate state (CSRF protection)
 * 2. Exchange code for access token
 * 3. Fetch X profile
 * 4. Store credentials in Supabase
 * 5. Redirect to Account page with success
 */

import { supabaseServer } from '../../lib/supabase-server.js';
import { encryptToken } from '../../lib/crypto.js';
import { getAuth } from '@clerk/nextjs/server';

const X_CLIENT_ID = process.env.X_CLIENT_ID;
const X_CLIENT_SECRET = process.env.X_CLIENT_SECRET;
const X_REDIRECT_URI = process.env.X_REDIRECT_URI;
const APP_ORIGIN = process.env.ORIGIN;

if (!X_CLIENT_ID || !X_CLIENT_SECRET || !X_REDIRECT_URI) {
  throw new Error('Missing X OAuth configuration');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state, error } = req.query;

  // Handle OAuth errors
  if (error) {
    console.error('X OAuth error:', error);
    return res.redirect(302, `${APP_ORIGIN}/Account?error=oauth_failed`);
  }

  // Validate required params
  if (!code || !state) {
    return res.redirect(302, `${APP_ORIGIN}/Account?error=invalid_request`);
  }

  try {
    // Verify state (CSRF protection)
    const cookies = parseCookies(req.headers.cookie);
    const storedState = cookies.x_oauth_state;

    if (!storedState || storedState !== state) {
      return res.redirect(302, `${APP_ORIGIN}/Account?error=state_mismatch`);
    }

    // Get authenticated user from Clerk
    const { userId } = getAuth(req);
    if (!userId) {
      return res.redirect(302, `${APP_ORIGIN}/signin?redirect=/Account`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: X_REDIRECT_URI,
        code_verifier: 'challenge' // PKCE verifier
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('X token exchange failed:', errorData);
      return res.redirect(302, `${APP_ORIGIN}/Account?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Fetch X profile
    const profileResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });

    if (!profileResponse.ok) {
      console.error('X profile fetch failed');
      return res.redirect(302, `${APP_ORIGIN}/Account?error=profile_fetch_failed`);
    }

    const profileData = await profileResponse.json();
    const xUserId = profileData.data.id;
    const displayName = profileData.data.name;
    const username = profileData.data.username;

    // Get user's org from Supabase
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('organization_id')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !user) {
      console.error('User not found in database:', userError);
      return res.redirect(302, `${APP_ORIGIN}/Account?error=user_not_found`);
    }

    // Encrypt tokens
    const encryptedAccessToken = encryptToken(access_token);
    const encryptedRefreshToken = refresh_token ? encryptToken(refresh_token) : null;

    // Calculate token expiry
    const expiresAt = new Date(Date.now() + (expires_in * 1000)).toISOString();

    // Store in social_accounts table
    const { error: insertError } = await supabaseServer
      .from('social_accounts')
      .upsert({
        organization_id: user.organization_id,
        platform: 'x',
        platform_user_id: xUserId,
        platform_username: `@${username} (${displayName})`,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: expiresAt,
        is_active: true,
        connected_at: new Date().toISOString()
      }, {
        onConflict: 'organization_id,platform,platform_user_id'
      });

    if (insertError) {
      console.error('Failed to store X credentials:', insertError);
      return res.redirect(302, `${APP_ORIGIN}/Account?error=storage_failed`);
    }

    // Clear state cookie
    res.setHeader('Set-Cookie', 'x_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');

    // Redirect to Account with success
    return res.redirect(302, `${APP_ORIGIN}/Account?connected=x`);

  } catch (error) {
    console.error('X OAuth callback error:', error);
    return res.redirect(302, `${APP_ORIGIN}/Account?error=unexpected_error`);
  }
}

/**
 * Parse cookies from request header
 */
function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};

  return cookieHeader
    .split(';')
    .map(cookie => cookie.trim().split('='))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
}
