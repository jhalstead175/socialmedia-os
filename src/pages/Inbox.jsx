import React, { useState } from 'react';
import { MessageSquare, Filter, Star, Archive, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoMode, demoData } from '../hooks/useDemoMode';

export default function Inbox() {
  const isDemoMode = useDemoMode();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const messages = isDemoMode ? demoData.messages : [];
  const messageCount = messages.length;

  const filters = [
    { id: 'all', label: 'All', count: isDemoMode ? messageCount : 0 },
    { id: 'mentions', label: 'Mentions', count: isDemoMode ? 1 : 0 },
    { id: 'dms', label: 'Direct Messages', count: isDemoMode ? 1 : 0 },
    { id: 'comments', label: 'Comments', count: isDemoMode ? 1 : 0 }
  ];

  return (
    <div className="container-7xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="h1" style={{ color: 'var(--text-100)' }}>
          Inbox
        </h1>
        <p className="lead mt-2">
          Manage mentions and messages
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="card" style={{ padding: 'var(--s-4)' }}>
            <div className="flex items-center gap-2 mb-4 px-2">
              <Filter className="w-4 h-4" style={{ color: 'var(--text-60)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-80)' }}>
                Filter
              </span>
            </div>
            <div className="space-y-1">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className="w-full text-left px-3 py-2 rounded-lg transition-colors"
                  style={{
                    background: selectedFilter === filter.id ? 'var(--surf-3)' : 'transparent',
                    color: selectedFilter === filter.id ? 'var(--text-100)' : 'var(--text-80)',
                    fontSize: 'var(--fs-sm)'
                  }}
                  onMouseEnter={(e) => selectedFilter !== filter.id && (e.currentTarget.style.background = 'var(--surf-2)')}
                  onMouseLeave={(e) => selectedFilter !== filter.id && (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="flex items-center justify-between">
                    <span>{filter.label}</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{
                        background: 'var(--surf-2)',
                        color: 'var(--text-60)'
                      }}
                    >
                      {filter.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card mt-4" style={{ padding: 'var(--s-4)' }}>
            <div className="text-sm font-semibold mb-3 px-2" style={{ color: 'var(--text-80)' }}>
              Quick Actions
            </div>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Star className="w-4 h-4 mr-2" />
                Mark Important
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="lg:col-span-3">
          <div className="card" style={{ padding: 'var(--s-6)' }}>
            {messages.length > 0 ? (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="card card-hover"
                    style={{
                      padding: 'var(--s-4)',
                      cursor: 'pointer'
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-100)' }}>
                            {message.platform}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--text-60)' }}>
                            {message.time}
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-80)' }}>
                          {message.content}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" disabled title="Coming soon">
                        <Reply className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center py-16"
                style={{ minHeight: '400px' }}
              >
                <MessageSquare
                  className="w-16 h-16 mb-4"
                  style={{ color: 'var(--text-60)', opacity: 0.5 }}
                />
                <h3 className="h3 mb-2" style={{ color: 'var(--text-80)' }}>
                  No messages yet
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-60)' }}>
                  Connect your accounts to see mentions and messages
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="card" style={{ padding: 'var(--s-6)' }}>
          <div className="flex items-center gap-3 mb-2">
            <Reply className="w-5 h-5" style={{ color: 'var(--acc-a)' }} />
            <h3 className="h3" style={{ color: 'var(--text-100)' }}>{isDemoMode ? messageCount : 0}</h3>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-60)' }}>Pending Replies</p>
        </div>

        <div className="card" style={{ padding: 'var(--s-6)' }}>
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5" style={{ color: 'var(--acc-b)' }} />
            <h3 className="h3" style={{ color: 'var(--text-100)' }}>{isDemoMode ? messageCount : 0}</h3>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-60)' }}>Unread Messages</p>
        </div>

        <div className="card" style={{ padding: 'var(--s-6)' }}>
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5" style={{ color: 'var(--acc-c)' }} />
            <h3 className="h3" style={{ color: 'var(--text-100)' }}>0</h3>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-60)' }}>Important</p>
        </div>
      </div>
    </div>
  );
}
