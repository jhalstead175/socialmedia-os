import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  PenTool,
  Calendar,
  BarChart3,
  MessageSquare,
  TrendingUp,
  Users,
  Eye,
  Heart
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import WelcomeModal from "../components/onboarding/WelcomeModal";
import ConnectedAccountCard from "../components/ConnectedAccountCard";
import ConnectAccountModal from "../components/ConnectAccountModal";
import { useDemoMode, demoData } from "../hooks/useDemoMode";
import { emit, NAV_EVENTS, ACTION_EVENTS } from "@/utils/telemetry";

export default function Dashboard() {
  const isDemoMode = useDemoMode();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState(
    isDemoMode ? demoData.connectedAccounts : {
      x: false,
      linkedin: false,
      meta: false
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
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      // Check if user needs onboarding
      if (!userData.onboarding_complete) {
        setShowWelcomeModal(true);
      }

      // In demo mode, preserve placeholder data
      if (!isDemoMode) {
        // In a real app, fetch actual social media stats here
        setStats({
          postsPublished: 0,
          totalEngagement: 0,
          activeAccounts: 0,
          scheduledPosts: 0,
          impressions: 0,
          newFollowers: 0
        });
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
    setIsLoading(false);
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
                {getGreeting()}, {user?.full_name?.split(' ')[0] || 'there'}
              </h1>
              <p className="lead">
                Manage your social media operations from one place
              </p>
            </div>
            <div className="flex gap-3">
              <Link to={createPageUrl("Composer")}>
                <Button className="btn-primary">
                  <PenTool className="w-5 h-5 mr-2" />
                  New Post
                </Button>
              </Link>
              <Link to={createPageUrl("Scheduler")}>
                <Button variant="outline">
                  <Calendar className="w-5 h-5 mr-2" />
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
                <PenTool className="w-4 h-4" style={{ color: 'var(--acc-a)' }} />
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
                <Eye className="w-4 h-4" style={{ color: 'var(--acc-b)' }} />
              </div>
              <div className="h2" style={{ color: 'var(--text-100)' }}>
                {stats.impressions.toLocaleString()}
              </div>
              <div className="text-xs mt-2 flex items-center" style={{ color: 'var(--acc-a)' }}>
                <TrendingUp className="w-3 h-3 mr-1" />
                +0% vs last week
              </div>
            </CardContent>
          </Card>

          <Card className="card">
            <CardContent style={{ padding: 'var(--s-6)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm" style={{ color: 'var(--text-60)' }}>Engagement</div>
                <Heart className="w-4 h-4" style={{ color: 'var(--acc-c)' }} />
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
                    <PenTool className="w-5 h-5" style={{ color: 'var(--acc-a)' }} />
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
                    <Calendar className="w-5 h-5" style={{ color: 'var(--acc-b)' }} />
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
                    <BarChart3 className="w-5 h-5" style={{ color: 'var(--acc-c)' }} />
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
              {!connectedAccounts.x && !connectedAccounts.linkedin && !connectedAccounts.meta ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-60)', opacity: 0.5 }} />
                  <p className="text-sm mb-4" style={{ color: 'var(--text-60)' }}>
                    No accounts connected
                  </p>
                  <Link to={createPageUrl("Account")}>
                    <Button variant="outline">
                      Connect Accounts
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <ConnectedAccountCard
                    platform="x"
                    isConnected={connectedAccounts.x}
                    onConnect={() => handleConnectAccount('x')}
                    onReconnect={() => handleConnectAccount('x')}
                  />
                  <ConnectedAccountCard
                    platform="linkedin"
                    isConnected={connectedAccounts.linkedin}
                    onConnect={() => handleConnectAccount('linkedin')}
                    onReconnect={() => handleConnectAccount('linkedin')}
                  />
                  <ConnectedAccountCard
                    platform="meta"
                    isConnected={connectedAccounts.meta}
                    onConnect={() => handleConnectAccount('meta')}
                    onReconnect={() => handleConnectAccount('meta')}
                  />
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
