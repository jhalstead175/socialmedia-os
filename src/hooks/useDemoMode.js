import { useMemo } from 'react';

/**
 * Demo/Safe Mode Detection Hook
 *
 * Activates when:
 * - VITE_SOSHLOPS_DEMO=true (environment variable)
 * - ?demo=true (query string parameter)
 *
 * No UI toggle. No user-facing explanation.
 * This is for investor demos and screenshots only.
 */
export function useDemoMode() {
  const isDemoMode = useMemo(() => {
    // Check environment variable
    const envDemo = import.meta.env.VITE_SOSHLOPS_DEMO === 'true';

    // Check query string
    const urlParams = new URLSearchParams(window.location.search);
    const queryDemo = urlParams.get('demo') === 'true';

    return envDemo || queryDemo;
  }, []);

  return isDemoMode;
}

/**
 * Demo Mode Placeholder Data
 * Generic, rounded, non-identifying values
 */
export const demoData = {
  // Metrics
  metrics: {
    postsPublished: 12,
    totalEngagement: 450,
    impressions: 8200,
    newFollowers: 34,
    scheduledPosts: 7,
    activeAccounts: 3
  },

  // Connected accounts (always show as connected in demo)
  connectedAccounts: {
    x: true,
    linkedin: true,
    meta: true
  },

  // Activity feed items
  activities: [
    { type: 'post', platform: 'X', time: 'Recently', metric: '45 engagements' },
    { type: 'post', platform: 'LinkedIn', time: 'Recently', metric: '120 impressions' },
    { type: 'scheduled', platform: 'Meta', time: 'Upcoming', metric: 'Scheduled' }
  ],

  // Scheduled posts
  scheduledPosts: [
    { id: 1, platform: 'X', date: 'Today', time: '2:00 PM', status: 'Scheduled' },
    { id: 2, platform: 'LinkedIn', date: 'Tomorrow', time: '9:00 AM', status: 'Scheduled' },
    { id: 3, platform: 'Meta', date: 'Tomorrow', time: '3:00 PM', status: 'Scheduled' }
  ],

  // Analytics chart data (static, generic)
  analyticsData: [
    { date: 'Mon', engagements: 45 },
    { date: 'Tue', engagements: 52 },
    { date: 'Wed', engagements: 48 },
    { date: 'Thu', engagements: 61 },
    { date: 'Fri', engagements: 55 },
    { date: 'Sat', engagements: 38 },
    { date: 'Sun', engagements: 42 }
  ],

  // Inbox messages
  messages: [
    { id: 1, platform: 'X', content: 'Mention received', time: 'Recently' },
    { id: 2, platform: 'LinkedIn', content: 'Comment on post', time: 'Recently' },
    { id: 3, platform: 'Meta', content: 'Message received', time: 'Recently' }
  ],

  // Asset library items
  assets: [
    { id: 1, type: 'image', name: 'Asset 1', size: '1.2 MB' },
    { id: 2, type: 'image', name: 'Asset 2', size: '980 KB' },
    { id: 3, type: 'video', name: 'Asset 3', size: '3.4 MB' },
    { id: 4, type: 'image', name: 'Asset 4', size: '1.5 MB' }
  ]
};

/**
 * Demo Mode Action Handler
 * Returns neutral confirmations for all actions
 */
export function useDemoAction() {
  const isDemoMode = useDemoMode();

  return {
    isDemoMode,
    handleAction: (actionType) => {
      if (!isDemoMode) return null;

      // Map actions to neutral confirmations
      const confirmations = {
        publish: 'Draft saved',
        schedule: 'Scheduled',
        save: 'Saved',
        update: 'Updated',
        upload: 'Uploaded',
        delete: 'Removed',
        connect: 'Action completed'
      };

      return confirmations[actionType] || 'Action completed';
    }
  };
}
