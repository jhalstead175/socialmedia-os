import React, { useState } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Scheduler() {
  const [currentDate, setCurrentDate] = useState(new Date());

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
          {Array.from({ length: 7 }).map((_, dayIndex) => (
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
                {/* Empty state for posts */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ color: 'var(--text-60)', fontSize: 'var(--fs-xs)' }}
                >
                  No posts
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Queue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card" style={{ padding: 'var(--s-6)' }}>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5" style={{ color: 'var(--acc-a)' }} />
            <h3 className="h3" style={{ color: 'var(--text-100)' }}>0</h3>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-60)' }}>Scheduled Posts</p>
        </div>

        <div className="card" style={{ padding: 'var(--s-6)' }}>
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5" style={{ color: 'var(--acc-b)' }} />
            <h3 className="h3" style={{ color: 'var(--text-100)' }}>0</h3>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-60)' }}>Drafts</p>
        </div>

        <div className="card" style={{ padding: 'var(--s-6)' }}>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5" style={{ color: 'var(--acc-c)' }} />
            <h3 className="h3" style={{ color: 'var(--text-100)' }}>0</h3>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-60)' }}>Published Today</p>
        </div>
      </div>
    </div>
  );
}
