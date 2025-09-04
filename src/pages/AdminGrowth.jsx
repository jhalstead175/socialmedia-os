
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  DollarSign,
  Calendar,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { User, AuditEvent } from "@/api/entities";
import { format, subDays, parseISO, isWithinInterval } from 'date-fns';
import { trackEvent } from '@/components/shared/Analytics';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar
} from 'recharts';

const COLORS = ['#1A2F4B', '#B88B4A', '#64748b', '#ef4444'];

export default function AdminGrowth() {
  const [users, setUsers] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('14');
  const [planFilter, setPlanFilter] = useState('all');
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    newUsersLast7d: 0,
    activePaid: 0,
    conversion: 0,
    proxyMRR: 0
  });
  const [chartData, setChartData] = useState({
    planMix: [],
    funnel: [],
    eventsOverTime: [],
    recentCheckouts: []
  });

  const calculateMetrics = useCallback((usersData, eventsData) => {
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    const dateRangeStart = subDays(now, parseInt(dateRange));

    // Filter events by date range
    const filteredEvents = eventsData.filter(event => 
      isWithinInterval(parseISO(event.created_date), { start: dateRangeStart, end: now })
    );

    // Calculate metrics
    const totalUsers = usersData.length;
    const newUsersLast7d = usersData.filter(user => 
      isWithinInterval(parseISO(user.created_date), { start: sevenDaysAgo, end: now })
    ).length;

    const activePaid = usersData.filter(user => 
      user.subscription_status === 'active' && ['pro', 'elite'].includes(user.plan)
    ).length;

    const checkoutInits = filteredEvents.filter(e => e.action_type === 'checkout_init').length;
    const checkoutSuccesses = filteredEvents.filter(e => e.action_type === 'checkout_success').length;
    const conversion = checkoutInits > 0 ? (checkoutSuccesses / checkoutInits * 100) : 0;

    // Proxy MRR calculation
    const proUsers = usersData.filter(u => u.plan === 'pro' && u.subscription_status === 'active');
    const eliteUsers = usersData.filter(u => u.plan === 'elite' && u.subscription_status === 'active');
    
    const proMonthly = proUsers.filter(u => u.billing_interval === 'monthly').length * 19;
    const proAnnual = proUsers.filter(u => u.billing_interval === 'annual').length * (19 * 12 / 12); // Assuming 12 months for annual
    const eliteMonthly = eliteUsers.filter(u => u.billing_interval === 'monthly').length * 49;
    const eliteAnnual = eliteUsers.filter(u => u.billing_interval === 'annual').length * (39 * 12 / 12); // Assuming 12 months for annual

    const proxyMRR = proMonthly + proAnnual + eliteMonthly + eliteAnnual;

    setMetrics({
      totalUsers,
      newUsersLast7d,
      activePaid,
      conversion: Math.round(conversion * 10) / 10,
      proxyMRR
    });
  }, [dateRange]); // Dependencies for useCallback

  const generateChartData = useCallback((usersData, eventsData) => {
    const now = new Date();
    const dateRangeStart = subDays(now, parseInt(dateRange));

    // Plan Mix
    const planCounts = usersData.reduce((acc, user) => {
      acc[user.plan] = (acc[user.plan] || 0) + 1;
      return acc;
    }, {});

    const planMix = Object.entries(planCounts).map(([plan, count]) => ({
      name: plan.charAt(0).toUpperCase() + plan.slice(1),
      value: count,
      percentage: Math.round((count / usersData.length) * 100)
    }));

    // Events over time (last 14 days)
    const daysData = [];
    for (let i = parseInt(dateRange) - 1; i >= 0; i--) {
      const day = subDays(now, i);
      const dayEvents = eventsData.filter(event => {
        const eventDate = parseISO(event.created_date);
        return format(eventDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });

      daysData.push({
        date: format(day, 'MMM dd'),
        tier_cta_click: dayEvents.filter(e => e.action_type === 'tier_cta_click').length,
        checkout_init: dayEvents.filter(e => e.action_type === 'checkout_init').length,
        checkout_success: dayEvents.filter(e => e.action_type === 'checkout_success').length
      });
    }

    // Funnel data
    const filteredEvents = eventsData.filter(event => 
      isWithinInterval(parseISO(event.created_date), { start: dateRangeStart, end: now })
    );

    const pricingViews = filteredEvents.filter(e => e.action_type === 'pricing_toggle_change').length + 
                        filteredEvents.filter(e => e.action_type === 'tier_cta_click').length;
    const checkoutInits = filteredEvents.filter(e => e.action_type === 'checkout_init').length;
    const checkoutSuccesses = filteredEvents.filter(e => e.action_type === 'checkout_success').length;

    const funnel = [
      { stage: 'Pricing Views', count: pricingViews },
      { stage: 'Checkout Started', count: checkoutInits },
      { stage: 'Checkout Success', count: checkoutSuccesses }
    ];

    // Recent checkouts
    const recentCheckouts = filteredEvents
      .filter(e => e.action_type === 'checkout_success')
      .slice(0, 25)
      .map(event => ({
        id: event.id,
        timestamp: event.created_date,
        plan: event.metadata?.plan || 'unknown',
        billing: event.metadata?.billing || 'unknown',
        user_id: event.user_id
      }));

    setChartData({
      planMix,
      funnel,
      eventsOverTime: daysData,
      recentCheckouts
    });
  }, [dateRange]); // Dependencies for useCallback

  const loadGrowthData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersData, eventsData] = await Promise.all([
        User.list('', 1000),
        AuditEvent.list('-created_date', 500)
      ]);

      setUsers(usersData);
      setAuditEvents(eventsData);
      calculateMetrics(usersData, eventsData);
      generateChartData(usersData, eventsData);
    } catch (error) {
      console.error("Error loading growth data:", error);
    }
    setIsLoading(false);
  }, [calculateMetrics, generateChartData]); // Dependencies for useCallback: functions that are themselves memoized

  useEffect(() => {
    trackEvent('growth_view', { date_range: dateRange, plan_filter: planFilter });
    loadGrowthData();
  }, [dateRange, planFilter, loadGrowthData]);

  const handleFilterChange = (type, value) => {
    trackEvent('growth_filter_change', { filter_type: type, value });
    if (type === 'dateRange') {
      setDateRange(value);
    } else if (type === 'plan') {
      setPlanFilter(value);
    }
  };

  const getMetricChange = (current, previous) => {
    if (previous === 0) return { value: 0, trend: 'neutral' };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(change * 10) / 10),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy flex items-center gap-2">
            <TrendingUp className="w-8 h-8" />
            Growth Analytics
          </h1>
          <p className="text-slate-600 mt-1">User acquisition, conversion, and revenue metrics</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={planFilter} onValueChange={(value) => handleFilterChange('plan', value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="elite">Elite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              New Users (7d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.newUsersLast7d}</div>
            <p className="text-xs text-slate-500">of {metrics.totalUsers} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-600" />
              Active Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activePaid}</div>
            <p className="text-xs text-slate-500">
              {Math.round((metrics.activePaid / metrics.totalUsers) * 100)}% of users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversion}%</div>
            <p className="text-xs text-slate-500">checkout success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gold" />
              Proxy MRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.proxyMRR.toLocaleString()}</div>
            <p className="text-xs text-slate-500">estimated monthly</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Plan Mix */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData.planMix}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percentage}) => `${name} (${percentage}%)`}
                >
                  {chartData.planMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.funnel} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#1A2F4B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Events Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Events Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.eventsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="tier_cta_click" stroke="#B88B4A" name="CTA Clicks" />
              <Line type="monotone" dataKey="checkout_init" stroke="#64748b" name="Checkout Started" />
              <Line type="monotone" dataKey="checkout_success" stroke="#22c55e" name="Checkout Success" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Checkouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Successful Checkouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Timestamp</th>
                  <th className="text-left p-2">Plan</th>
                  <th className="text-left p-2">Billing</th>
                  <th className="text-left p-2">User ID</th>
                </tr>
              </thead>
              <tbody>
                {chartData.recentCheckouts.map((checkout) => (
                  <tr key={checkout.id} className="border-b hover:bg-slate-50">
                    <td className="p-2">
                      {format(parseISO(checkout.timestamp), 'MMM dd, HH:mm')}
                    </td>
                    <td className="p-2">
                      <Badge className={
                        checkout.plan === 'pro' ? 'bg-blue-100 text-blue-800' :
                        checkout.plan === 'elite' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-800'
                      }>
                        {checkout.plan}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">
                        {checkout.billing}
                      </Badge>
                    </td>
                    <td className="p-2 text-sm text-slate-600">
                      {checkout.user_id.slice(-8)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
