import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  PenSquare,
  CalendarClock,
  BarChart3,
  Inbox,
  TrendingUp,
  Users,
  Eye
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import WelcomeModal from "../components/onboarding/WelcomeModal";
import ConnectedAccountCard from "../components/ConnectedAccountCard";
import ConnectAccountModal from "../components/ConnectAccountModal";
import { useDemoMode, demoData } from "../hooks/useDemoMode";
import { emit, NAV_EVENTS, ACTION_EVENTS } from "@/utils/telemetry";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useUser } from "@clerk/clerk-react";

export default function Dashboard() {
  const isDemoMode = useDemoMode();
  const { user: clerkUser, isLoaded } = useUser();
  const supabase = useSupabaseClient();
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState(
    isDemoMode ? demoData.connectedAccounts : {
      linkedin: false,
      // X and Meta removed for LinkedIn-only MVP
    }
  );
  const [stats, setStats] = useState(
    isDemoMode ? demoData.metrics : {
      postsPublished: 0,
      totalEngagement: 0,
      activeAccounts: 0,
      scheduledPosts: 0,
      impressions: 0,
      newFollowers: 0
    }
  );

  useEffect(() => {
    emit(NAV_EVENTS.DASHBOARD_OPENED);
    loadDashboardData();
  }, [clerkUser]);

  const loadDashboardData = async () => {
    if (!isLoaded || !clerkUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Check if user needs onboarding (stored in Clerk unsafeMetadata or localStorage)
      const hasCompletedOnboarding =
        clerkUser.unsafeMetadata?.onboardingCompleted === true ||
        localStorage.getItem('onboarding_completed') === 'true';

      if (!hasCompletedOnboarding) {
        setShowWelcomeModal(true);
      }

      // Load real data from Supabase (unless in demo mode)
      if (!isDemoMode) {
        await loadSupabaseStats();
        await loadConnectedAccounts();
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
    setIsLoading(false);
  };

  const loadSupabaseStats = async () => {
    try {
      // Get user's org_id
      const { data: supabaseUser, error: userError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('clerk_user_id', clerkUser.id)
        .single();

      if (userError || !supabaseUser) return;

      // Get count of published posts in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: publishedCount } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', supabaseUser.organization_id)
        .eq('status', 'published')
        .gte('published_at', sevenDaysAgo.toISOString());

      // Get count of scheduled posts
      const { count: scheduledCount } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', supabaseUser.organization_id)
        .eq('status', 'scheduled');

      // Get count of active social accounts
      const { count: accountsCount } = await supabase
        .from('social_accounts')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', supabaseUser.organization_id)
        .eq('is_active', true);

      setStats({
        postsPublished: publishedCount || 0,
        scheduledPosts: scheduledCount || 0,
        activeAccounts: accountsCount || 0,
        totalEngagement: 0, // v1: no analytics
        impressions: 0, // v1: no analytics
        newFollowers: 0 // v1: no analytics
      });
    } catch (err) {
      console.error('Error loading Supabase stats:', err);
    }
  };

  const loadConnectedAccounts = async () => {
    try {
      const { data: accounts, error } = await supabase
        .from('social_accounts')
        .select('platform')
        .eq('is_active', true);

      if (error) {
        console.error('Failed to load connected accounts:', error);
        return;
      }

      const accountsMap = { linkedin: false };
      accounts?.forEach(account => {
        if (account.platform === 'linkedin') {
          accountsMap[account.platform] = true;
        }
      });

      setConnectedAccounts(accountsMap);
    } catch (err) {
      console.error('Error loading accounts:', err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleWelcomeComplete = () => {
    setShowWelcomeModal(false);
    loadDashboardData();
  };

  const handleConnectAccount = (platform) => {
    emit(ACTION_EVENTS.ACCOUNT_CONNECT_ATTEMPTED);
    setSelectedPlatform(platform);
    setShowConnectModal(true);
  };

  const handleCloseConnectModal = () => {
    setShowConnectModal(false);
    setSelectedPlatform(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ background: 'var(--bg)' }}>
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeComplete}
      />

      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Welcome Header */}
        <div className="card" style={{ padding: 'var(--s-8)' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="h1 mb-2" style={{ color: 'var(--text-100)' }}>
                {getGreeting()}, {clerkUser?.firstName || 'there'}
              </h1>
              <p className="lead">
                Manage your social media operations from one place
              </p>
            </div>
            <div className="flex gap-3">
              <Link to={createPageUrl("Composer")}>
                <Button className="btn-primary">
                  <PenSquare className="w-5 h-5 mr-2" />
                  New Post
                </Button>
              </Link>
              <Link to={createPageUrl("Scheduler")}>
                <Button variant="outline">
                  <CalendarClock className="w-5 h-5 mr-2" />
                  Schedule
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card">
            <CardContent style={{ padding: 'var(--s-6)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm" style={{ color: 'var(--text-60)' }}>Posts This Week</div>
                <PenSquare className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              </div>
              <div className="h2" style={{ color: 'var(--text-100)' }}>
                {stats.postsPublished}
              </div>
              <div className="text-xs mt-2" style={{ color: 'var(--text-60)' }}>
                {stats.scheduledPosts} scheduled
              </div>
            </CardContent>
          </Card>

          <Card className="card">
            <CardContent style={{ padding: 'var(--s-6)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm" style={{ color: 'var(--text-60)' }}>Total Reach</div>
                <Eye className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              </div>
              <div className="h2" style={{ color: 'var(--text-100)' }}>
                {stats.impressions.toLocaleString()}
              </div>
              <div className="text-xs mt-2 flex items-center" style={{ color: 'var(--accent)' }}>
                <TrendingUp className="w-3 h-3 mr-1" />
                +0% vs last week
              </div>
            </CardContent>
          </Card>

          <Card className="card">
            <CardContent style={{ padding: 'var(--s-6)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm" style={{ color: 'var(--text-60)' }}>Engagement</div>
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              </div>
              <div className="h2" style={{ color: 'var(--text-100)' }}>
                {stats.totalEngagement.toLocaleString()}
              </div>
              <div className="text-xs mt-2" style={{ color: 'var(--text-60)' }}>
                Likes, comments, shares
              </div>
            </CardContent>
          </Card>

          <Card className="card">
            <CardContent style={{ padding: 'var(--s-6)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm" style={{ color: 'var(--text-60)' }}>New Followers</div>
                <Users className="w-4 h-4" style={{ color: 'var(--text-60)' }} />
              </div>
              <div className="h2" style={{ color: 'var(--text-100)' }}>
                +{stats.newFollowers}
              </div>
              <div className="text-xs mt-2" style={{ color: 'var(--text-60)' }}>
                Last 7 days
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card">
            <CardHeader style={{ padding: 'var(--s-6)', borderBottom: '1px solid var(--bd-weak)' }}>
              <CardTitle className="h3" style={{ color: 'var(--text-100)' }}>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: 'var(--s-6)' }}>
              <div className="space-y-3">
                <Link to={createPageUrl("Composer")}>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                    style={{
                      background: 'var(--surf-2)',
                      border: '1px solid var(--bd-weak)',
                      color: 'var(--text-100)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surf-3)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surf-2)'}
                  >
                    <PenSquare className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <div className="text-left flex-1">
                      <div className="font-semibold">Create Post</div>
                      <div className="text-xs" style={{ color: 'var(--text-60)' }}>
                        Compose for multiple platforms
                      </div>
                    </div>
                  </button>
                </Link>

                <Link to={createPageUrl("Scheduler")}>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                    style={{
                      background: 'var(--surf-2)',
                      border: '1px solid var(--bd-weak)',
                      color: 'var(--text-100)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surf-3)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surf-2)'}
                  >
                    <CalendarClock className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <div className="text-left flex-1">
                      <div className="font-semibold">View Schedule</div>
                      <div className="text-xs" style={{ color: 'var(--text-60)' }}>
                        Manage your posting queue
                      </div>
                    </div>
                  </button>
                </Link>

                <Link to={createPageUrl("Analytics")}>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                    style={{
                      background: 'var(--surf-2)',
                      border: '1px solid var(--bd-weak)',
                      color: 'var(--text-100)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surf-3)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surf-2)'}
                  >
                    <BarChart3 className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <div className="text-left flex-1">
                      <div className="font-semibold">View Analytics</div>
                      <div className="text-xs" style={{ color: 'var(--text-60)' }}>
                        Track performance metrics
                      </div>
                    </div>
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader style={{ padding: 'var(--s-6)', borderBottom: '1px solid var(--bd-weak)' }}>
              <CardTitle className="h3" style={{ color: 'var(--text-100)' }}>
                Connected Accounts
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: 'var(--s-6)' }}>
              {!connectedAccounts.linkedin ? (
                <div className="text-center py-8">
                  <Inbox className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-60)', opacity: 0.5 }} />
                  <p className="text-sm mb-4" style={{ color: 'var(--text-60)' }}>
                    No accounts connected
                  </p>
                  <Link to={createPageUrl("Account")}>
                    <Button variant="outline">
                      Connect LinkedIn
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* LinkedIn-only MVP */}
                  <ConnectedAccountCard
                    platform="linkedin"
                    isConnected={connectedAccounts.linkedin}
                    onConnect={() => handleConnectAccount('linkedin')}
                    onReconnect={() => handleConnectAccount('linkedin')}
                  />
                  <div
                    className="card-quiet"
                    style={{
                      padding: 'var(--s-3)',
                      background: 'var(--surf-1)',
                      border: '1px dashed var(--bd-weak)',
                      borderRadius: 'var(--r-lg)'
                    }}
                  >
                    <p className="text-xs text-center" style={{ color: 'var(--text-60)' }}>
                      Additional platforms (X, Meta) coming soon
                    </p>
                  </div>
                  <div className="pt-3 text-center">
                    <Link to={createPageUrl("Account")}>
                      <Button variant="ghost" size="sm">
                        Manage Accounts
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConnectAccountModal
        isOpen={showConnectModal}
        onClose={handleCloseConnectModal}
        platform={selectedPlatform}
      />
    </div>
  );
}
