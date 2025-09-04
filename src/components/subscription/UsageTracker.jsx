import { Subscription, Usage, User } from "@/api/entities";

class UsageTracker {
  static async trackUsage(actionType, resourceId = null, metadata = {}) {
    try {
      const user = await User.me();
      
      // Check if user has reached limits
      const canPerformAction = await this.checkLimits(user.id, actionType);
      if (!canPerformAction) {
        throw new Error(`Usage limit reached for ${actionType}. Please upgrade to continue.`);
      }

      // Record the usage
      await Usage.create({
        user_id: user.id,
        action_type: actionType,
        resource_id: resourceId,
        metadata: metadata
      });

      return true;
    } catch (error) {
      console.error('Usage tracking error:', error);
      throw error;
    }
  }

  static async checkLimits(userId, actionType) {
    try {
      // Get user's subscription
      const subscriptions = await Subscription.filter({ user_id: userId }, '-created_date', 1);
      const subscription = subscriptions[0];
      
      if (!subscription || subscription.plan_type === 'premium') {
        return true; // Premium users have no limits
      }

      // Get usage for current month
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const usageData = await Usage.filter({ 
        user_id: userId,
        action_type: actionType
      });
      
      const thisMonthUsage = usageData.filter(
        u => new Date(u.created_date) >= monthStart
      ).length;

      // Check against limits
      const limits = {
        resume_created: subscription.usage_limits?.resumes_limit || 2,
        interview_session: subscription.usage_limits?.interview_limit || 5,
        ai_optimization: subscription.usage_limits?.ai_limit || 2,
        pdf_export: 10, // Free users get 10 PDF exports/month
        template_premium: 0 // Free users can't use premium templates
      };

      const limit = limits[actionType];
      return limit === -1 || thisMonthUsage < limit;
      
    } catch (error) {
      console.error('Error checking limits:', error);
      return true; // Default to allowing action if check fails
    }
  }

  static async getCurrentUsage(userId) {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const usageData = await Usage.filter({ user_id: userId });
      const thisMonthUsage = usageData.filter(
        u => new Date(u.created_date) >= monthStart
      );

      return {
        resumes_created: thisMonthUsage.filter(u => u.action_type === 'resume_created').length,
        interview_sessions: thisMonthUsage.filter(u => u.action_type === 'interview_session').length,
        ai_optimizations: thisMonthUsage.filter(u => u.action_type === 'ai_optimization').length,
        pdf_exports: thisMonthUsage.filter(u => u.action_type === 'pdf_export').length
      };
    } catch (error) {
      console.error('Error getting current usage:', error);
      return {};
    }
  }
}

export default UsageTracker;