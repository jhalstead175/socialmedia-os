
import { PerformanceLog, AuditEvent } from '@/api/entities';
import { User } from '@/api/entities';

let performanceQueue = [];
let isProcessing = false;

// Batch performance logs to reduce API calls
const flushPerformanceLogs = async () => {
  if (isProcessing || performanceQueue.length === 0) return;

  isProcessing = true;
  const logsToProcess = [...performanceQueue];
  performanceQueue = [];

  try {
    const user = await User.me().catch(() => null);

    // Don't process if no user (auth not configured)
    if (!user) {
      // Silently discard logs when auth not configured
      isProcessing = false;
      return;
    }

    // Batch create performance logs
    await Promise.allSettled(
      logsToProcess.map(log =>
        PerformanceLog.create({
          ...log,
          user_id: user.id
        })
      )
    );
  } catch (error) {
    console.error('Failed to flush performance logs:', error);
    // Re-queue failed logs
    performanceQueue = [...logsToProcess, ...performanceQueue];
  }

  isProcessing = false;
};

// Flush logs every 5 seconds
setInterval(flushPerformanceLogs, 5000);

export const monitorPerformance = async (actionName, asyncFunction, metadata = {}) => {
  const startTime = performance.now();
  
  try {
    const result = await asyncFunction();
    const duration = performance.now() - startTime;
    
    // Queue for batch processing
    performanceQueue.push({
      action_name: actionName,
      duration_ms: Math.round(duration),
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        success: true
      }
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    // Log failed operations too
    performanceQueue.push({
      action_name: actionName,
      duration_ms: Math.round(duration),
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      }
    });
    
    throw error;
  }
};

// Event-driven user action tracking
export const trackUserAction = async (action, metadata = {}) => {
  try {
    const user = await User.me().catch(() => null);
    if (!user) return; // Silently skip if auth not configured

    // Immediate audit event creation
    await AuditEvent.create({
      user_id: user.id,
      action_type: action,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        page_url: window.location.href
      }
    });

    // Simulate background job queueing (in a real system, this would be a message queue)
    console.log(`[Background Job Queued] process_user_action:`, {
      userId: user.id,
      action,
      metadata,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Failed to track user action:', error);
  }
};

export default { monitorPerformance, trackUserAction };
