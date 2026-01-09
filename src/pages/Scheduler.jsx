import React, { useState } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoMode, demoData } from '../hooks/useDemoMode';

export default function Scheduler() {
  const isDemoMode = useDemoMode();
  const [currentDate, setCurrentDate] = useState(new Date());
  const scheduledPosts = isDemoMode ? demoData.scheduledPosts : [];
  const scheduledCount = isDemoMode ? demoData.scheduledPosts.length : 0;
  const draftsCount = 0;
  const publishedTodayCount = isDemoMode ? demoData.metrics.postsPublished : 0;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

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
