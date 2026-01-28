

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  PenSquare,
  CalendarClock,
  BarChart3,
  Inbox,
  FolderOpen,
  User,
  Settings,
  LifeBuoy,
  Menu,
  X,
  Shield,
  Wrench,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { PromoURL } from "@/components/marketing/PromoURL";
import { BillingURL } from "@/components/subscription/BillingURL";
import { toast } from "sonner";
import Meta from "@/components/shared/Meta";
import { PaywallProvider } from "@/components/subscription/PaywallProvider";

const globalStyles = `
  :root {
    /* Brand + surfaces */
    --bg: #0b1020;
    --surf-0: rgba(255,255,255,0.00);
    --surf-1: rgba(255,255,255,0.04);
    --surf-2: rgba(255,255,255,0.06);
    --surf-3: rgba(255,255,255,0.10);

    /* Text */
    --text-100: #ffffff;
    --text-80: rgba(255,255,255,0.80);
    --text-70: rgba(255,255,255,0.70);
    --text-60: rgba(255,255,255,0.60);

    /* Single accent color - professional, operational */
    --accent: #3bf3f6;

    /* Borders & rings */
    --bd-weak: rgba(255,255,255,0.12);
    --bd-strong: rgba(255,255,255,0.24);
    --ring: #93c5fd; /* sky-300 */

    /* Radii */
    --r-md: 12px;
    --r-lg: 16px;
    --r-xl: 20px;
    --r-2xl: 24px;

    /* Shadows */
    --sh-soft: 0 6px 24px rgba(0,0,0,0.24);
    --sh-card: 0 10px 30px rgba(0,0,0,0.35);

    /* Motion */
    --e-1: cubic-bezier(.2,.8,.2,1);
    --t-fast: 160ms;
    --t-base: 220ms;
    --t-slow: 320ms;

    /* Spacing scale */
    --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px;
    --s-5: 20px; --s-6: 24px; --s-8: 32px; --s-10: 40px; --s-12: 48px;
  }

  /* Base reset + background */
  html, body { background: var(--bg); color: var(--text-100); }
  .container-7xl { max-width: 80rem; margin: 0 auto; padding: 0 1rem; }

  /* Typography scale (system stack; swap later if desired) */
  :root {
    --fs-xs: 12px; --fs-sm: 14px; --fs-md: 16px; --fs-lg: 18px;
    --fs-xl: 20px; --fs-2xl: 24px; --fs-3xl: 30px; --fs-4xl: 36px; --fs-5xl: 48px;
  }

  .h1 { font-size: var(--fs-4xl); line-height: 1.15; font-weight: 700; letter-spacing: -0.01em; }
  .h2 { font-size: var(--fs-3xl); line-height: 1.2; font-weight: 700; }
  .h3 { font-size: var(--fs-2xl); line-height: 1.25; font-weight: 600; }
  .lead { color: var(--text-80); font-size: var(--fs-lg); line-height: 1.6; }

  /* --- Standardized Component Styles --- */
  .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius: var(--r-lg); padding: 10px 14px; font-weight:600; transition: transform var(--t-fast) var(--e-1), background var(--t-base) var(--e-1), border-color var(--t-base) var(--e-1), opacity var(--t-base) var(--e-1); }
  .btn:active { transform: translateY(1px); }

  .btn-primary { background: #ffffff; color: #0b1020; }
  .btn-primary:hover { opacity: .92; }
  .btn-outline { border:1px solid var(--bd-weak); color: var(--text-100); background: var(--surf-1); }
  .btn-outline:hover { border-color: var(--bd-strong); }
  .btn-ghost { color: var(--text-80); background: transparent; }
  .btn-pill { border-radius: 999px; padding: 8px 14px; }

  :where(button, a, input, textarea, [role="button"], [tabindex]):focus-visible {
    outline: 2px solid transparent !important;
    box-shadow: 0 0 0 3px var(--ring) !important;
    border-radius: var(--r-lg) !important;
  }

  .input { width:100%; background: var(--surf-1); color: var(--text-100); border:1px solid var(--bd-weak); border-radius: var(--r-lg); padding: 10px 12px; transition: border-color var(--t-base) var(--e-1), background var(--t-base) var(--e-1); }
  .input::placeholder { color: var(--text-60); }
  .input:focus { border-color: var(--bd-strong); background: var(--surf-2); }

  .card { background: var(--surf-2); border: 1px solid var(--bd-weak); border-radius: var(--r-2xl); box-shadow: var(--sh-card); }
  .card-quiet { background: var(--surf-1); }
  .card-header { display:flex; align-items:center; justify-content:space-between; padding: var(--s-6); border-bottom:1px solid var(--bd-weak); }
  .card-body { padding: var(--s-6); }
  .card-hover { transition: transform var(--t-base) var(--e-1), border-color var(--t-base) var(--e-1), background var(--t-base) var(--e-1); }
  .card-hover:hover { transform: translateY(-2px); border-color: var(--bd-strong); background: var(--surf-3); }

  .accent-grad { background: linear-gradient(135deg, var(--acc-a), var(--acc-b), var(--acc-c)); -webkit-background-clip: text; color: transparent; }

  .badge { display:inline-flex; align-items:center; gap:6px; padding: 4px 8px; border-radius: 999px; border:1px solid var(--bd-weak); background: var(--surf-1); font-size: var(--fs-sm); color: var(--text-80); }
  .badge-new { border-color: rgba(147,197,253,.6); color:#e0f2fe; }

  .hr { height:1px; background: var(--bd-weak); width:100%; }

  .fade-in { animation: fadeIn var(--t-base) var(--e-1) both; }
  @keyframes fadeIn { from { opacity:0; transform: translateY(4px);} to { opacity:1; transform:none;} }
  .scale-pop { animation: pop var(--t-fast) var(--e-1) both; }
  @keyframes pop { from { opacity:.6; transform: scale(.98);} to { opacity:1; transform: scale(1);} }
`;

