import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoMode, demoData } from '../hooks/useDemoMode';
import { emit, NAV_EVENTS } from '@/utils/telemetry';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/hooks/useUserSafe';

export default function Scheduler() {
  const isDemoMode = useDemoMode();
  const { user: clerkUser } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledPosts, setScheduledPosts] = useState(isDemoMode ? demoData.scheduledPosts : []);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [draftsCount, setDraftsCount] = useState(0);
  const [publishedTodayCount, setPublishedTodayCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  useEffect(() => {
    emit(NAV_EVENTS.SCHEDULER_OPENED);
    if (!isDemoMode && clerkUser) {
      loadScheduledPosts();
    }
  }, [isDemoMode, clerkUser]);

  const loadScheduledPosts = async () => {
    setLoading(true);
    try {
      // Get user's org_id
      const { data: supabaseUser, error: userError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('clerk_user_id', clerkUser.id)
        .single();

      if (userError || !supabaseUser) return;

      // Load scheduled posts with platform info
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          scheduled_at,
          post_platforms (
            platform
          )
        `)
        .eq('organization_id', supabaseUser.organization_id)
        .eq('status', 'scheduled')
        .order('scheduled_at', { ascending: true });

      if (postsError) {
        console.error('Failed to load scheduled posts:', postsError);
        return;
      }

      // Transform to match UI format
      const transformedPosts = (posts || []).map(post => {
        const scheduledDate = new Date(post.scheduled_at);
        return {
          id: post.id,
          time: scheduledDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          platform: post.post_platforms.map(p => p.platform).join(', '),
          scheduled_at: post.scheduled_at,
          content: post.content
        };
      });

      setScheduledPosts(transformedPosts);
      setScheduledCount(transformedPosts.length);

      // Load drafts count
      const { count: draftsCount } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', supabaseUser.organization_id)
        .eq('status', 'draft');

      setDraftsCount(draftsCount || 0);

      // Load published today count
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count: publishedCount } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', supabaseUser.organization_id)
        .eq('status', 'published')
        .gte('published_at', todayStart.toISOString());

      setPublishedTodayCount(publishedCount || 0);

    } catch (err) {
      console.error('Error loading scheduled posts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-7xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="h1" style={{ color: 'var(--text-100)' }}>
          Scheduler
        </h1>
        <p className="lead mt-2">
          Manage your posting schedule
        </p>
      </div>

      {/* Calendar Navigation */}
      <div className="card mb-6" style={{ padding: 'var(--s-6)' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="h3" style={{ color: 'var(--text-100)' }}>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <Button variant="ghost" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Week</Button>
            <Button variant="outline" size="sm">Month</Button>
          </div>
        </div>

        {/* Week View Grid */}
        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-center py-3"
              style={{
                background: 'var(--surf-2)',
                borderRadius: 'var(--r-md)',
                color: 'var(--text-80)',
                fontSize: 'var(--fs-sm)',
                fontWeight: '600'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Time Slots (simplified view) */}
        <div className="mt-4 grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, dayIndex) => {
            const postsForDay = scheduledPosts.filter((_, i) => i % 7 === dayIndex);
            return (
              <div key={dayIndex}>
                <div
                  className="card card-quiet"
                  style={{
                    padding: 'var(--s-3)',
                    minHeight: '200px',
                    position: 'relative'
                  }}
                >
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-80)' }}>
                    {new Date(currentDate.getFullYear(), currentDate.getMonth(), dayIndex + 1).getDate()}
                  </div>
                  {postsForDay.length > 0 ? (
                    <div className="space-y-2">
                      {postsForDay.map((post) => (
                        <div
                          key={post.id}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            background: 'var(--surf-3)',
                            borderLeft: '2px solid var(--acc-a)',
                            color: 'var(--text-100)'
                          }}
                        >
                          <div className="font-semibold">{post.time}</div>
                          <div style={{ color: 'var(--text-60)' }}>{post.platform}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ color: 'var(--text-60)', fontSize: 'var(--fs-xs)' }}
                    >
                      No posts
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Queue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card" style={{ padding: 'var(--s-6)' }}>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5" style={{ color: 'var(--acc-a)' }} />
            <h3 className="h3" style={{ color: 'var(--text-100)' }}>{scheduledCount}</h3>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-60)' }}>Scheduled Posts</p>
        </div>

        <div className="card" style={{ padding: 'var(--s-6)' }}>
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5" style={{ color: 'var(--acc-b)' }} />
            <h3 className="h3" style={{ color: 'var(--text-100)' }}>{draftsCount}</h3>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-60)' }}>Drafts</p>
        </div>

        <div className="card" style={{ padding: 'var(--s-6)' }}>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5" style={{ color: 'var(--acc-c)' }} />
            <h3 className="h3" style={{ color: 'var(--text-100)' }}>{publishedTodayCount}</h3>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-60)' }}>Published Today</p>
        </div>
      </div>
    </div>
  );
}
