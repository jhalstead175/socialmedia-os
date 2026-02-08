import React, { useState, useEffect } from 'react';
import { Paperclip, Hash, Clock, Send, Info, X as CloseIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ConnectAccountModal from '../components/ConnectAccountModal';
import { useDemoMode, demoData, useDemoAction } from '../hooks/useDemoMode';
import { emit, NAV_EVENTS, ACTION_EVENTS, GATE_EVENTS } from '@/utils/telemetry';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useUser } from '@/hooks/useUserSafe';
import { toast } from 'sonner';

export default function Composer() {
  const isDemoMode = useDemoMode();
  const { handleAction } = useDemoAction();
  const { user: clerkUser } = useUser();
  const supabase = useSupabaseClient();
  const [searchParams] = useSearchParams();

  // Auto-enable schedule mode if coming from Scheduler
  const isScheduleMode = searchParams.get('mode') === 'schedule';

  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState({ linkedin: false }); // LinkedIn-only MVP
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(isScheduleMode);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // LinkedIn-only MVP
  const platforms = [
    { id: 'linkedin', name: 'LinkedIn' }
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
          toast.error('Failed to load connected accounts');
          return;
        }

        const accountsMap = { linkedin: false };
        const linkedInAccounts = (accounts || []).filter(a => a.platform === 'linkedin');
        linkedInAccounts.forEach(account => {
          accountsMap[account.platform] = true;
        });

        setConnectedAccounts(accountsMap);
        setSocialAccounts(linkedInAccounts);
      } catch (err) {
        console.error('Error loading accounts:', err);
        toast.error('Error loading accounts');
      }
    }

    loadConnectedAccounts();
  }, [clerkUser, isDemoMode, supabase]);

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
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('clerk_user_id', clerkUser.id)
        .single();

      if (userError || !user) {
        console.error('Failed to get user:', userError);
        return true; // Fail open
      }

      const { count, error: countError } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', user.organization_id)
        .eq('status', 'scheduled');

      if (countError) {
        console.error('Failed to check limits:', countError);
        return true; // Fail open
      }

      if (count >= PLAN_LIMITS.MAX_SCHEDULED_POSTS) {
        toast.error(`Maximum of ${PLAN_LIMITS.MAX_SCHEDULED_POSTS} scheduled posts reached`);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error checking limits:', err);
      return true; // Fail open
    }
  };

  const validateContent = () => {
    if (!content.trim()) {
      toast.error('Please add content to your post');
      return false;
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return false;
    }

    // LinkedIn character limit: 3000
    if (content.length > 3000) {
      toast.error('Post exceeds LinkedIn character limit (3000)');
      return false;
    }

    return true;
  };

  const handleSaveDraft = async () => {
    if (isDemoMode) {
      emit(ACTION_EVENTS.DRAFT_SAVE_ATTEMPTED);
      const feedback = handleAction('save');
      if (feedback) toast.info(feedback);
      return;
    }

    if (!validateContent()) return;

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

        const { error: linkError } = await supabase.from('post_platforms').insert({
          post_id: post.id,
          social_account_id: account.id,
          platform: platformId,
          status: 'pending'
        });

        if (linkError) {
          console.error('Failed to link platform:', linkError);
        }
      }

      toast.success('Draft saved successfully');
      setContent('');
      setSelectedPlatforms([]);

    } catch (err) {
      console.error('Failed to save draft:', err);
      toast.error(err.message || 'Failed to save draft');
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

    if (!validateContent()) return;

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

        const { error: linkError } = await supabase.from('post_platforms').insert({
          post_id: post.id,
          social_account_id: account.id,
          platform: platformId,
          status: 'pending'
        });

        if (linkError) {
          console.error('Failed to link platform:', linkError);
        }
      }

      toast.success('Post scheduled for immediate publishing');
      setContent('');
      setSelectedPlatforms([]);

    } catch (err) {
      console.error('Failed to publish:', err);
      toast.error(err.message || 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (isDemoMode) {
      emit(ACTION_EVENTS.SCHEDULE_ATTEMPTED);
      const feedback = handleAction('schedule');
      if (feedback) toast.info(feedback);
      return;
    }

    if (!validateContent()) return;

    if (!scheduledDate || !scheduledTime) {
      toast.error('Please select a date and time');
      return;
    }

    // Check limits before scheduling
    const withinLimits = await checkScheduledPostsLimit();
    if (!withinLimits) return;

    setLoading(true);
    try {
      emit(ACTION_EVENTS.SCHEDULE_ATTEMPTED);

      // 1. Get user and org
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, organization_id')
        .eq('clerk_user_id', clerkUser.id)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      // 2. Combine date and time
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      
      // Validate future date
      if (scheduledDateTime <= new Date()) {
        toast.error('Scheduled time must be in the future');
        setLoading(false);
        return;
      }

      // 3. Create scheduled post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          organization_id: user.organization_id,
          author_id: user.id,
          content: content.trim(),
          media_urls: [],
          status: 'scheduled',
          scheduled_at: scheduledDateTime.toISOString()
        })
        .select('id')
        .single();

      if (postError) throw postError;

      // 4. Link to selected platforms
      for (const platformId of selectedPlatforms) {
        const account = socialAccounts.find(a => a.platform === platformId);
        if (!account) continue;

        const { error: linkError } = await supabase.from('post_platforms').insert({
          post_id: post.id,
          social_account_id: account.id,
          platform: platformId,
          status: 'pending'
        });

        if (linkError) {
          console.error('Failed to link platform:', linkError);
        }
      }

      toast.success(`Post scheduled for ${scheduledDateTime.toLocaleString()}`);
      setContent('');
      setSelectedPlatforms([]);
      setScheduledDate('');
      setScheduledTime('');
      setShowSchedulePicker(false);

    } catch (err) {
      console.error('Failed to schedule post:', err);
      toast.error(err.message || 'Failed to schedule post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="container-7xl py-8 px-4">
        <ConnectAccountModal
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          platform={selectedPlatform}
        />

        {/* Header */}
        <div className="mb-8">
          <h1 className="h1" style={{ color: 'var(--text-100)' }}>
            Composer
          </h1>
          <p className="lead mt-2">
            Create and schedule posts across your connected accounts
          </p>
        </div>

        {/* Main Composer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Content Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card" style={{ padding: 'var(--s-6)' }}>
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] resize-none border-0 focus-visible:ring-0 text-base"
                style={{
                  background: 'transparent',
                  color: 'var(--text-100)'
                }}
                disabled={loading}
              />

              <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: 'var(--bd-weak)' }}>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" disabled style={{ cursor: 'not-allowed', opacity: 0.5 }}>
                        <Paperclip className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Media upload (v1.1)</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" disabled style={{ cursor: 'not-allowed', opacity: 0.5 }}>
                        <Hash className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Hashtag suggestions (v1.1)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="text-sm" style={{ color: 'var(--text-60)' }}>
                  {content.length} / 3000
                </div>
              </div>
            </div>

            {/* Schedule Picker */}
            {showSchedulePicker && (
              <div className="card" style={{ padding: 'var(--s-6)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold" style={{ color: 'var(--text-100)' }}>
                    Schedule Post
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSchedulePicker(false)}
                    disabled={loading}
                  >
                    <CloseIcon className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-80)' }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 rounded-lg border"
                      style={{
                        background: 'var(--surf-2)',
                        borderColor: 'var(--bd-weak)',
                        color: 'var(--text-100)'
                      }}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-80)' }}>
                      Time
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border"
                      style={{
                        background: 'var(--surf-2)',
                        borderColor: 'var(--bd-weak)',
                        color: 'var(--text-100)'
                      }}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Platform Selection & Actions */}
          <div className="space-y-6">
            {/* Platform Selection */}
            <div className="card" style={{ padding: 'var(--s-6)' }}>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-100)' }}>
                Publish to
              </h3>

              {!hasAnyConnection && (
                <div className="mb-4 p-3 rounded-lg" style={{ background: 'var(--surf-2)' }}>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5" style={{ color: 'var(--text-60)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-80)' }}>
                      Connect an account to start publishing
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handlePlatformToggle(platform.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border transition-colors"
                    style={{
                      background: selectedPlatforms.includes(platform.id) ? 'var(--acc-a-10)' : 'var(--surf-2)',
                      borderColor: selectedPlatforms.includes(platform.id) ? 'var(--acc-a)' : 'var(--bd-weak)',
                      color: 'var(--text-100)'
                    }}
                    disabled={loading}
                  >
                    <span className="font-medium">{platform.name}</span>
                    {connectedAccounts[platform.id] ? (
                      <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--acc-a-20)', color: 'var(--acc-a)' }}>
                        Connected
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--text-60)' }}>
                        Not connected
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="card" style={{ padding: 'var(--s-6)' }}>
              <div className="space-y-3">
                <Button
                  onClick={handlePublishNow}
                  disabled={!canPublish || loading}
                  className="w-full"
                  style={{
                    background: canPublish ? 'var(--acc-a)' : 'var(--surf-2)',
                    color: canPublish ? 'var(--bg)' : 'var(--text-60)',
                    cursor: canPublish && !loading ? 'pointer' : 'not-allowed'
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Publishing...' : 'Publish Now'}
                </Button>

                <Button
                  onClick={() => setShowSchedulePicker(!showSchedulePicker)}
                  disabled={!canPublish || loading}
                  variant="outline"
                  className="w-full"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {showSchedulePicker ? 'Hide Schedule' : 'Schedule'}
                </Button>

                {showSchedulePicker && (
                  <Button
                    onClick={handleSchedule}
                    disabled={!canPublish || !scheduledDate || !scheduledTime || loading}
                    className="w-full"
                    style={{
                      background: canPublish && scheduledDate && scheduledTime ? 'var(--acc-a)' : 'var(--surf-2)',
                      color: canPublish && scheduledDate && scheduledTime ? 'var(--bg)' : 'var(--text-60)'
                    }}
                  >
                    {loading ? 'Scheduling...' : 'Confirm Schedule'}
                  </Button>
                )}

                <Button
                  onClick={handleSaveDraft}
                  disabled={!canPublish || loading}
                  variant="ghost"
                  className="w-full"
                >
                  {loading ? 'Saving...' : 'Save as Draft'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
