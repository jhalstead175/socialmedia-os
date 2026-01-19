/**
 * Supabase Client for SoshlOps
 *
 * ⚠️ IMPORTANT: This is the UNAUTHENTICATED client
 * - Only use for public data or Edge Function invocations
 * - For authenticated queries, use useSupabaseClient() hook instead
 *
 * Auth Strategy:
 * - Clerk handles authentication
 * - Supabase handles data + RLS
 * - JWT from Clerk must be passed for RLS to work
 *
 * Migration guide:
 * - OLD: import { supabase } from '@/lib/supabaseClient';
 * - NEW: import { useSupabaseClient } from '@/hooks/useSupabaseClient';
 *         const supabase = useSupabaseClient();
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable Supabase Auth (we use Clerk)
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

/**
 * Database Types (minimal for v1)
 */
export type Organization = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  organization_id: string;
  clerk_user_id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

export type SocialAccount = {
  id: string;
  organization_id: string;
  platform: 'x' | 'linkedin' | 'meta';
  platform_user_id: string;
  platform_username: string | null;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  is_active: boolean;
  connected_at: string;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  organization_id: string;
  author_id: string;
  content: string;
  media_urls: string[] | null;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_at: string | null;
  published_at: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type PostPlatform = {
  id: string;
  post_id: string;
  social_account_id: string;
  platform: 'x' | 'linkedin' | 'meta';
  platform_post_id: string | null;
  status: 'pending' | 'published' | 'failed';
  published_at: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type AnalyticsSnapshot = {
  id: string;
  organization_id: string;
  post_platform_id: string;
  snapshot_date: string;
  impressions: number;
  engagements: number;
  clicks: number;
  shares: number;
  created_at: string;
};

export type InboxItem = {
  id: string;
  organization_id: string;
  social_account_id: string;
  platform: 'x' | 'linkedin' | 'meta';
  item_type: 'mention' | 'comment' | 'dm';
  platform_item_id: string;
  author_name: string | null;
  author_handle: string | null;
  content: string | null;
  is_read: boolean;
  received_at: string;
  created_at: string;
};

export type Asset = {
  id: string;
  organization_id: string;
  uploader_id: string;
  file_name: string;
  file_type: 'image' | 'video' | 'document';
  file_size_bytes: number;
  storage_path: string;
  mime_type: string;
  created_at: string;
};
