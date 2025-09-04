
import React, { useState, useEffect } from "react";
import { Resume, InterviewSession, User, Subscription, Usage } from "@/api/entities"; // Added Subscription & Usage
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  FileText,
  Video,
  TrendingUp,
  Clock,
  Target,
  Plus,
  ChevronRight,
  Award,
  BarChart3,
  Zap,
  AlertCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { trackEvent } from '@/components/shared/Analytics';
import { monitorPerformance } from '@/components/shared/PerformanceMonitor'; // New import

import QuickActions from "../components/dashboard/QuickActions";
import RecentActivity from "../components/dashboard/RecentActivity";
import PerformanceMetrics from "../components/dashboard/PerformanceMetrics";
import GettingStarted from "../components/dashboard/GettingStarted";
import WelcomeModal from "../components/onboarding/WelcomeModal";
import ErrorDisplay from "../components/shared/ErrorDisplay"; // New import
import GuidedTour from "../components/dashboard/GuidedTour";
import { DashboardSkeleton } from '../components/shared/SkeletonLoader'; // New import

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [interviewSessions, setInterviewSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [subscription, setSubscription] = useState(null); // New state
  const [usage, setUsage] = useState({}); // New state
  const [stats, setStats] = useState({
    totalResumes: 0,
    averageAtsScore: 0,
    totalSessions: 0,
    averagePerformance: 0
  });
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    monitorPerformance('loadDashboardData', loadDashboardData);
    checkTourStatus(); // Add tour check
    trackEvent('page_view', { page: 'Dashboard' });
    
    // Check for successful payment
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      const sessionId = urlParams.get('session_id');
      if (sessionId) {
        trackEvent('checkout_success', { 
          session_id: sessionId,
          // We could fetch the plan/billing from the session, but for now just log success
        });
      }
      // Clean up URL to avoid re-triggering on refresh
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('payment');
      newUrl.searchParams.delete('session_id');
      window.history.replaceState({}, document.title, newUrl.toString());
    }
  }, []);

  const checkTourStatus = async () => {
    try {
      const currentUser = await User.me();
      if (currentUser && 
          ['not_started', 'started'].includes(currentUser.tour_first5_status) && 
          !currentUser.tour_first5_dismissed) {
        setShowTour(true);
        // Update status to 'started' if it was 'not_started'
        if (currentUser.tour_first5_status === 'not_started') {
          await User.updateMyUserData({ tour_first5_status: 'started' });
        }
      }
    } catch (error) {
      console.error('Error checking tour status:', error);
    }
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [userData, resumeData, sessionData, subscriptions, usageData] = await Promise.all([
        User.me(),
        Resume.list('-updated_date', 10),
        InterviewSession.list('-created_date', 10),
        Subscription.list('-created_date', 1), // Get latest subscription
        Usage.list('', 500) // Get usage data
      ]);

      setUser(userData);
      setResumes(resumeData);
      setInterviewSessions(sessionData);
      setSubscription(subscriptions[0]);
      
      const currentUsage = {
        resumes: resumeData.length,
        sessions: sessionData.length,
        ai_optimizations: usageData.filter(u => u.action_type === 'ai_optimization').length
      };
      setUsage(currentUsage);

      // Check if user needs onboarding
      if (!userData.onboarding_completed && resumeData.length === 0 && sessionData.length === 0) {
        setShowWelcomeModal(true);
      } else if (resumeData.length === 0 && sessionData.length === 0) {
        setIsNewUser(true);
      }

      // Calculate stats
      const avgAtsScore = resumeData.length > 0
        ? resumeData.reduce((sum, r) => sum + (r.ats_score || 0), 0) / resumeData.length
        : 0;

      const avgPerformance = sessionData.length > 0
        ? sessionData.reduce((sum, s) => sum + (s.overall_score || 0), 0) / sessionData.length
        : 0;

      setStats({
        totalResumes: resumeData.length,
        averageAtsScore: Math.round(avgAtsScore),
        totalSessions: sessionData.length,
        averagePerformance: Math.round(avgPerformance)
      });
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("We couldn't load your dashboard. Please refresh the page to try again.");
    }
    setIsLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleWelcomeComplete = () => {
    setShowWelcomeModal(false);
    trackEvent('onboarding_completed', { method: 'modal_close' });
    loadDashboardData(); // Refresh data after onboarding
  };

  const handleTourComplete = () => {
    setShowTour(false);
    trackEvent('tour_completed', { tour_id: 'first5' });
  };

  const handleTourDismiss = () => {
    setShowTour(false);
    trackEvent('tour_dismissed', { tour_id: 'first5' });
  };
  
  const canCreateResume = !subscription || subscription.usage_limits.resumes_limit === -1 || usage.resumes < subscription.usage_limits.resumes_limit;
  const canPracticeInterview = !subscription || subscription.usage_limits.interview_limit === -1 || usage.sessions < subscription.usage_limits.interview_limit;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorDisplay message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{background: 'linear-gradient(135deg, #F8F8F8 0%, rgba(224, 224, 224, 0.3) 50%, #F8F8F8 100%)'}}>
      {showTour && (
        <GuidedTour 
          onComplete={handleTourComplete}
          onDismiss={handleTourDismiss}
        />
      )}

      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeComplete}
      />

      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Welcome Header */}
        <div>
          <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl border bg-white/40 backdrop-blur-sm" style={{borderColor: 'rgba(224, 224, 224, 0.5)'}}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 font-poppins" style={{color: '#1A2F4B'}}>
                  {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Executive'}
                </h1>
                <p className="text-base md:text-lg max-w-2xl" style={{color: '#64748b'}}>
                  Ready to advance your career? Your AI-powered platform is here to help you land that next executive role.
                </p>
              </div>
              <div className="flex gap-3 self-stretch md:self-center">
                <Link to={canCreateResume ? createPageUrl("ResumeBuilder") : '#'} className="flex-1 md:flex-none">
                  <Button 
                    data-tour="import"
                    className="w-full px-4 md:px-6 py-3 rounded-xl shadow-lg transition-all duration-200" 
                    style={{backgroundColor: '#1A2F4B', color: 'white', boxShadow: '0 10px 25px rgba(26, 47, 75, 0.2)'}}
                    disabled={!canCreateResume}
                    title={!canCreateResume ? "You've reached your resume limit for this plan." : ""}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    <span className="hidden sm:inline">New Résumé</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </Link>
                <Link to={canPracticeInterview ? createPageUrl("InterviewCoach") : '#'} className="flex-1 md:flex-none">
                  <Button 
                    data-tour="interview"
                    variant="outline" 
                    className="w-full px-4 md:px-6 py-3 rounded-xl" 
                    style={{borderColor: '#E0E0E0'}}
                    disabled={!canPracticeInterview}
                    title={!canPracticeInterview ? "You've reached your interview session limit for this plan." : ""}
                  >
                    <Video className="w-5 h-5 mr-2" />
                    <span className="hidden sm:inline">Practice</span>
                    <span className="sm:hidden">Coach</span>
                  </Button>
                </Link>
              </div>
            </div>
            {!canCreateResume || !canPracticeInterview ? (
              <div className="mt-4 text-center md:text-left">
                <Badge variant="destructive">Usage Limit Reached</Badge>
                <span className="text-sm text-slate-600 ml-2">
                  Upgrade your plan to unlock unlimited access.
                  <Link to={createPageUrl("Profile")} className="font-semibold text-navy ml-1">Go to Profile</Link>
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {isNewUser && !isLoading && <GettingStarted />}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-tour="metrics">
          <Card className="relative overflow-hidden border-0 shadow-lg" style={{background: 'linear-gradient(135deg, rgba(26, 47, 75, 0.05) 0%, rgba(26, 47, 75, 0.1) 100%)', boxShadow: '0 10px 25px rgba(26, 47, 75, 0.05)'}}>
            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 rounded-full" style={{backgroundColor: 'rgba(26, 47, 75, 0.1)'}} />
            <CardHeader className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold" style={{color: 'rgba(26, 47, 75, 0.7)'}}>Total Résumés</p>
                  <CardTitle className="text-3xl font-bold mt-1 font-poppins" style={{color: '#1A2F4B'}}>
                    {isLoading ? <Skeleton className="h-8 w-16" /> : stats.totalResumes}
                  </CardTitle>
                </div>
                <div className="p-3 rounded-xl" style={{backgroundColor: 'rgba(26, 47, 75, 0.1)'}}>
                  <FileText className="w-6 h-6" style={{color: '#1A2F4B'}} />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg" style={{background: 'linear-gradient(135deg, rgba(184, 139, 74, 0.1) 0%, rgba(184, 139, 74, 0.2) 100%)', boxShadow: '0 10px 25px rgba(184, 139, 74, 0.05)'}}>
            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 rounded-full" style={{backgroundColor: 'rgba(184, 139, 74, 0.2)'}} />
            <CardHeader className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold" style={{color: 'rgba(184, 139, 74, 0.8)'}}>Avg ATS Score</p>
                  <CardTitle className="text-3xl font-bold mt-1 font-poppins" style={{color: '#1A2F4B'}}>
                    {isLoading ? <Skeleton className="h-8 w-16" /> : `${stats.averageAtsScore}%`}
                  </CardTitle>
                </div>
                <div className="p-3 rounded-xl" style={{backgroundColor: 'rgba(184, 139, 74, 0.2)'}}>
                  <Target className="w-6 h-6" style={{color: 'rgba(184, 139, 74, 0.8)'}} />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg" style={{background: 'linear-gradient(135deg, #F8FAFC 0%, rgba(148, 163, 184, 0.1) 100%)', boxShadow: '0 10px 25px rgba(148, 163, 184, 0.05)'}}>
            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 rounded-full" style={{backgroundColor: 'rgba(203, 213, 225, 0.3)'}} />
            <CardHeader className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold" style={{color: '#64748b'}}>Practice Sessions</p>
                  <CardTitle className="text-3xl font-bold mt-1 font-poppins" style={{color: '#1A2F4B'}}>
                    {isLoading ? <Skeleton className="h-8 w-16" /> : stats.totalSessions}
                  </CardTitle>
                </div>
                <div className="p-3 rounded-xl" style={{backgroundColor: 'rgba(203, 213, 225, 0.5)'}}>
                  <Video className="w-6 h-6" style={{color: '#64748b'}} />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg" style={{background: 'linear-gradient(135deg, #F0FDF4 0%, rgba(34, 197, 94, 0.1) 100%)', boxShadow: '0 10px 25px rgba(34, 197, 94, 0.05)'}}>
            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 rounded-full" style={{backgroundColor: 'rgba(187, 247, 208, 0.3)'}} />
            <CardHeader className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold" style={{color: '#16a34a'}}>Performance</p>
                  <CardTitle className="text-3xl font-bold mt-1 font-poppins" style={{color: '#1A2F4B'}}>
                    {isLoading ? <Skeleton className="h-8 w-16" /> : `${stats.averagePerformance}%`}
                  </CardTitle>
                </div>
                <div className="p-3 rounded-xl" style={{backgroundColor: 'rgba(187, 247, 208, 0.5)'}}>
                  <TrendingUp className="w-6 h-6" style={{color: '#16a34a'}} />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <QuickActions />
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <RecentActivity
              resumes={resumes}
              sessions={interviewSessions}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Performance Insights */}
        <PerformanceMetrics
          resumes={resumes}
          sessions={interviewSessions}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
