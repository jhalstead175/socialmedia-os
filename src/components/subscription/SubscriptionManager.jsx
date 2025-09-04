
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Subscription, Usage, User } from "@/api/entities";
import { trackEvent } from '@/components/shared/Analytics';
import { createPageUrl } from '@/utils';
import {
  Crown,
  Check,
  X,
  Zap,
  FileText,
  Video,
  Sparkles,
  CreditCard,
  AlertCircle
} from 'lucide-react';

const PLAN_FEATURES = {
  free: {
    name: 'Free Plan',
    price: 0,
    features: [
      'Up to 2 résumés',
      'Basic templates',
      'Limited AI optimization (2/month)',
      '5 interview practice sessions/month',
      'Community support'
    ],
    limits: {
      resumes_limit: 2,
      interview_limit: 5,
      ai_limit: 2,
      premium_templates: false
    }
  },
  premium: {
    name: 'Premium Plan',
    price: 29.99,
    features: [
      'Unlimited résumés',
      'All premium templates',
      'Unlimited AI optimization',
      'Unlimited interview sessions',
      'Priority support',
      'Resume sharing & collaboration',
      'Advanced analytics'
    ],
    limits: {
      resumes_limit: -1, // unlimited
      interview_limit: -1,
      ai_limit: -1,
      premium_templates: true
    }
  }
};

export default function SubscriptionManager() {
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const navigate = useNavigate();

  const createDefaultSubscription = useCallback(async (userId) => {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

    return await Subscription.create({
      user_id: userId,
      plan_type: 'free',
      status: 'trial',
      trial_end_date: trialEndDate.toISOString().split('T')[0],
      usage_limits: PLAN_FEATURES.free.limits
    });
  }, []); // Empty dependency array as it doesn't depend on any props or state

  const calculateUsage = (usageData, subscription) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthUsage = usageData.filter(
      u => new Date(u.created_date) >= monthStart
    );

    return {
      resumes_created: thisMonthUsage.filter(u => u.action_type === 'resume_created').length,
      interview_sessions: thisMonthUsage.filter(u => u.action_type === 'interview_session').length,
      ai_optimizations: thisMonthUsage.filter(u => u.action_type === 'ai_optimization').length,
      pdf_exports: thisMonthUsage.filter(u => u.action_type === 'pdf_export').length
    };
  };

  const loadSubscriptionData = useCallback(async () => {
    try {
      const user = await User.me();
      const subscriptions = await Subscription.filter({ user_id: user.id }, '-created_date', 1);
      const currentSub = subscriptions[0] || await createDefaultSubscription(user.id);

      // Load usage data
      const usageData = await Usage.filter({ user_id: user.id });
      const usageSummary = calculateUsage(usageData, currentSub);

      setSubscription(currentSub);
      setUsage(usageSummary);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
    setIsLoading(false);
  }, [createDefaultSubscription]); // Dependency on createDefaultSubscription

  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]); // Dependency on loadSubscriptionData

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    await trackEvent('upgrade_attempt', { plan: 'premium', from: 'SubscriptionManager' });

    // Navigate to the new checkout page
    navigate(createPageUrl('Checkout?plan=premium'));

    // setIsUpgrading(false) will be called, but navigation happens immediately.
    // The state might reset if the user navigates back, but for a one-way redirect, this is fine.
    setIsUpgrading(false);
  };

  const isAtLimit = (type) => {
    const limit = subscription?.usage_limits?.[`${type}_limit`];
    const current = usage[type] || 0;
    // Limit of -1 means unlimited, so it's never at limit
    return limit > 0 && current >= limit;
  };

  const getUsagePercent = (type) => {
    const limit = subscription?.usage_limits?.[`${type}_limit`];
    const current = usage[type] || 0;
    if (limit <= 0) return 0; // unlimited or no limit defined
    return (current / limit) * 100;
  };

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-slate-200 rounded-lg"></div>;
  }

  const currentPlan = PLAN_FEATURES[subscription?.plan_type || 'free'];
  const isPremium = subscription?.plan_type === 'premium';
  const isTrialing = subscription?.status === 'trial';

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              {isPremium ? (
                <Crown className="w-5 h-5 text-gold" />
              ) : (
                <Zap className="w-5 h-5 text-blue-600" />
              )}
              {currentPlan.name}
              {isTrialing && <Badge className="bg-green-100 text-green-800">Trial</Badge>}
            </CardTitle>
            {/* Removed the upgrade button from CardHeader */}
          </div>
        </CardHeader>
        <CardContent>
          {isTrialing && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <Sparkles className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                You're on a 14-day free trial with full premium access!
                {subscription?.trial_end_date && ` Trial ends ${new Date(subscription.trial_end_date).toLocaleDateString()}.`}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Plan Features</h4>
              <ul className="space-y-2">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Current Usage</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Résumés Created</span>
                    <span>{usage.resumes_created || 0}/{subscription?.usage_limits?.resumes_limit === -1 ? 'Unlimited' : subscription?.usage_limits?.resumes_limit || 0}</span>
                  </div>
                  <Progress value={getUsagePercent('resumes_created')} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Interview Sessions</span>
                    <span>{usage.interview_sessions || 0}/{subscription?.usage_limits?.interview_limit === -1 ? 'Unlimited' : subscription?.usage_limits?.interview_limit || 0}</span>
                  </div>
                  <Progress value={getUsagePercent('interview_sessions')} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>AI Optimizations</span>
                    <span>{usage.ai_optimizations || 0}/{subscription?.usage_limits?.ai_limit === -1 ? 'Unlimited' : subscription?.usage_limits?.ai_limit || 0}</span>
                  </div>
                  <Progress value={getUsagePercent('ai_optimizations')} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Warnings */}
      {!isPremium && (
        <div className="space-y-4">
          {isAtLimit('resumes_created') && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You've reached your résumé limit. Upgrade to Premium for unlimited résumés.
              </AlertDescription>
            </Alert>
          )}

          {isAtLimit('ai_optimizations') && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You've used all AI optimizations this month. Upgrade for unlimited access.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Plan Comparison */}
      {!isPremium && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-center">Free Plan</CardTitle>
              <div className="text-center">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-slate-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {PLAN_FEATURES.free.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-gold shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gold text-navy text-xs font-bold px-3 py-1">
              MOST POPULAR
            </div>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 text-gold" />
                Premium Plan
              </CardTitle>
              <div className="text-center">
                <span className="text-3xl font-bold">$29.99</span>
                <span className="text-slate-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {PLAN_FEATURES.premium.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              {/* Removed the original button from here */}
            </CardContent>
            {/* New button structure as per outline */}
            <div className="mt-6 text-center">
              <Button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="bg-gold hover:bg-gold/90 text-navy shadow-lg"
              >
                {isUpgrading ? 'Redirecting...' : 'Upgrade to Premium'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
