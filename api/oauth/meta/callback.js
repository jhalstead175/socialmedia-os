/**
 * Meta (Facebook) OAuth Callback Endpoint
 *
 * Handles OAuth callback from Meta:
 * 1. Validate state (CSRF protection)
 * 2. Exchange code for user access token
 * 3. Fetch user's managed pages
 * 4. Let user select ONE page (or auto-select if only one)
 * 5. Store PAGE credentials in Supabase
 * 6. Redirect to Account page with success
 *
 * IMPORTANT: platform_user_id is PAGE ID, not user ID
 */

import { supabaseServer } from '../../lib/supabase-server.js';
import { encryptToken } from '../../lib/crypto.js';
import { getAuth } from '@clerk/nextjs/server';

const META_CLIENT_ID = process.env.META_CLIENT_ID;
const META_CLIENT_SECRET = process.env.META_CLIENT_SECRET;
const META_REDIRECT_URI = process.env.META_REDIRECT_URI;
const APP_ORIGIN = process.env.ORIGIN;

if (!META_CLIENT_ID || !META_CLIENT_SECRET || !META_REDIRECT_URI) {
  throw new Error('Missing Meta OAuth configuration');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state, error, page_id } = req.query;

  // Handle OAuth errors
  if (error) {
    console.error('Meta OAuth error:', error);
    return res.redirect(302, `${APP_ORIGIN}/Account?error=oauth_failed`);
  }

  // Validate required params
  if (!code || !state) {
    return res.redirect(302, `${APP_ORIGIN}/Account?error=invalid_request`);
  }

  try {
    // Verify state (CSRF protection)
    const cookies = parseCookies(req.headers.cookie);
    const storedState = cookies.meta_oauth_state;

    if (!storedState || storedState !== state) {
      return res.redirect(302, `${APP_ORIGIN}/Account?error=state_mismatch`);
    }

    // Get authenticated user from Clerk
    const { userId } = getAuth(req);
    if (!userId) {
      return res.redirect(302, `${APP_ORIGIN}/signin?redirect=/Account`);
    }

    // Exchange code for user access token
    const tokenResponse = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      url: `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${META_CLIENT_ID}&client_secret=${META_CLIENT_SECRET}&redirect_uri=${META_REDIRECT_URI}&code=${code}`
    });

    // Construct URL manually for GET request
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${META_CLIENT_ID}&client_secret=${META_CLIENT_SECRET}&redirect_uri=${encodeURIComponent(META_REDIRECT_URI)}&code=${code}`;

    const tokenFetchResponse = await fetch(tokenUrl);

    if (!tokenFetchResponse.ok) {
      const errorData = await tokenFetchResponse.text();
      console.error('Meta token exchange failed:', errorData);
      return res.redirect(302, `${APP_ORIGIN}/Account?error=token_exchange_failed`);
    }

    const tokenData = await tokenFetchResponse.json();
    const { access_token } = tokenData;

    // Fetch user's managed pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${access_token}`
    );

    if (!pagesResponse.ok) {
      console.error('Meta pages fetch failed');
      return res.redirect(302, `${APP_ORIGIN}/Account?error=pages_fetch_failed`);
    }

    const pagesData = await pagesResponse.json();
    const pages = pagesData.data;

    if (!pages || pages.length === 0) {
      return res.redirect(302, `${APP_ORIGIN}/Account?error=no_pages_found`);
    }

    // If page_id is specified in query (user already selected), use it
    // Otherwise, if only one page exists, auto-select it
    // Otherwise, redirect to page selection UI
    let selectedPage;

    if (page_id) {
      selectedPage = pages.find(p => p.id === page_id);
      if (!selectedPage) {
        return res.redirect(302, `${APP_ORIGIN}/Account?error=invalid_page`);
      }
    } else if (pages.length === 1) {
      selectedPage = pages[0];
    } else {
      // Multiple pages - need user to select
      // Store pages in session/cookie and redirect to selection page
      // For v1, auto-select first page (TODO: build selection UI)
      selectedPage = pages[0];
      console.warn('Multiple pages found, auto-selecting first:', selectedPage.name);
    }

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

    // Encrypt page access token (NOT user access token)
    const encryptedPageToken = encryptToken(selectedPage.access_token);

    // Store PAGE credentials in social_accounts
    // CRITICAL: platform_user_id is PAGE ID, not user ID
    const { error: insertError } = await supabaseServer
      .from('social_accounts')
      .upsert({
        organization_id: user.organization_id,
        platform: 'meta',
        platform_user_id: selectedPage.id, // PAGE ID
        platform_username: selectedPage.name, // PAGE NAME
        access_token: encryptedPageToken, // PAGE ACCESS TOKEN
        refresh_token: null, // Meta page tokens don't have refresh tokens
        token_expires_at: null, // Page tokens are long-lived
        is_active: true,
        connected_at: new Date().toISOString()
      }, {
        onConflict: 'organization_id,platform,platform_user_id'
      });

    if (insertError) {
      console.error('Failed to store Meta credentials:', insertError);
      return res.redirect(302, `${APP_ORIGIN}/Account?error=storage_failed`);
    }

    // Clear state cookie
    res.setHeader('Set-Cookie', 'meta_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');

    // Redirect to Account with success
    return res.redirect(302, `${APP_ORIGIN}/Account?connected=meta`);

  } catch (error) {
    console.error('Meta OAuth callback error:', error);
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
