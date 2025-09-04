
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChangelogEntry } from '@/api/entities';
import { usePromoStore } from './PromoStore';
import { trackEvent } from '../shared/Analytics';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, X, Tag } from 'lucide-react';
import { throttle } from 'lodash';

const slugify = (text) => {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
};

const PromoChip = ({ promo, onClick }) => (
  <button
    onClick={onClick}
    role="link"
    aria-label={`Promo ${promo.code} - ${promo.message}`}
    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 border border-indigo-400/50 rounded-full text-xs text-white hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
  >
    <Tag className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
    <span className="truncate">Promo {promo.code}</span>
    <ChevronRight className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />
  </button>
);

const NewChip = ({ item, onClick }) => (
  <button
    onClick={onClick}
    role="link"
    aria-label={`NEW: ${item.title} — view details`}
    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 border border-white/15 rounded-full text-xs text-white hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
  >
    <span className="font-bold text-green-400 flex-shrink-0">NEW</span>
    <span className="truncate">{item.title}</span>
    <ChevronRight className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />
  </button>
);

export default function MobileMiniBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [changelogItem, setChangelogItem] = useState(null);
  const promo = usePromoStore();
  const location = useLocation();
  const navigate = useNavigate();
  const impressionTracked = useRef(false);

  useEffect(() => {
    const dismissedTimestamp = localStorage.getItem('rezemai_minibar_dismissed');
    if (dismissedTimestamp) {
      const dismissedDate = new Date(dismissedTimestamp);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      if (dismissedDate > sevenDaysAgo) {
        setIsDismissed(true);
        return;
      }
    }
    setIsDismissed(false);

    const fetchLatestItem = async () => {
      try {
        const fortyFiveDaysAgo = new Date();
        fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);
        
        const entries = await ChangelogEntry.list('-date', 20);
        const recentEntries = entries.filter(e => new Date(e.date) > fortyFiveDaysAgo);
        
        const featureItem = recentEntries.find(e => e.tag === 'feature');
        setChangelogItem(featureItem || recentEntries[0] || null);

      } catch (error) {
        console.error("Failed to fetch changelog item for minibar:", error);
      }
    };
    fetchLatestItem();
  }, []);
  
  useEffect(() => {
    if (!impressionTracked.current && !isDismissed && (promo.valid || changelogItem)) {
      trackEvent('minibar_impression', { 
        promo: promo.valid ? promo.code : null, 
        item: changelogItem?.title || null 
      });
      impressionTracked.current = true;
    }
  }, [isDismissed, promo.valid, promo.code, changelogItem]);

  const handleScroll = useCallback(throttle(() => {
    if (window.scrollY > 400) {
      setIsVisible(true);
    } else if (window.scrollY < 200) {
      setIsVisible(false);
    }
  }, 100), []);

  useEffect(() => {
    if (isDismissed) return;
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed, handleScroll]);

  const handleDismiss = () => {
    localStorage.setItem('rezemai_minibar_dismissed', new Date().toISOString());
    setIsVisible(false);
    setIsDismissed(true);
    trackEvent('minibar_dismiss');
  };

  const handlePromoClick = () => {
    trackEvent('minibar_click', { target: 'promo', code: promo.code });
    const url = new URL(window.location);
    url.searchParams.set('promo', promo.code);
    window.history.pushState({}, '', url);
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleNewClick = () => {
    trackEvent('minibar_click', { target: 'new', title: changelogItem.title });
    const anchor = slugify(changelogItem.title);
    navigate(`/app/Changelog#${anchor}`);
  };
  
  const showOnPage = location.pathname === '/' || location.hash === '#pricing';
  if (isDismissed || !showOnPage || (!promo.valid && !changelogItem)) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Updates and offers"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
    >
      <div className="bg-[#0b1020]/90 backdrop-blur-md rounded-t-2xl shadow-2xl shadow-black/50 p-3" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
        <div className="relative flex items-center gap-2">
          {promo.valid && changelogItem ? (
            <>
              <PromoChip promo={promo} onClick={handlePromoClick} />
              <NewChip item={changelogItem} onClick={handleNewClick} />
            </>
          ) : promo.valid ? (
             <div className="w-full px-8"><PromoChip promo={promo} onClick={handlePromoClick} /></div>
          ) : changelogItem ? (
             <div className="w-full px-8"><NewChip item={changelogItem} onClick={handleNewClick} /></div>
          ) : null}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            aria-label="Dismiss mini bar"
            className="absolute -top-1 -right-1 h-7 w-7 text-white/60 hover:text-white hover:bg-white/10 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
