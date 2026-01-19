/**
 * LinkedIn OAuth Callback - Supabase Edge Function
 *
 * Handles OAuth callback, exchanges code for token, stores credentials
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LINKEDIN_CLIENT_ID = Deno.env.get('LINKEDIN_CLIENT_ID')!;
const LINKEDIN_CLIENT_SECRET = Deno.env.get('LINKEDIN_CLIENT_SECRET')!;
const LINKEDIN_REDIRECT_URI = Deno.env.get('LINKEDIN_REDIRECT_URI')!;
const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY')!;
const APP_ORIGIN = Deno.env.get('APP_ORIGIN') || 'https://soshlops.vercel.app';

// Initialize Supabase client (use Supabase built-in env vars)
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS headers for OAuth callback
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Encrypt token using AES-256-GCM
 */
async function encryptToken(plaintext: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(ENCRYPTION_KEY.slice(0, 32)); // Use first 32 chars as key

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );

  // Combine IV and ciphertext
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Return as base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Parse cookies from header
 */
function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader
    .split(';')
    .map(cookie => cookie.trim().split('='))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get OAuth parameters from URL (GET request from LinkedIn)
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
      return Response.redirect(`${APP_ORIGIN}/Account?error=missing_code_or_state`, 302);
    }

    // Decode and verify state - extract userId from state
    let userId: string;
    let stateNonce: string;
    try {
      const decoded = JSON.parse(atob(state));
      userId = decoded.userId;
      stateNonce = decoded.nonce;

      if (!userId) {
        console.error('User ID missing in state');
        return Response.redirect(`${APP_ORIGIN}/Account?error=invalid_state`, 302);
      }

      if (!stateNonce) {
        console.error('Nonce missing in state');
        return Response.redirect(`${APP_ORIGIN}/Account?error=invalid_state`, 302);
      }
    } catch (e) {
      console.error('Invalid state format:', e);
      return Response.redirect(`${APP_ORIGIN}/Account?error=state_mismatch`, 302);
    }

    // Verify nonce matches cookie (CSRF protection)
    const cookies = parseCookies(req.headers.get('Cookie'));
    const cookieNonce = cookies['linkedin_oauth_nonce'];

    if (!cookieNonce || cookieNonce !== stateNonce) {
      console.error('Nonce mismatch - CSRF attempt detected', {
        cookieNonce,
        stateNonce,
      });
      return Response.redirect(`${APP_ORIGIN}/Account?error=state_mismatch`, 302);
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
        client_secret: LINKEDIN_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('LinkedIn token exchange failed:', errorText);
      return Response.redirect(`${APP_ORIGIN}/Account?error=token_exchange_failed`, 302);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, expires_in } = tokenData;

    console.log('Token exchange successful, token length:', access_token?.length);

    if (!access_token) {
      console.error('Access token is null or undefined');
      return Response.redirect(`${APP_ORIGIN}/Account?error=token_exchange_failed`, 302);
    }

    // Fetch LinkedIn profile using v2 API (works with 'profile' scope)
    console.log('Fetching LinkedIn profile with token:', access_token.substring(0, 20) + '...');
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('LinkedIn profile fetch failed:', errorText);
      return Response.redirect(`${APP_ORIGIN}/Account?error=profile_fetch_failed`, 302);
    }

    const profileData = await profileResponse.json();
    const linkedinUserId = profileData.id;
    const displayName = `${profileData.localizedFirstName || ''} ${profileData.localizedLastName || ''}`.trim() || 'LinkedIn User';

    // Get user's org from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !user) {
      console.error('User not found in database:', userError);
      return Response.redirect(`${APP_ORIGIN}/Account?error=user_not_found`, 302);
    }

    // Encrypt access token
    const encryptedToken = await encryptToken(access_token);

    // Calculate token expiry
    const expiresAt = new Date(Date.now() + (expires_in * 1000)).toISOString();

    // Store in social_accounts table
    const { error: insertError } = await supabase
      .from('social_accounts')
      .upsert({
        organization_id: user.organization_id,
        platform: 'linkedin',
        platform_user_id: linkedinUserId,
        platform_username: displayName,
        access_token: encryptedToken,
        refresh_token: null,
        token_expires_at: expiresAt,
        is_active: true,
        connected_at: new Date().toISOString(),
      }, {
        onConflict: 'organization_id,platform,platform_user_id',
      });

    if (insertError) {
      console.error('Failed to store LinkedIn credentials:', insertError);
      return Response.redirect(`${APP_ORIGIN}/Account?error=storage_failed`, 302);
    }

    // Success! Redirect back to app
    return Response.redirect(`${APP_ORIGIN}/Account?connected=linkedin`, 302);

  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error);
    return Response.redirect(`${APP_ORIGIN}/Account?error=unexpected_error`, 302);
  }
});
