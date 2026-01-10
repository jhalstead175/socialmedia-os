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
    // Get OAuth parameters from request body (called from frontend)
    const { code, state, userId } = await req.json();

    if (!code || !state) {
      return new Response(
        JSON.stringify({ error: 'invalid_request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decode and verify state
    let stateNonce: string;
    try {
      const decoded = JSON.parse(atob(state));
      stateNonce = decoded.nonce;
      // Verify userId matches the one in state
      if (decoded.userId !== userId) {
        console.error('User ID mismatch between state and request');
        return new Response(
          JSON.stringify({ error: 'state_mismatch' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (e) {
      console.error('Invalid state format:', e);
      return new Response(
        JSON.stringify({ error: 'state_mismatch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'user_id_required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      return new Response(
        JSON.stringify({ error: 'token_exchange_failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, expires_in } = tokenData;

    console.log('Token exchange successful, token length:', access_token?.length);

    if (!access_token) {
      console.error('Access token is null or undefined');
      return new Response(
        JSON.stringify({ error: 'token_exchange_failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      return new Response(
        JSON.stringify({ error: 'profile_fetch_failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      return new Response(
        JSON.stringify({ error: 'user_not_found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      return new Response(
        JSON.stringify({ error: 'storage_failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Success! Return success response
    return new Response(
      JSON.stringify({ success: true, platform: 'linkedin', username: displayName }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error);
    return new Response(
      JSON.stringify({ error: 'unexpected_error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
