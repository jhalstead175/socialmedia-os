import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ArrowRight, HelpCircle } from 'lucide-react';
import { User } from '@/api/entities';
import { trackEvent } from '@/components/shared/Analytics';

const tourSteps = [
  {
    id: 'ob-import',
    title: 'Start by importing',
    body: 'Paste your resume text (fastest) or import from a file. We\'ll parse sections automatically.',
    anchor: '[data-tour="ob-import"]',
    fallback: 'button:contains("Paste your resume"), button:contains("Import")',
    placement: 'auto'
  },
  {
    id: 'ob-tailor',
    title: 'Tailor to a real job',
    body: 'Paste a job description and generate keyword-aware bullets with suggested metrics. You choose what to apply.',
    anchor: '[data-tour="ob-tailor"]',
    fallback: 'button:contains("Paste the job description"), button:contains("Generate Targeted Bullets")',
    placement: 'auto'
  },
  {
    id: 'ob-template',
    title: 'Pick a clean template',
    body: 'Select a template that parses cleanly in ATS, then continue to export or do the 3-question warmup drill.',
    anchor: '[data-tour="ob-template"]',
    fallback: 'button:contains("Use this template"), [class*="card"]:contains("Executive"), [class*="card"]:contains("Legal"), [class*="card"]:contains("Creative")',
    placement: 'auto'
  }
];

export default function OnboardingMicroTour({ onComplete, onDismiss }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [anchorElement, setAnchorElement] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [showAsModal, setShowAsModal] = useState(false);

  const currentStepData = tourSteps[currentStep];

  const clearHighlight = useCallback(() => {
    if (anchorElement) {
      anchorElement.style.position = '';
      anchorElement.style.zIndex = '';
      anchorElement.style.boxShadow = '';
      anchorElement.style.borderRadius = '';
      anchorElement.style.transition = '';
    }
  }, [anchorElement]);

  const handleNext = useCallback(async () => {
    trackEvent('tour_step_next', { 
      tour: 'ob_micro', 
      step_id: currentStepData.id,
      step_number: currentStep + 1
    });
    
    clearHighlight();
    
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finish tour
      try {
        await User.updateMyUserData({ tour_ob_micro_status: 'completed' });
        trackEvent('tour_complete', { tour: 'ob_micro' });
        setIsVisible(false);
        onComplete?.();
      } catch (error) {
        console.error('Error completing onboarding tour:', error);
      }
    }
  }, [currentStep, currentStepData.id, clearHighlight, onComplete]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      clearHighlight();
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, clearHighlight]);

  const handleSkip = useCallback(async () => {
    try {
      await User.updateMyUserData({ tour_ob_micro_dismissed: true });
      trackEvent('tour_dismiss', { 
        tour: 'ob_micro', 
        step_id: currentStepData.id,
        step_number: currentStep + 1
      });
      clearHighlight();
      setIsVisible(false);
      onDismiss?.();
    } catch (error) {
      console.error('Error dismissing onboarding tour:', error);
    }
  }, [currentStep, currentStepData.id, clearHighlight, onDismiss]);

  const findAndPositionTooltip = useCallback(() => {
    let element = null;
    
    // Try primary anchor first
    if (currentStepData.anchor) {
      element = document.querySelector(currentStepData.anchor);
    }
    
    // Try fallback selectors
    if (!element && currentStepData.fallback) {
      const fallbacks = currentStepData.fallback.split(', ');
      for (const selector of fallbacks) {
        if (selector.includes(':contains(')) {
          // Handle :contains() pseudo-selector manually
          const [tag, text] = selector.split(':contains(');
          const cleanText = text.replace(/["')]/g, '');
          const elements = document.querySelectorAll(tag);
          element = Array.from(elements).find(el => 
            el.textContent.toLowerCase().includes(cleanText.toLowerCase())
          );
        } else {
          element = document.querySelector(selector);
        }
        if (element) break;
      }
    }

    if (element) {
      setAnchorElement(element);
      setShowAsModal(false);
      
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      let top, left;
      const tooltipHeight = 200; // Approximate height
      const tooltipWidth = 320; // Approximate width
      
      // Auto placement - choose best position based on viewport
      if (rect.bottom + tooltipHeight < window.innerHeight) {
        // Place below
        top = rect.bottom + scrollTop + 10;
        left = rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2);
      } else if (rect.top - tooltipHeight > 0) {
        // Place above
        top = rect.top + scrollTop - tooltipHeight - 10;
        left = rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2);
      } else {
        // Place to the side
        if (rect.right + tooltipWidth < window.innerWidth) {
          top = rect.top + scrollTop + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.right + scrollLeft + 10;
        } else {
          top = rect.top + scrollTop + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.left + scrollLeft - tooltipWidth - 10;
        }
      }
      
      // Ensure tooltip stays within viewport
      left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));
      top = Math.max(10, top);
      
      setTooltipPosition({ top, left });
      
      // Highlight the element
      element.style.position = 'relative';
      element.style.zIndex = '1001';
      element.style.boxShadow = '0 0 0 4px rgba(184, 139, 74, 0.3)';
      element.style.borderRadius = '8px';
      element.style.transition = 'box-shadow 0.3s ease';
    } else {
      // Show as modal if anchor not found
      setAnchorElement(null);
      setShowAsModal(true);
    }
  }, [currentStepData.anchor, currentStepData.fallback]);

  useEffect(() => {
    if (currentStepData.anchor || currentStepData.fallback) {
      // Small delay to allow DOM to update
      setTimeout(findAndPositionTooltip, 100);
    }
    
    // Track step view
    trackEvent('tour_step_view', { 
      tour: 'ob_micro', 
      step_id: currentStepData.id,
      step_number: currentStep + 1
    });
    
    if (currentStep === 0) {
      trackEvent('tour_start', { tour: 'ob_micro' });
    }
  }, [currentStep, findAndPositionTooltip, currentStepData.anchor, currentStepData.fallback, currentStepData.id]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, handleNext, handlePrevious, handleSkip]);

  if (!isVisible) return null;

  const TooltipContent = () => (
    <Card className="w-80 shadow-xl border-2 border-gold/20 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-navy flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-gold" />
            {currentStepData.title}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSkip}
            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
            aria-label="Skip tour"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-slate-700 mb-4 leading-relaxed" aria-describedby="tour-step-description">
          {currentStepData.body}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {currentStep + 1} of {tourSteps.length}
            </span>
            <div className="flex gap-1">
              {tourSteps.map((_, i) => (
                <div 
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i === currentStep ? 'bg-gold' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSkip}
              className="text-slate-600 hover:text-slate-800"
            >
              Skip tour
            </Button>
            <Button 
              onClick={handleNext}
              size="sm"
              className="bg-navy hover:bg-navy/90 text-white"
            >
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-[1000]" onClick={handleSkip} />
      
      {showAsModal ? (
        // Modal overlay when anchor not found
        <div className="fixed inset-0 flex items-center justify-center z-[1001] p-4">
          <TooltipContent />
        </div>
      ) : (
        // Positioned tooltip
        <div 
          className="fixed z-[1001]"
          style={{ 
            top: `${tooltipPosition.top}px`, 
            left: `${tooltipPosition.left}px`,
            transform: showAsModal ? 'none' : 'translateX(-50%)'
          }}
          role="dialog"
          aria-labelledby="tour-step-title"
          aria-describedby="tour-step-description"
          tabIndex={-1}
        >
          <TooltipContent />
        </div>
      )}
    </>
  );
}