
import React, { useState, useEffect } from 'react';
import { PromoBanner as PromoBannerEntity } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { X, Tag } from 'lucide-react';
import { trackEvent } from '@/components/shared/Analytics';
import { usePromoStore } from './PromoStore';
import { PromoURL } from './PromoURL';
import { toast } from 'sonner';

const THEMES = {
  gradient: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white',
  'solid-dark': 'bg-slate-800 text-white',
  'solid-indigo': 'bg-indigo-700 text-white',
};

export default function PromoBanner({ surface }) {
  const [banner, setBanner] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const promoStore = usePromoStore();

  useEffect(() => {
    const fetchAndShowBanner = async () => {
      try {
        const allBanners = await PromoBannerEntity.filter({ enabled: true });
        
        const now = new Date();
        const activeBanner = allBanners.find(b => 
          b.surface.includes(surface) &&
          (!b.start_at || new Date(b.start_at) <= now) &&
          (!b.end_at || new Date(b.end_at) >= now)
        );

        if (activeBanner) {
          const dismissKey = `rezemai_promo_banner_dismissed_${activeBanner.id}`;
          const dismissedData = localStorage.getItem(dismissKey);

          if (dismissedData) {
            const { ts } = JSON.parse(dismissedData);
            const dismissDate = new Date(ts);
            const ttl = (activeBanner.dismiss_ttl_days || 14) * 24 * 60 * 60 * 1000;
            if (now.getTime() - dismissDate.getTime() < ttl) {
              return; // Dismissed within TTL, don't show
            }
          }
          
          setBanner(activeBanner);
          setIsVisible(true);
          trackEvent('promo_banner_impression', { 
            code: activeBanner.promo_code, 
            surface,
            banner_id: activeBanner.id
          });
        }
      } catch (error) {
        console.error("Failed to fetch promo banners:", error);
      }
    };

    fetchAndShowBanner();
  }, [surface]);

  const handleDismiss = () => {
    const dismissKey = `rezemai_promo_banner_dismissed_${banner.id}`;
    localStorage.setItem(dismissKey, JSON.stringify({ ts: new Date().toISOString() }));
    setIsVisible(false);
    trackEvent('promo_banner_dismiss', { code: banner.promo_code, banner_id: banner.id });
  };

  const handleApply = async () => {
    trackEvent('promo_banner_apply_click', { code: banner.promo_code, banner_id: banner.id });
    
    // Apply promo via store
    await promoStore.apply(banner.promo_code, 'pro', 'annual');

    // Update URL using PromoURL.set
    PromoURL.set(banner.promo_code);

    if (promoStore.error) {
        toast.warning("This code may only apply to select plans/billing.", {
            description: promoStore.error
        });
    } else {
        toast.success(`Promo code "${banner.promo_code}" applied!`);
        
        // Clean URL after successful application for better UX
        setTimeout(() => {
          PromoURL.remove({ replaceHistory: true });
        }, 2000);
    }

    // Scroll to pricing section
    if (banner.scroll_to === 'pricing') {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (!isVisible || !banner) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 p-2 md:p-3 ${THEMES[banner.theme]}`}>
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <Tag className="w-5 h-5 flex-shrink-0 hidden sm:block" />
          <div className="text-center md:text-left">
            <p className="font-semibold text-sm md:text-base">{banner.headline}</p>
            {banner.subcopy && <p className="text-xs md:text-sm text-white/80 hidden md:block">{banner.subcopy}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleApply}
            size="sm" 
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            {banner.cta_text}
          </Button>
          <Button 
            onClick={handleDismiss} 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
