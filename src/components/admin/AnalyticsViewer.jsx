import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CreditCard,
  Eye,
  MousePointer,
  ShoppingCart,
  PieChart
} from "lucide-react";
import { getStoredEvents, clearStoredEvents } from "@/components/shared/Analytics";

export default function AnalyticsViewer() {
  const [events, setEvents] = useState([]);
  const [metrics, setMetrics] = useState({});

  const calculateMetrics = useCallback((events) => {
    const now = new Date();
    const last24h = events.filter(e => new Date(e.timestamp) > new Date(now - 24 * 60 * 60 * 1000));
    const last7d = events.filter(e => new Date(e.timestamp) > new Date(now - 7 * 24 * 60 * 60 * 1000));

    // Monetization metrics
    const landingViews = last24h.filter(e => e.event === 'page_view' && e.page === 'landing').length;
    const pricingViews = last24h.filter(e => e.event === 'page_view' && e.page === 'landing_pricing').length;
    const checkoutInits = last24h.filter(e => e.event === 'checkout_init').length;
    const checkoutSuccess = last24h.filter(e => e.event === 'checkout_success').length;
    
    // CTR calculations
    const heroCTR = pricingViews / Math.max(landingViews, 1);
    const pricingCTR = checkoutInits / Math.max(pricingViews, 1);
    const checkoutCR = checkoutSuccess / Math.max(checkoutInits, 1);

    // Plan distribution
    const planSets = last7d.filter(e => e.event === 'plan_set');
    const planCounts = planSets.reduce((acc, e) => {
      const plan = e.plan || 'starter';
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {});

    // Paywall metrics
    const paywallViews = last7d.filter(e => e.event === 'paywall_view').length;
    const paywallClicks = last7d.filter(e => e.event === 'paywall_cta_click').length;
    const paywallCTR = paywallClicks / Math.max(paywallViews, 1);

    setMetrics({
      landingViews,
      pricingViews,
      checkoutInits,
      checkoutSuccess,
      heroCTR,
      pricingCTR,
      checkoutCR,
      planCounts,
      paywallViews,
      paywallClicks,
      paywallCTR,
      totalEvents: events.length,
      last24hEvents: last24h.length
    });
  }, []);

  const loadAnalytics = useCallback(() => {
    const storedEvents = getStoredEvents();
    setEvents(storedEvents);
    calculateMetrics(storedEvents);
  }, [calculateMetrics]);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadAnalytics]);

  const formatPercentage = (value) => (value * 100).toFixed(1) + '%';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Monetization Analytics</h2>
          <p className="text-slate-600">Track conversion funnel and revenue metrics</p>
        </div>
        <Button 
          onClick={() => {
            clearStoredEvents();
            loadAnalytics();
          }}
          variant="outline" 
          size="sm"
        >
          Clear Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="plans">Plan Distribution</TabsTrigger>
          <TabsTrigger value="paywall">Paywall Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Landing Views</CardTitle>
                  <Eye className="w-4 h-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.landingViews}</div>
                <p className="text-xs text-slate-500">Last 24h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Pricing Views</CardTitle>
                  <MousePointer className="w-4 h-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.pricingViews}</div>
                <p className="text-xs text-slate-500">Last 24h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Checkouts</CardTitle>
                  <ShoppingCart className="w-4 h-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.checkoutInits}</div>
                <p className="text-xs text-slate-500">Last 24h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                  <CreditCard className="w-4 h-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.checkoutSuccess}</div>
                <p className="text-xs text-slate-500">Last 24h</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Conversion Rates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Hero → Pricing</h4>
                  <p className="text-2xl font-bold text-blue-700">{formatPercentage(metrics.heroCTR)}</p>
                  <p className="text-sm text-blue-600">{metrics.pricingViews} / {metrics.landingViews} visitors</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900">Pricing → Checkout</h4>
                  <p className="text-2xl font-bold text-green-700">{formatPercentage(metrics.pricingCTR)}</p>
                  <p className="text-sm text-green-600">{metrics.checkoutInits} / {metrics.pricingViews} views</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900">Checkout Success</h4>
                  <p className="text-2xl font-bold text-purple-700">{formatPercentage(metrics.checkoutCR)}</p>
                  <p className="text-sm text-purple-600">{metrics.checkoutSuccess} / {metrics.checkoutInits} attempts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Plan Distribution (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(metrics.planCounts || {}).map(([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={
                        plan === 'starter' ? 'bg-slate-100 text-slate-800' :
                        plan === 'pro' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }>
                        {plan.charAt(0).toUpperCase() + plan.slice(1)}
                      </Badge>
                    </div>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paywall" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Paywall Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-900">Paywall Shown</h4>
                  <p className="text-2xl font-bold text-red-700">{metrics.paywallViews}</p>
                  <p className="text-sm text-red-600">Last 7 days</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-900">Upgrade Clicks</h4>
                  <p className="text-2xl font-bold text-yellow-700">{metrics.paywallClicks}</p>
                  <p className="text-sm text-yellow-600">Last 7 days</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900">Paywall CTR</h4>
                  <p className="text-2xl font-bold text-green-700">{formatPercentage(metrics.paywallCTR)}</p>
                  <p className="text-sm text-green-600">Click-through rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.slice(-20).reverse().map((event, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                <span className="font-mono">{event.event}</span>
                <span className="text-slate-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}