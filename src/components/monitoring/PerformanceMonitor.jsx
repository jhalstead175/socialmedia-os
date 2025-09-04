export class PerformanceMonitor {
  static measurePageLoad() {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        domInteractive: navigation.domInteractive - navigation.navigationStart,
        firstPaint: this.getFirstPaint(),
        timestamp: new Date().toISOString(),
        url: window.location.href
      };

      console.log('Page Performance:', metrics);
      this.sendMetrics('page_load', metrics);
      
      return metrics;
    }
  }

  static getFirstPaint() {
    if (typeof window !== 'undefined' && window.performance) {
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      return firstPaint ? firstPaint.startTime : null;
    }
    return null;
  }

  static measureAPICall(endpoint, startTime, endTime, success = true) {
    const duration = endTime - startTime;
    const metric = {
      type: 'api_call',
      endpoint,
      duration,
      success,
      timestamp: new Date().toISOString()
    };

    console.log('API Performance:', metric);
    this.sendMetrics('api_call', metric);

    // Alert if API call is unusually slow
    if (duration > 5000) { // 5 seconds
      console.warn(`Slow API call detected: ${endpoint} took ${duration}ms`);
    }

    return metric;
  }

  static measureComponentRender(componentName, renderTime) {
    const metric = {
      type: 'component_render',
      component: componentName,
      renderTime,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // Only log slow renders to avoid noise
    if (renderTime > 100) { // 100ms
      console.warn('Slow component render:', metric);
      this.sendMetrics('component_render', metric);
    }

    return metric;
  }

  static sendMetrics(type, data) {
    // In production, send to analytics service
    try {
      const metrics = JSON.parse(localStorage.getItem('rezemai-metrics') || '[]');
      metrics.push({ type, ...data });
      
      // Keep only last 100 metrics
      if (metrics.length > 100) {
        metrics.splice(0, metrics.length - 100);
      }
      
      localStorage.setItem('rezemai-metrics', JSON.stringify(metrics));
    } catch (e) {
      console.error('Failed to store metrics:', e);
    }
  }

  static getStoredMetrics() {
    try {
      return JSON.parse(localStorage.getItem('rezemai-metrics') || '[]');
    } catch (e) {
      return [];
    }
  }

  static clearStoredMetrics() {
    localStorage.removeItem('rezemai-metrics');
  }
}