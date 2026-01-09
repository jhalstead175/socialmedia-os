/**
 * SoshlOps Scheduler Worker (Edge Function)
 *
 * Purpose: Publish scheduled posts when their time arrives.
 *
 * Execution: Every minute via Supabase Cron
 * Model: Stateless, idempotent, one pass per run
 *
 * What it does:
 * 1. Fetch posts where status='scheduled' and scheduled_at <= now()
 * 2. For each post, attempt to publish to each platform
 * 3. Record success or failure
 * 4. Update post and platform statuses
 *
 * What it does NOT do (v1):
 * - No retries
 * - No analytics fetch
 * - No optimization
 * - No intelligence
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

serve(async () => {
  const now = new Date().toISOString();

  try {
    // 1. Fetch due posts
    const { data: posts, error: fetchError } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        media_urls,
        post_platforms (
          id,
          platform,
          social_account_id
        )
      `)
      .eq("status", "scheduled")
      .lte("scheduled_at", now);

    if (fetchError) {
      console.error("Failed to fetch scheduled posts:", fetchError);
      return new Response("Error", { status: 500 });
    }

    if (!posts || posts.length === 0) {
      return new Response("No posts", { status: 200 });
    }

    console.log(`Processing ${posts.length} scheduled posts`);

    // 2. Process each post
    for (const post of posts) {
      let anySuccess = false;

      // 3. Process each platform for this post
      for (const platform of post.post_platforms) {
        try {
          let platformPostId;

          // Platform-specific publish logic
          switch (platform.platform) {
            case "linkedin":
              platformPostId = await publishToLinkedIn(post, platform);
              break;
            case "x":
              platformPostId = await publishToX(post, platform);
              break;
            case "meta":
              platformPostId = await publishToMeta(post, platform);
              break;
            default:
              throw new Error(`Platform ${platform.platform} not implemented`);
          }

          // Record success
          await supabase
            .from("post_platforms")
            .update({
              status: "published",
              published_at: new Date().toISOString(),
              platform_post_id: platformPostId
            })
            .eq("id", platform.id);

          anySuccess = true;
          console.log(`Published post ${post.id} to ${platform.platform}`)
        } catch (err: any) {
          // Record failure
          await supabase
            .from("post_platforms")
            .update({
              status: "failed",
              failure_reason: err.message || "Unknown error"
            })
            .eq("id", platform.id);

          console.error(`Failed to publish post ${post.id} to ${platform.platform}:`, err);
        }
      }

      // 4. Update post status
      await supabase
        .from("posts")
        .update({
          status: anySuccess ? "published" : "failed",
          published_at: anySuccess ? new Date().toISOString() : null
        })
        .eq("id", post.id);
    }

    return new Response("OK", { status: 200 });

  } catch (err: any) {
    console.error("Scheduler worker error:", err);
    return new Response("Error", { status: 500 });
  }
});

/**
 * Publish to LinkedIn
 *
 * v1: Text-only posts (no media)
 * Fetches access token, calls LinkedIn UGC API
 *
 * @param post - Post data from database
 * @param platform - Platform configuration
 * @returns LinkedIn post ID
 */
async function publishToLinkedIn(post: any, platform: any): Promise<string> {
  // 1. Fetch social account with access token
  const { data: account, error: accountError } = await supabase
    .from("social_accounts")
    .select("access_token, platform_user_id")
    .eq("id", platform.social_account_id)
    .single();

  if (accountError || !account) {
    throw new Error("Social account not found");
  }

  // TODO: Decrypt access_token if encryption is implemented
  // For v1, assuming tokens are stored as-is (will be encrypted later)
  const accessToken = account.access_token;

  // 2. Call LinkedIn UGC Posts API
  // https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/ugc-post-api
  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0"
    },
    body: JSON.stringify({
      author: `urn:li:person:${account.platform_user_id}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: post.content
          },
          shareMediaCategory: "NONE" // v1: text-only
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("LinkedIn API error:", errorText);
    throw new Error(`LinkedIn publish failed: ${response.status}`);
  }

  const responseData = await response.json();
  const postId = responseData.id;

  return postId;
}

/**
 * Publish to X (Twitter)
 *
 * v1: Text-only posts (no media, no threads)
 * Uses Twitter API v2
 *
 * @param post - Post data from database
 * @param platform - Platform configuration
 * @returns X tweet ID
 */
async function publishToX(post: any, platform: any): Promise<string> {
  // 1. Fetch social account with access token
  const { data: account, error: accountError } = await supabase
    .from("social_accounts")
    .select("access_token")
    .eq("id", platform.social_account_id)
    .single();

  if (accountError || !account) {
    throw new Error("Social account not found");
  }

  // TODO: Decrypt access_token if encryption is implemented
  const accessToken = account.access_token;

  // 2. Call Twitter API v2 (create tweet)
  const response = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: post.content
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("X API error:", errorText);
    throw new Error(`X publish failed: ${response.status}`);
  }

  const responseData = await response.json();
  const tweetId = responseData.data.id;

  return tweetId;
}

/**
 * Publish to Meta (Facebook)
 *
 * v1: Facebook Pages only, text-only posts (no media, no Instagram)
 * Uses Graph API v19.0
 *
 * @param post - Post data from database
 * @param platform - Platform configuration (platform_user_id is PAGE ID)
 * @returns Facebook post ID
 */
async function publishToMeta(post: any, platform: any): Promise<string> {
  // 1. Fetch social account with page access token
  const { data: account, error: accountError } = await supabase
    .from("social_accounts")
    .select("access_token, platform_user_id")
    .eq("id", platform.social_account_id)
    .single();

  if (accountError || !account) {
    throw new Error("Social account not found");
  }

  // TODO: Decrypt access_token if encryption is implemented
  const pageAccessToken = account.access_token;
  const pageId = account.platform_user_id; // IMPORTANT: This is PAGE ID, not user ID

  // 2. Call Facebook Graph API (publish to page feed)
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}/feed`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${pageAccessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: post.content
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Meta API error:", errorText);
    throw new Error(`Meta publish failed: ${response.status}`);
  }

  const responseData = await response.json();
  const postId = responseData.id;

  return postId;
}
