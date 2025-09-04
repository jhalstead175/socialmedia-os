import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChangelogEntry } from '@/api/entities';
import { usePromoStore } from './PromoStore';
import { trackEvent } from '../shared/Analytics';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, Tag, Sparkles } from 'lucide-react';
import { throttle } from 'lodash';

const slugify = (text) => {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
};

const SHOW_DELAY = 6000; // 6 seconds
const AUTO_HIDE_DELAY = 6000; // 6 seconds
const MAX_LIFETIME = 12000; // 12 seconds
const HOVER_INTENT_DELAY = 800; // 800ms
const TTL_DAYS = 7;

export default function DesktopPromoToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [changelogItem, setChangelogItem] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const promo = usePromoStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const showTimer = useRef(null);
  const hideTimer = useRef(null);
  const maxLifetimeTimer = useRef(null);
  const hoverIntentTimer = useRef(null);
  const hasShownThisSession = useRef(false);
  const impressionTracked = useRef(false);

  // Check if should show toast
  const shouldShow = useCallback(() => {
    // Desktop only
    if (window.innerWidth < 1024) return false;
    
    // Session guard
    if (hasShownThisSession.current) return false;
    
    // Check dismiss TTL
    const dismissUntil = localStorage.getItem('rezemai_toast_dismiss_until');
    if (dismissUntil && new Date(dismissUntil) > new Date()) return false;
    
    // Check if MobileMiniBar was recently shown
    if (window.__rezemaiMiniBarShownAt) {
      const timeSinceMiniBar = Date.now() - window.__rezemaiMiniBarShownAt;
      if (timeSinceMiniBar < 10000) return false; // 10 seconds
    }
    
    // Must have promo or recent changelog
    return promo.valid || changelogItem;
  }, [promo.valid, changelogItem]);

  // Fetch changelog item
  useEffect(() => {
    const fetchChangelogItem = async () => {
      try {
        const fortyFiveDaysAgo = new Date();
        fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);
        
        const entries = await ChangelogEntry.list('-date', 20);
        const recentEntries = entries.filter(e => new Date(e.date) > fortyFiveDaysAgo);
        
        // Prefer feature entries (NEW)
        const featureItem = recentEntries.find(e => e.tag === 'feature');
        setChangelogItem(featureItem || recentEntries[0] || null);
      } catch (error) {
        console.error("Failed to fetch changelog for toast:", error);
      }
    };

    fetchChangelogItem();
  }, []);

  // Primary trigger (timed)
  useEffect(() => {
    if (!shouldShow()) return;

    const triggerShow = () => {
      if (shouldShow()) {
        setIsVisible(true);
        hasShownThisSession.current = true;
        localStorage.setItem('rezemai_toast_last_shown_at', new Date().toISOString());
      }
    };

    if (window.requestIdleCallback) {
      showTimer.current = window.requestIdleCallback(() => {
        setTimeout(triggerShow, SHOW_DELAY);
      });
    } else {
      showTimer.current = setTimeout(triggerShow, SHOW_DELAY);
    }

    return () => {
      if (showTimer.current) {
        if (window.cancelIdleCallback) {
          window.cancelIdleCallback(showTimer.current);
        } else {
          clearTimeout(showTimer.current);
        }
      }
    };
  }, [shouldShow]);

  // Secondary trigger (hover intent on pricing cards)
  useEffect(() => {
    if (!shouldShow()) return;

    const handlePricingHover = throttle((e) => {
      const pricingCard = e.target.closest('[data-pricing-card]');
      if (!pricingCard) return;

      hoverIntentTimer.current = setTimeout(() => {
        if (shouldShow()) {
          setIsVisible(true);
          hasShownThisSession.current = true;
          localStorage.setItem('rezemai_toast_last_shown_at', new Date().toISOString());
        }
      }, HOVER_INTENT_DELAY);
    }, 200);

    const handlePricingLeave = () => {
      if (hoverIntentTimer.current) {
        clearTimeout(hoverIntentTimer.current);
      }
    };

    document.addEventListener('mouseover', handlePricingHover);
    document.addEventListener('mouseleave', handlePricingLeave);

    return () => {
      document.removeEventListener('mouseover', handlePricingHover);
      document.removeEventListener('mouseleave', handlePricingLeave);
      if (hoverIntentTimer.current) {
        clearTimeout(hoverIntentTimer.current);
      }
    };
  }, [shouldShow]);

  // Auto-hide timer management
  useEffect(() => {
    if (!isVisible) return;

    // Track impression
    if (!impressionTracked.current) {
      trackEvent('desktop_promo_toast_impression', {
        promo: promo.valid ? promo.code : null,
        changelog_item: changelogItem?.title || null
      });
      impressionTracked.current = true;
    }

    // Start auto-hide timer
    const startHideTimer = () => {
      hideTimer.current = setTimeout(() => {
        setIsVisible(false);
      }, AUTO_HIDE_DELAY);
    };

    // Max lifetime timer
    maxLifetimeTimer.current = setTimeout(() => {
      setIsVisible(false);
    }, MAX_LIFETIME);

    if (!isHovered) {
      startHideTimer();
    }

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (maxLifetimeTimer.current) clearTimeout(maxLifetimeTimer.current);
    };
  }, [isVisible, isHovered, promo.valid, promo.code, changelogItem]);

  // Handle hover state changes
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Timer will restart via useEffect dependency
  };

  const handleClose = () => {
    setIsVisible(false);
    trackEvent('desktop_promo_toast_close');
  };

  const handleDontShowAgain = () => {
    const dismissUntil = new Date();
    dismissUntil.setDate(dismissUntil.getDate() + TTL_DAYS);
    localStorage.setItem('rezemai_toast_dismiss_until', dismissUntil.toISOString());
    setIsVisible(false);
    trackEvent('desktop_promo_toast_dismiss');
  };

  const handleApplyPromo = () => {
    trackEvent('desktop_promo_toast_cta_click', { 
      action: 'apply_promo', 
      code: promo.code 
    });
    
    // Update URL with promo
    const url = new URL(window.location);
    url.searchParams.set('promo', promo.code);
    window.history.pushState({}, '', url);
    
    // Scroll to pricing
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    setIsVisible(false);
  };

  const handleViewDetails = () => {
    trackEvent('desktop_promo_toast_cta_click', { 
      action: 'view_details', 
      title: changelogItem?.title 
    });
    
    const anchor = changelogItem ? slugify(changelogItem.title) : '';
    const url = `/app/Changelog${anchor ? '#' + anchor : ''}`;
    navigate(url);
    setIsVisible(false);
  };

  // Don't render if conditions not met
  if (!isVisible || !shouldShow()) {
    return null;
  }

  const hasPromo = promo.valid;
  const title = hasPromo ? "Limited offer" : "What's new";
  const icon = hasPromo ? Tag : Sparkles;
  const IconComponent = icon;

  return (
    <div
      className="fixed top-5 right-5 z-50 w-80 lg:w-96"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="dialog"
      aria-labelledby="toast-title"
      aria-describedby="toast-description"
    >
      <div className="bg-[#0b1020]/95 backdrop-blur-md border border-white/12 rounded-2xl shadow-2xl shadow-black/25 p-4 transition-all duration-300 ease-out">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400"></div>
            <h3 id="toast-title" className="text-sm font-semibold text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-white/50 hover:text-white/80 transition-colors p-1"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Row */}
        <div id="toast-description" className="mb-4">
          {hasPromo ? (
            <div className="flex items-center gap-2 text-white">
              <IconComponent className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span className="text-sm">
                Promo <span className="font-semibold">{promo.code}</span> — {promo.message}
              </span>
            </div>
          ) : changelogItem ? (
            <div className="flex items-center gap-2 text-white">
              <IconComponent className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-sm">
                <span className="font-bold text-green-400">NEW</span> · {changelogItem.title}
              </span>
            </div>
          ) : null}
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between gap-3">
          <Button
            onClick={hasPromo ? handleApplyPromo : handleViewDetails}
            size="sm"
            className="bg-white text-slate-900 hover:bg-white/90 font-medium"
          >
            {hasPromo ? "Apply code" : "View details"}
          </Button>
          
          <button
            onClick={handleDontShowAgain}
            className="text-xs text-white/60 hover:text-white/80 transition-colors"
          >
            Don't show again
          </button>
        </div>
      </div>
    </div>
  );
}