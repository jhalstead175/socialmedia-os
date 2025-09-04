// Analytics service for tracking monetization events
export const trackEvent = (eventName, properties = {}) => {
  // Add timestamp and session info
  const eventData = {
    ...properties,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
  };

  // Log to console in development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('📊 Analytics Event:', eventName, eventData);
  }

  // In a real app, you'd send to your analytics service
  // For now, we'll use a simple approach that could integrate with Base44's analytics
  try {
    // Store in localStorage for demo purposes
    const events = JSON.parse(localStorage.getItem('rezemai_events') || '[]');
    events.push({ event: eventName, ...eventData });
    
    // Keep only last 1000 events to avoid storage bloat
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }
    
    localStorage.setItem('rezemai_events', JSON.stringify(events));

    // If Base44 has a built-in analytics API, we'd call it here
    // Example: base44.analytics.track(eventName, eventData);
    
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
};

// Helper to track page views
export const trackPageView = (page, properties = {}) => {
  trackEvent('page_view', { 
    page, 
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    ...properties 
  });
};

// Helper to get stored events (for analytics dashboard)
export const getStoredEvents = () => {
  try {
    return JSON.parse(localStorage.getItem('rezemai_events') || '[]');
  } catch {
    return [];
  }
};

// Helper to clear stored events
export const clearStoredEvents = () => {
  try {
    localStorage.removeItem('rezemai_events');
  } catch (error) {
    console.warn('Failed to clear events:', error);
  }
};