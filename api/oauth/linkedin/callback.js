/**
 * LinkedIn OAuth Callback Endpoint
 *
 * Handles OAuth callback from LinkedIn:
 * 1. Validate state (CSRF protection)
 * 2. Exchange code for access token
 * 3. Fetch LinkedIn profile
 * 4. Store credentials in Supabase
 * 5. Redirect to Profile page with success
 */

import { supabaseServer } from '../../lib/supabase-server.js';
import { encryptToken } from '../../lib/crypto.js';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;
const APP_ORIGIN = process.env.VITE_APP_URL || 'https://soshlops.vercel.app';

if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !LINKEDIN_REDIRECT_URI) {
  throw new Error('Missing LinkedIn OAuth configuration');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state, error } = req.query;

  // Handle OAuth errors
  if (error) {
    console.error('LinkedIn OAuth error:', error);
    return res.redirect(302, `${APP_ORIGIN}/Account?error=oauth_failed`);
  }

  // Validate required params
  if (!code || !state) {
    return res.redirect(302, `${APP_ORIGIN}/Account?error=invalid_request`);
  }

  try {
    // Decode state to get user ID and nonce
    let userId, stateNonce;
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      userId = decoded.userId;
      stateNonce = decoded.nonce;
    } catch (e) {
      console.error('Invalid state format:', e);
      return res.redirect(302, `${APP_ORIGIN}/Account?error=state_mismatch`);
    }

    // Verify nonce (CSRF protection)
    const cookies = parseCookies(req.headers.cookie);
    const storedNonce = cookies.linkedin_oauth_nonce;

    if (!storedNonce || storedNonce !== stateNonce) {
      return res.redirect(302, `${APP_ORIGIN}/Account?error=state_mismatch`);
    }

    if (!userId) {
      return res.redirect(302, `${APP_ORIGIN}/signin?redirect=/Account`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('LinkedIn token exchange failed:', errorData);
      return res.redirect(302, `${APP_ORIGIN}/Account?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, expires_in } = tokenData;

    // Fetch LinkedIn profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });

    if (!profileResponse.ok) {
      console.error('LinkedIn profile fetch failed');
      return res.redirect(302, `${APP_ORIGIN}/Account?error=profile_fetch_failed`);
    }

    const profileData = await profileResponse.json();
    const linkedinUserId = profileData.id;
    const displayName = `${profileData.localizedFirstName} ${profileData.localizedLastName}`;

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

    // Encrypt access token
    const encryptedToken = encryptToken(access_token);

    // Calculate token expiry
    const expiresAt = new Date(Date.now() + (expires_in * 1000)).toISOString();

    // Store in social_accounts table
    const { error: insertError } = await supabaseServer
      .from('social_accounts')
      .upsert({
        organization_id: user.organization_id,
        platform: 'linkedin',
        platform_user_id: linkedinUserId,
        platform_username: displayName,
        access_token: encryptedToken,
        refresh_token: null, // LinkedIn tokens don't refresh in v2 OAuth
        token_expires_at: expiresAt,
        is_active: true,
        connected_at: new Date().toISOString()
      }, {
        onConflict: 'organization_id,platform,platform_user_id'
      });

    if (insertError) {
      console.error('Failed to store LinkedIn credentials:', insertError);
      return res.redirect(302, `${APP_ORIGIN}/Account?error=storage_failed`);
    }

    // Clear nonce cookie
    res.setHeader('Set-Cookie', 'linkedin_oauth_nonce=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');

    // Redirect to Profile with success
    return res.redirect(302, `${APP_ORIGIN}/Account?connected=linkedin`);

  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error);
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
