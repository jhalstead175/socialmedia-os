export class ErrorLogger {
  static logError(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context
    };

    // Log to console in development
    console.error('Application Error:', errorData);

    // In production, you would send this to your error monitoring service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    this.sendToErrorService(errorData);
  }

  static logAPIError(endpoint, error, response = null) {
    const apiError = {
      type: 'API_ERROR',
      endpoint,
      error: error.message,
      status: response?.status,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    console.error('API Error:', apiError);
    this.sendToErrorService(apiError);
  }

  static logUserAction(action, data = {}) {
    const userAction = {
      type: 'USER_ACTION',
      action,
      data,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // Log significant user actions for debugging
    if (action.includes('error') || action.includes('fail')) {
      console.warn('User Action:', userAction);
    }
  }

  static sendToErrorService(errorData) {
    // In a production environment, you would implement actual error reporting here
    // For now, we'll store errors locally for development debugging
    try {
      const errors = JSON.parse(localStorage.getItem('rezemai-errors') || '[]');
      errors.push(errorData);
      
      // Keep only last 50 errors to prevent localStorage bloat
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('rezemai-errors', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to store error:', e);
    }
  }

  static getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('rezemai-errors') || '[]');
    } catch (e) {
      return [];
    }
  }

  static clearStoredErrors() {
    localStorage.removeItem('rezemai-errors');
  }
}