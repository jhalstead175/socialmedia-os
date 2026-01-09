import React from 'react';
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react';

export default function Analytics() {
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
          <div className="h2" style={{ color: 'var(--text-100)' }}>0</div>
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
          <div className="h2" style={{ color: 'var(--text-100)' }}>0</div>
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
          <div className="h2" style={{ color: 'var(--text-100)' }}>0</div>
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
          <div className="h2" style={{ color: 'var(--text-100)' }}>0</div>
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
              <span className="text-sm font-medium" style={{ color: 'var(--text-80)' }}>0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-60)' }}>Engagements</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-80)' }}>0</span>
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
              <span className="text-sm font-medium" style={{ color: 'var(--text-80)' }}>0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-60)' }}>Engagements</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-80)' }}>0</span>
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
              <span className="text-sm font-medium" style={{ color: 'var(--text-80)' }}>0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-60)' }}>Engagements</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-80)' }}>0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
