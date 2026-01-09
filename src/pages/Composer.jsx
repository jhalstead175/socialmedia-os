import React, { useState, useEffect } from 'react';
import { PenTool, Image, Hash, Calendar, Send, AlertCircle, X as CloseIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ConnectAccountModal from '../components/ConnectAccountModal';
import { useDemoMode, demoData, useDemoAction } from '../hooks/useDemoMode';
import { emit, NAV_EVENTS, ACTION_EVENTS, GATE_EVENTS } from '@/utils/telemetry';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/hooks/useUserSafe';
import { toast } from 'sonner';

export default function Composer() {
  const isDemoMode = useDemoMode();
  const { handleAction } = useDemoAction();
  const { user: clerkUser } = useUser();

  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState({ x: false, linkedin: false, meta: false });
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const platforms = [
    { id: 'x', name: 'X' },
    { id: 'linkedin', name: 'LinkedIn' },
    { id: 'meta', name: 'Meta' }
  ];

  useEffect(() => {
    emit(NAV_EVENTS.COMPOSER_OPENED);
  }, []);

  // Load connected accounts from Supabase (real mode only)
  useEffect(() => {
    async function loadConnectedAccounts() {
      if (isDemoMode || !clerkUser) {
        // Demo mode - use mock data
        setConnectedAccounts(demoData.connectedAccounts);
        return;
      }

      try {
        const { data: accounts, error } = await supabase
          .from('social_accounts')
          .select('id, platform, is_active, platform_username')
          .eq('is_active', true);

        if (error) {
          console.error('Failed to load connected accounts:', error);
          return;
        }

        const accountsMap = { x: false, linkedin: false, meta: false };
        accounts?.forEach(account => {
          accountsMap[account.platform] = true;
        });

        setConnectedAccounts(accountsMap);
        setSocialAccounts(accounts || []);
      } catch (err) {
        console.error('Error loading accounts:', err);
      }
    }

    loadConnectedAccounts();
  }, [clerkUser, isDemoMode]);

  const handlePlatformToggle = (platformId) => {
    if (!connectedAccounts[platformId]) {
      emit(GATE_EVENTS.OAUTH_REQUIRED_ENCOUNTERED);
      setSelectedPlatform(platformId);
      setShowConnectModal(true);
      return;
    }

    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const hasAnyConnection = Object.values(connectedAccounts).some(connected => connected);
  const canPublish = selectedPlatforms.length > 0 && content.trim().length > 0;

  // Plan limits (v1: simple hard blocks)
  const PLAN_LIMITS = {
    MAX_SCHEDULED_POSTS: 50 // v1: generous limit, adjust per plan later
  };

  const checkScheduledPostsLimit = async () => {
    if (isDemoMode || !clerkUser) return true;

    try {
      const { data: user } = await supabase
        .from('users')
        .select('organization_id')
        .eq('clerk_user_id', clerkUser.id)
        .single();

      if (!user) return false;

      const { count } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', user.organization_id)
        .eq('status', 'scheduled');

      if (count >= PLAN_LIMITS.MAX_SCHEDULED_POSTS) {
        toast.error(`Maximum of ${PLAN_LIMITS.MAX_SCHEDULED_POSTS} scheduled posts reached`);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error checking limits:', err);
      return true; // Allow on error (fail open)
    }
  };

  const handleSaveDraft = async () => {
    if (isDemoMode) {
      emit(ACTION_EVENTS.DRAFT_SAVE_ATTEMPTED);
      const feedback = handleAction('save');
      if (feedback) toast.info(feedback);
      return;
    }

    if (!canPublish) {
      toast.error('Please select a platform and add content');
      return;
    }

    setLoading(true);
    try {
      emit(ACTION_EVENTS.DRAFT_SAVE_ATTEMPTED);

      // 1. Get user and org
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, organization_id')
        .eq('clerk_user_id', clerkUser.id)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      // 2. Create post as draft
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          organization_id: user.organization_id,
          author_id: user.id,
          content: content.trim(),
          media_urls: [],
          status: 'draft'
        })
        .select('id')
        .single();

      if (postError) throw postError;

      // 3. Link to selected platforms
      for (const platformId of selectedPlatforms) {
        const account = socialAccounts.find(a => a.platform === platformId);
        if (!account) continue;

        await supabase.from('post_platforms').insert({
          post_id: post.id,
          social_account_id: account.id,
          platform: platformId,
          status: 'pending'
        });
      }

      toast.success('Draft saved successfully');
      setContent('');
      setSelectedPlatforms([]);

    } catch (err) {
      console.error('Failed to save draft:', err);
      toast.error('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishNow = async () => {
    if (isDemoMode) {
      emit(ACTION_EVENTS.PUBLISH_ATTEMPTED);
      const feedback = handleAction('publish');
      if (feedback) toast.info(feedback);
      return;
    }

    if (!canPublish) {
      toast.error('Please select a platform and add content');
      return;
    }

    // Check limits before scheduling
    const withinLimits = await checkScheduledPostsLimit();
    if (!withinLimits) return;

    setLoading(true);
    try {
      emit(ACTION_EVENTS.PUBLISH_ATTEMPTED);

      // 1. Get user and org
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, organization_id')
        .eq('clerk_user_id', clerkUser.id)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      // 2. Create post scheduled for immediate publish
      const now = new Date().toISOString();
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          organization_id: user.organization_id,
          author_id: user.id,
          content: content.trim(),
          media_urls: [],
          status: 'scheduled',
          scheduled_at: now
        })
        .select('id')
        .single();

      if (postError) throw postError;

      // 3. Link to selected platforms
      for (const platformId of selectedPlatforms) {
        const account = socialAccounts.find(a => a.platform === platformId);
        if (!account) continue;

        await supabase.from('post_platforms').insert({
          post_id: post.id,
          social_account_id: account.id,
          platform: platformId,
          status: 'pending'
        });
      }

      toast.success('Post scheduled for immediate publish. Scheduler will process it within 1 minute.');
      setContent('');
      setSelectedPlatforms([]);

    } catch (err) {
      console.error('Failed to publish:', err);
      toast.error('Failed to schedule post');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePost = async () => {
    if (isDemoMode) {
      toast.info('Schedule set (demo mode)');
      setShowSchedulePicker(false);
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error('Please select both date and time');
      return;
    }

    if (!canPublish) {
      toast.error('Please select a platform and add content');
      return;
    }

    // Check limits before scheduling
    const withinLimits = await checkScheduledPostsLimit();
    if (!withinLimits) return;

    setLoading(true);
    try {
      // 1. Get user and org
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, organization_id')
        .eq('clerk_user_id', clerkUser.id)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      // 2. Parse scheduled datetime
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

      // 3. Create scheduled post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          organization_id: user.organization_id,
          author_id: user.id,
          content: content.trim(),
          media_urls: [],
          status: 'scheduled',
          scheduled_at: scheduledAt
        })
        .select('id')
        .single();

      if (postError) throw postError;

      // 4. Link to selected platforms
      for (const platformId of selectedPlatforms) {
        const account = socialAccounts.find(a => a.platform === platformId);
        if (!account) continue;

        await supabase.from('post_platforms').insert({
          post_id: post.id,
          social_account_id: account.id,
          platform: platformId,
          status: 'pending'
        });
      }

      toast.success(`Post scheduled for ${new Date(scheduledAt).toLocaleString()}`);
      setContent('');
      setSelectedPlatforms([]);
      setShowSchedulePicker(false);
      setScheduledDate('');
      setScheduledTime('');

    } catch (err) {
      console.error('Failed to schedule post:', err);
      toast.error('Failed to schedule post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="container-7xl py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="h1" style={{ color: 'var(--text-100)' }}>
              Composer
            </h1>
            <p className="lead mt-2">
              Create and schedule posts across platforms
            </p>
          </div>

          {/* No Accounts Warning */}
          {!hasAnyConnection && !isDemoMode && (
            <div
              className="card mb-6"
              style={{
                padding: 'var(--s-4)',
                background: 'var(--surf-2)',
                border: '1px solid var(--bd-weak)'
              }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: 'var(--text-60)' }} />
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-100)' }}>
                    Connect an account
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-60)' }}>
                    Authorization required to publish
                  </div>
                </div>
                <Link to={createPageUrl("Account")}>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Main Composer Card */}
          <div className="card" style={{ padding: 'var(--s-8)' }}>
            {/* Platform Selection */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-80)' }}>
                Select Platforms
              </label>
              <div className="flex gap-3">
                {platforms.map((platform) => {
                  const isConnected = connectedAccounts[platform.id];
                  const isSelected = selectedPlatforms.includes(platform.id);

                  return (
                    <Tooltip key={platform.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handlePlatformToggle(platform.id)}
                          disabled={!isConnected}
                          className="btn btn-outline"
                          style={{
                            background: isSelected ? 'var(--surf-3)' : 'var(--surf-1)',
                            borderColor: isSelected ? 'var(--bd-strong)' : 'var(--bd-weak)',
                            opacity: isConnected ? 1 : 0.5,
                            cursor: isConnected ? 'pointer' : 'not-allowed'
                          }}
                          aria-label={isConnected ? `Toggle ${platform.name}` : `Connect ${platform.name} account to publish`}
                        >
                          {platform.name}
                        </button>
                      </TooltipTrigger>
                      {!isConnected && (
                        <TooltipContent>
                          <p>Connect account to publish</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="mb-6">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full"
                disabled={!hasAnyConnection}
                style={{
                  background: 'var(--surf-1)',
                  borderColor: 'var(--bd-weak)',
                  color: 'var(--text-100)',
                  fontSize: 'var(--fs-md)',
                  padding: 'var(--s-4)',
                  borderRadius: 'var(--r-lg)',
                  opacity: hasAnyConnection ? 1 : 0.5
                }}
                aria-label="Post content"
              />
              <div className="text-sm mt-2" style={{ color: 'var(--text-60)' }}>
                {content.length} characters
              </div>
            </div>

            {/* Schedule Picker (Inline) */}
            {showSchedulePicker && (
              <div
                className="mb-6 p-4"
                style={{
                  background: 'var(--surf-2)',
                  borderRadius: 'var(--r-lg)',
                  border: '1px solid var(--bd-weak)'
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-100)' }}>
                    Schedule for later
                  </div>
                  <button
                    onClick={() => setShowSchedulePicker(false)}
                    className="text-sm"
                    style={{ color: 'var(--text-60)' }}
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs mb-1 block" style={{ color: 'var(--text-70)' }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 rounded"
                      style={{
                        background: 'var(--surf-1)',
                        border: '1px solid var(--bd-weak)',
                        color: 'var(--text-100)'
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs mb-1 block" style={{ color: 'var(--text-70)' }}>
                      Time
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 rounded"
                      style={{
                        background: 'var(--surf-1)',
                        border: '1px solid var(--bd-weak)',
                        color: 'var(--text-100)'
                      }}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleSchedulePost}
                      disabled={loading || !scheduledDate || !scheduledTime || !canPublish}
                    >
                      Set Schedule
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-6" style={{ borderBottom: '1px solid var(--bd-weak)' }}>
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" disabled={!hasAnyConnection}>
                  <Image className="w-4 h-4 mr-2" />
                  Media
                </Button>
                <Button variant="ghost" size="sm" disabled={!hasAnyConnection}>
                  <Hash className="w-4 h-4 mr-2" />
                  Hashtags
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasAnyConnection}
                  onClick={() => setShowSchedulePicker(!showSchedulePicker)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                disabled={!hasAnyConnection || loading}
                onClick={handleSaveDraft}
              >
                Save Draft
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      className="btn-primary"
                      disabled={!canPublish || loading}
                      onClick={handlePublishNow}
                      aria-label={canPublish ? "Publish now" : "Select platform and add content to publish"}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {loading ? 'Publishing...' : 'Publish Now'}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canPublish && hasAnyConnection && (
                  <TooltipContent>
                    <p>Select platform and add content</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 text-sm" style={{ color: 'var(--text-60)' }}>
            <p>✓ Text-only posts (v1)</p>
            <p>✓ Scheduler processes posts every minute</p>
            <p>✓ Drafts saved to your organization</p>
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <ConnectAccountModal
          platform={selectedPlatform}
          onClose={() => setShowConnectModal(false)}
        />
      )}
    </TooltipProvider>
  );
}
