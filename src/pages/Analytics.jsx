import React, { useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react';
import { useDemoMode, demoData } from '../hooks/useDemoMode';
import { emit, NAV_EVENTS } from '@/utils/telemetry';

export default function Analytics() {
  const isDemoMode = useDemoMode();
  const metrics = isDemoMode ? demoData.metrics : {
    impressions: 0,
    totalEngagement: 0,
    newFollowers: 0,
    postsPublished: 0
  };
  const analyticsData = isDemoMode ? demoData.analyticsData : [];

  useEffect(() => {
    emit(NAV_EVENTS.ANALYTICS_OPENED);
  }, []);

  return (
    <div className="container-7xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="h1" style={{ color: 'var(--text-100)' }}>
          Analytics
        </h1>
        <p className="lead mt-2">
          Track performance across platforms
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card" style={{ padding: 'var(--s-6)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm" style={{ color: 'var(--text-60)' }}>Total Reach</div>
            <Eye className="w-4 h-4" style={{ color: 'var(--text-60)' }} />
          </div>
          <div className="h2" style={{ color: 'var(--text-100)' }}>{metrics.impressions.toLocaleString()}</div>
          <div className="text-xs mt-2" style={{ color: 'var(--acc-a)' }}>
            <TrendingUp className="w-3 h-3 inline mr-1" />
            +0% vs last period
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--s-6)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm" style={{ color: 'var(--text-60)' }}>Engagement</div>
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--text-60)' }} />
          </div>
          <div className="h2" style={{ color: 'var(--text-100)' }}>{metrics.totalEngagement.toLocaleString()}</div>
          <div className="text-xs mt-2" style={{ color: 'var(--acc-a)' }}>
            <TrendingUp className="w-3 h-3 inline mr-1" />
            +0% vs last period
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--s-6)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm" style={{ color: 'var(--text-60)' }}>New Followers</div>
            <Users className="w-4 h-4" style={{ color: 'var(--text-60)' }} />
          </div>
          <div className="h2" style={{ color: 'var(--text-100)' }}>{metrics.newFollowers}</div>
          <div className="text-xs mt-2" style={{ color: 'var(--acc-a)' }}>
            <TrendingUp className="w-3 h-3 inline mr-1" />
            +0% vs last period
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--s-6)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm" style={{ color: 'var(--text-60)' }}>Posts Published</div>
            <BarChart3 className="w-4 h-4" style={{ color: 'var(--text-60)' }} />
          </div>
          <div className="h2" style={{ color: 'var(--text-100)' }}>{metrics.postsPublished}</div>
          <div className="text-xs mt-2" style={{ color: 'var(--text-60)' }}>
            Last 30 days
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="card mb-8" style={{ padding: 'var(--s-8)' }}>
        <h2 className="h3 mb-6" style={{ color: 'var(--text-100)' }}>
          Engagement Over Time
        </h2>
        {analyticsData.length > 0 ? (
          <div
            className="flex items-end justify-around gap-2"
            style={{
              minHeight: '300px',
              background: 'var(--surf-1)',
              borderRadius: 'var(--r-lg)',
              padding: 'var(--s-6)'
            }}
          >
            {analyticsData.map((item, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div
                  style={{
                    background: 'var(--acc-a)',
                    width: '100%',
                    height: `${(item.engagements / 70) * 200}px`,
                    borderRadius: 'var(--r-sm)',
                    marginBottom: 'var(--s-2)'
                  }}
                />
                <div className="text-xs" style={{ color: 'var(--text-60)' }}>
                  {item.date}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex items-center justify-center"
            style={{
              minHeight: '300px',
              background: 'var(--surf-1)',
              borderRadius: 'var(--r-lg)',
              color: 'var(--text-60)'
            }}
          >
            Chart will display here once data is available
          </div>
        )}
      </div>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card" style={{ padding: 'var(--s-6)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-100)' }}>
            X (Twitter)
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-60)' }}>Impressions</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-80)' }}>
                {isDemoMode ? '2,800' : '0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-60)' }}>Engagements</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-80)' }}>
                {isDemoMode ? '150' : '0'}
              </span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--s-6)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-100)' }}>
            LinkedIn
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-60)' }}>Impressions</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-80)' }}>
                {isDemoMode ? '3,200' : '0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-60)' }}>Engagements</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-80)' }}>
                {isDemoMode ? '180' : '0'}
              </span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--s-6)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-100)' }}>
            Meta
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-60)' }}>Impressions</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-80)' }}>
                {isDemoMode ? '2,200' : '0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-60)' }}>Engagements</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-80)' }}>
                {isDemoMode ? '120' : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
