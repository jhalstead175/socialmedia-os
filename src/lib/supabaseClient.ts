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

/* =====================================================================
 * Email Campaigns module
 * Mirrors supabase/migrations/20260608000400_email_campaigns.sql
 * ===================================================================== */

export type EmailBlockType =
  | 'heading' | 'text' | 'button' | 'image' | 'divider' | 'spacer';

export type EmailBlock = {
  id: string;
  type: EmailBlockType;
  text?: string;          // heading/text/button label
  url?: string;           // button href / image src
  alt?: string;           // image alt
  level?: 1 | 2 | 3;      // heading level
  align?: 'left' | 'center' | 'right';
};

export type EmailSendingDomain = {
  id: string;
  organization_id: string;
  domain: string;
  resend_domain_id: string | null;
  status: 'pending' | 'verifying' | 'verified' | 'failed' | 'disabled';
  dns_records: Array<{
    type: string; name: string; value: string; priority?: number; status?: string;
  }>;
  region: string | null;
  is_shared: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EmailContact = {
  id: string;
  organization_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  tags: string[];
  custom_fields: Record<string, unknown>;
  consent_status: 'subscribed' | 'unsubscribed' | 'pending' | 'cleaned' | 'complained';
  consent_source: string | null;
  consent_at: string | null;
  consent_ip: string | null;
  consent_user_agent: string | null;
  unsubscribed_at: string | null;
  last_emailed_at: string | null;
  last_opened_at: string | null;
  last_clicked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EmailSegment = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  definition: { match: 'all' | 'any'; rules: Array<Record<string, unknown>> };
  member_count: number;
  last_refreshed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EmailTemplate = {
  id: string;
  organization_id: string;
  name: string;
  category: string | null;
  subject: string | null;
  preview_text: string | null;
  blocks: EmailBlock[];
  is_system: boolean;
  thumbnail_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type EmailCampaignStatus =
  | 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed' | 'canceled';

export type EmailCampaign = {
  id: string;
  organization_id: string;
  name: string;
  subject: string | null;
  preview_text: string | null;
  from_name: string | null;
  from_email: string | null;
  reply_to: string | null;
  sending_domain_id: string | null;
  template_id: string | null;
  blocks: EmailBlock[];
  html_cache: string | null;
  segment_id: string | null;
  target_all: boolean;
  status: EmailCampaignStatus;
  scheduled_at: string | null;
  send_started_at: string | null;
  sent_at: string | null;
  recipient_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  complained_count: number;
  unsubscribed_count: number;
  failed_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type EmailCampaignRecipient = {
  id: string;
  organization_id: string;
  campaign_id: string;
  contact_id: string;
  email: string;
  status:
    | 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked'
    | 'bounced' | 'complained' | 'unsubscribed' | 'failed' | 'skipped';
  resend_message_id: string | null;
  error: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  first_opened_at: string | null;
  first_clicked_at: string | null;
  open_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
};

export type EmailSuppression = {
  id: string;
  organization_id: string;
  email: string;
  reason: 'unsubscribed' | 'hard_bounce' | 'complained' | 'manual';
  source_campaign_id: string | null;
  created_at: string;
};
