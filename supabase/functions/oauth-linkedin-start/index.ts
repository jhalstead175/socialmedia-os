/**
 * LinkedIn OAuth Start - Supabase Edge Function
 *
 * Initiates OAuth flow by redirecting to LinkedIn authorization page
 */

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LINKEDIN_CLIENT_ID = Deno.env.get('LINKEDIN_CLIENT_ID');
const LINKEDIN_REDIRECT_URI = Deno.env.get('LINKEDIN_REDIRECT_URI');

if (!LINKEDIN_CLIENT_ID || !LINKEDIN_REDIRECT_URI) {
  throw new Error('Missing LinkedIn OAuth configuration');
}

const SCOPES = ['profile', 'email', 'w_member_social'];

serve(async (req: Request) => {
  // CORS headers - allow all origins for OAuth redirect
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate CSRF nonce
    const nonceBytes = new Uint8Array(16);
    crypto.getRandomValues(nonceBytes);
    const nonce = Array.from(nonceBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Encode state with user ID and nonce
    const state = btoa(JSON.stringify({ nonce, userId }));

    // Build LinkedIn authorization URL
    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', LINKEDIN_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', LINKEDIN_REDIRECT_URI);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', SCOPES.join(' '));

    // Set nonce cookie for CSRF verification
    const headers = new Headers({
      ...corsHeaders,
      'Location': authUrl.toString(),
      'Set-Cookie': `linkedin_oauth_nonce=${nonce}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    });

    return new Response(null, {
      status: 302,
      headers,
    });

  } catch (error) {
    console.error('LinkedIn OAuth start error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to initiate OAuth' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
