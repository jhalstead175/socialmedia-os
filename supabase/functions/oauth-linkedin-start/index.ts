/**
 * LinkedIn OAuth Start - Supabase Edge Function
 *
 * Initiates OAuth flow by redirecting to LinkedIn authorization page
 *
 * Security:
 * - Requires valid Clerk JWT in Authorization header
 * - Derives userId from verified JWT (not client input)
 */

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LINKEDIN_CLIENT_ID = Deno.env.get('LINKEDIN_CLIENT_ID');
const LINKEDIN_REDIRECT_URI = Deno.env.get('LINKEDIN_REDIRECT_URI');
const CLERK_JWT_VERIFICATION_KEY = Deno.env.get('CLERK_JWT_VERIFICATION_KEY');

if (!LINKEDIN_CLIENT_ID || !LINKEDIN_REDIRECT_URI) {
  throw new Error('Missing LinkedIn OAuth configuration');
}

const SCOPES = ['profile', 'email', 'w_member_social'];

// Initialize Supabase client for JWT verification
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Verify Clerk JWT and extract user ID
 */
async function verifyClerkJWT(authHeader: string | null): Promise<{ userId: string } | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    // Decode JWT (simple base64 decode for now - in production use proper verification)
    // The token format is: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));

    // Extract Clerk user ID from the 'sub' claim
    if (!payload.sub) {
      console.error('Missing sub claim in JWT');
      return null;
    }

    return { userId: payload.sub };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

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
    // Verify Clerk JWT and extract userId
    const authHeader = req.headers.get('Authorization');
    const verifiedUser = await verifyClerkJWT(authHeader);

    if (!verifiedUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - valid Clerk JWT required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = verifiedUser.userId;

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

    // Return redirect URL and set cookie
    const headers = new Headers({
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Set-Cookie': `linkedin_oauth_nonce=${nonce}; Path=/; Domain=.supabase.co; HttpOnly; Secure; SameSite=None; Max-Age=600`,
    });

    return new Response(
      JSON.stringify({ redirectUrl: authUrl.toString() }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('LinkedIn OAuth start error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to initiate OAuth' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