// DISABLED FOR PRODUCTION: Health endpoint doesn't exist yet
// StatusBadge component - Re-enable when /health endpoint is created
/*
const StatusBadge = () => {
  const [status, setStatus] = useState('operational');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('https://api.rezemai.com/health', {
          method: 'HEAD',
          cache: 'no-cache'
        });
        setStatus(response.ok ? 'operational' : 'degraded');
      } catch (error) {
        setStatus('degraded');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    operational: { color: 'bg-green-500', text: 'Operational' },
    degraded: { color: 'bg-yellow-500', text: 'Degraded' },
    outage: { color: 'bg-red-500', text: 'Outage' }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 px-2 py-1 rounded text-xs">
          <div className={`w-2 h-2 rounded-full ${statusConfig[status].color}`}></div>
          <span className="text-slate-600">{statusConfig[status].text}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>System Status</p>
      </TooltipContent>
    </Tooltip>
  );
};
*/

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    // Initialize both URL utilities
    PromoURL.syncFromCurrentUrl();
    BillingURL.syncFromCurrentUrl();

    if (!isLoaded) return; // Wait for Clerk to load

    // Clean URL once user is authenticated and in-app
    if (clerkUser && PromoURL.has() && !['Landing', 'Signin', 'Checkout'].includes(currentPageName)) {
      PromoURL.remove({ replaceHistory: true });
    }

    // Check if onboarding is needed (stored in Clerk metadata)
    const needsOnboarding = clerkUser?.publicMetadata?.onboardingComplete === false;
    if (clerkUser && needsOnboarding && !['Onboarding', 'Signin', 'Landing', 'LegalTerms', 'LegalPrivacy'].includes(currentPageName)) {
      navigate(createPageUrl('Onboarding'));
      return;
    }

    // Redirect to landing if not signed in and not on a public page
    const publicPages = ['Landing', 'Signin', 'LegalTerms', 'LegalPrivacy', 'ReferralRedirect', 'CampaignRedirect', 'Status', 'Changelog', 'SupportSLA'];
    if (!isSignedIn && !publicPages.includes(currentPageName)) {
      navigate(createPageUrl('Landing'));
    }
  }, [clerkUser, isLoaded, isSignedIn, currentPageName, navigate]);

  const restartTour = useCallback(async () => {
    try {
      if (clerkUser) {
        // Update Clerk user metadata to reset tour
        await clerkUser.update({
          publicMetadata: {
            ...clerkUser.publicMetadata,
            guided_tour_complete: false
          }
        });
        navigate(0); // Refreshes the page to restart tour state
        toast.info("Guided tour has been reset.");
      }
    } catch (error) {
      console.error("Failed to restart tour:", error);
      toast.error("Could not restart the tour.");
    }
  }, [clerkUser, navigate]);

  const navLinks = useMemo(() => [
    { name: "Dashboard", href: createPageUrl("Dashboard"), icon: LayoutDashboard },
    { name: "Composer", href: createPageUrl("Composer"), icon: PenSquare },
    { name: "Scheduler", href: createPageUrl("Scheduler"), icon: CalendarClock },
    { name: "Analytics", href: createPageUrl("Analytics"), icon: BarChart3 },
    { name: "Inbox", href: createPageUrl("Inbox"), icon: Inbox },
    { name: "Assets", href: createPageUrl("Assets"), icon: FolderOpen },
    { name: "Profile", href: createPageUrl("Profile"), icon: User },
  ], []);

  const footerLinks = useMemo(() => [
    { name: "Help & Support", href: createPageUrl("Help"), icon: LifeBuoy },
    { name: "Account Settings", href: createPageUrl("Account"), icon: Settings },
  ], []);

  const adminLinks = useMemo(() => [
    { name: "Admin Dashboard", href: createPageUrl("AdminDashboard"), icon: Shield },
    { name: "Webhook Tools", href: createPageUrl("WebhookTools"), icon: Wrench },
  ], []);

  // Don't show nav for public pages
  const publicPages = ['Landing', 'Signin', 'LegalTerms', 'LegalPrivacy', 'ReferralRedirect', 'CampaignRedirect', 'Status', 'Changelog', 'SupportSLA'];
  if (publicPages.includes(currentPageName)) {
    return (
      <>
        <Meta />
        <TooltipProvider>
          <PaywallProvider>
            <style>{globalStyles}</style>
            {children}
          </PaywallProvider>
        </TooltipProvider>
      </>
    );
  }

  // Don't show nav during onboarding
  if (currentPageName === 'Onboarding') {
    return (
      <>
        <Meta />
        <TooltipProvider>
          <PaywallProvider>
            <style>{globalStyles}</style>
            {children}
          </PaywallProvider>
        </TooltipProvider>
      </>
    );
  }

  // Mobile navigation
  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" style={{ color: 'var(--text-100)' }}>
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0" style={{ background: 'var(--surf-1)', borderLeft: '1px solid var(--bd-weak)' }}>
        <div className="flex h-full flex-col">
          <div className="p-6" style={{ borderBottom: '1px solid var(--bd-weak)' }}>
            <div className="flex items-center gap-2">
              <span
                className="font-semibold tracking-tight"
                style={{ color: 'var(--text-100)' }}
              >
                SoshlOps
              </span>
            </div>
            {clerkUser && (
              <div className="text-sm mt-2" style={{ color: 'var(--text-70)' }}>{clerkUser.fullName}</div>
            )}
          </div>

          <nav className="flex-1 p-6">
            <div className="space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentPageName === link.name.replace(' ', '');
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                    style={{
                      background: isActive ? 'var(--surf-3)' : 'transparent',
                      color: isActive ? 'var(--text-100)' : 'var(--text-80)',
                      border: isActive ? '1px solid var(--bd-strong)' : '1px solid transparent'
                    }}
                    onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = 'var(--surf-2)')}
                    onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
                  >
                    <Icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {clerkUser?.publicMetadata?.role === 'admin' && (
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--bd-weak)' }}>
                <div className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-60)' }}>
                  Admin
                </div>
                <div className="space-y-2">
                  {adminLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = currentPageName === link.name.replace(' ', '').replace(' ', '');
                    return (
                      <Link
                        key={link.name}
                        to={link.href}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                        style={{
                          background: isActive ? 'var(--surf-3)' : 'transparent',
                          color: isActive ? 'var(--text-100)' : 'var(--text-80)',
                          border: isActive ? '1px solid var(--bd-strong)' : '1px solid transparent'
                        }}
                        onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = 'var(--surf-2)')}
                        onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
                      >
                        <Icon className="w-5 h-5" />
                        {link.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          <div className="p-6" style={{ borderTop: '1px solid var(--bd-weak)' }}>
            <div className="space-y-2">
              {footerLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentPageName === link.name.replace(' ', '').replace(' ', '').replace('&', '');
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                    style={{
                      background: isActive ? 'var(--surf-3)' : 'transparent',
                      color: isActive ? 'var(--text-100)' : 'var(--text-80)',
                      border: isActive ? '1px solid var(--bd-strong)' : '1px solid transparent'
                    }}
                    onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = 'var(--surf-2)')}
                    onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
                  >
                    <Icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                );
              })}
              <button
                onClick={restartTour}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-80)', background: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surf-2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <HelpCircle className="w-5 h-5 mr-3" />
                Restart Tour
              </button>
            </div>

            {/* DISABLED: StatusBadge - Health endpoint doesn't exist yet */}
            {/* <div className="mt-4 pt-4 border-t">
              <StatusBadge />
            </div> */}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <Meta />
      <TooltipProvider>
        <PaywallProvider>
          <style>{globalStyles}</style>
          <div className="flex h-screen" style={{ background: 'var(--bg)' }}>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col" style={{ background: 'var(--surf-1)', borderRight: '1px solid var(--bd-weak)' }}>
              <div className="p-6" style={{ borderBottom: '1px solid var(--bd-weak)' }}>
                <div className="flex items-center gap-2">
                  <span
                    className="font-semibold tracking-tight"
                    style={{ color: 'var(--text-100)' }}
                  >
                    SoshlOps
                  </span>
                </div>
                {clerkUser && (
                  <div className="text-sm mt-2" style={{ color: 'var(--text-70)' }}>{clerkUser.fullName}</div>
                )}
              </div>

              <nav className="flex-1 p-6">
                <div className="space-y-2">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = currentPageName === link.name.replace(' ', '');
                    return (
                      <Link
                        key={link.name}
                        to={link.href}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                        style={{
                          background: isActive ? 'var(--surf-3)' : 'transparent',
                          color: isActive ? 'var(--text-100)' : 'var(--text-80)',
                          border: isActive ? '1px solid var(--bd-strong)' : '1px solid transparent'
                        }}
                        onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = 'var(--surf-2)')}
                        onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
                      >
                        <Icon className="w-5 h-5" />
                        {link.name}
                      </Link>
                    );
                  })}
                </div>

                {clerkUser?.publicMetadata?.role === 'admin' && (
                  <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--bd-weak)' }}>
                    <div className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-60)' }}>
                      Admin
                    </div>
                    <div className="space-y-2">
                      {adminLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = currentPageName === link.name.replace(' ', '').replace(' ', '');
                        return (
                          <Link
                            key={link.name}
                            to={link.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                            style={{
                              background: isActive ? 'var(--surf-3)' : 'transparent',
                              color: isActive ? 'var(--text-100)' : 'var(--text-80)',
                              border: isActive ? '1px solid var(--bd-strong)' : '1px solid transparent'
                            }}
                            onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = 'var(--surf-2)')}
                            onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
                          >
                            <Icon className="w-5 h-5" />
                            {link.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </nav>

              <div className="p-6" style={{ borderTop: '1px solid var(--bd-weak)' }}>
                <div className="space-y-2">
                  {footerLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = currentPageName === link.name.replace(' ', '').replace(' ', '').replace('&', '');
                    return (
                      <Link
                        key={link.name}
                        to={link.href}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                        style={{
                          background: isActive ? 'var(--surf-3)' : 'transparent',
                          color: isActive ? 'var(--text-100)' : 'var(--text-80)',
                          border: isActive ? '1px solid var(--bd-strong)' : '1px solid transparent'
                        }}
                        onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = 'var(--surf-2)')}
                        onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
                      >
                        <Icon className="w-5 h-5" />
                        {link.name}
                      </Link>
                    );
                  })}
                  <button
                    onClick={restartTour}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                    style={{ color: 'var(--text-80)', background: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surf-2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <HelpCircle className="w-5 h-5" />
                    Restart Tour
                  </button>
                </div>

                {/* DISABLED: StatusBadge - Health endpoint doesn't exist yet */}
                {/* <div className="mt-4 pt-4 border-t border-gray-200">
                  <StatusBadge />
                </div> */}
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Mobile header */}
              <header className="md:hidden flex items-center justify-between p-4" style={{ background: 'var(--surf-1)', borderBottom: '1px solid var(--bd-weak)' }}>
                <MobileNav />
                <div className="font-semibold" style={{ color: 'var(--text-100)' }}>SoshlOps</div>
                <div className="w-10" /> {/* Spacer for centering */}
              </header>

              {/* Page content */}
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </PaywallProvider>
      </TooltipProvider>
    </>
  );
}

