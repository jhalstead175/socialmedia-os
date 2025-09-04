
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { User } from '@/api/entities';

const tourSteps = [
  {
    id: 'welcome',
    title: 'Welcome to REZEMAI!',
    content: "Let's take a quick tour to get you started. This will only take 2 minutes.",
    anchor: null,
    position: 'center'
  },
  {
    id: 'import',
    title: 'Create Your First Résumé',
    content: 'Click here to start building your professional résumé with our AI-powered builder.',
    anchor: '[data-tour="import"]',
    fallback: 'button:contains("New Résumé"), button:contains("Import")',
    position: 'bottom'
  },
  {
    id: 'tailor',
    title: 'Tailor to Job Descriptions',
    content: 'Pro tip: Always tailor your résumé to specific job descriptions for better ATS scores.',
    anchor: '[data-tour="tailor"]',
    fallback: 'button:contains("Tailor"), a:contains("tailor")',
    position: 'bottom'
  },
  {
    id: 'export',
    title: 'Export Your PDF',
    content: 'Once you are happy with your resume, export it as a clean, professional PDF ready to be sent out.',
    anchor: '[data-tour="export"]', // Corrected: changed ' to "
    fallback: 'button:contains("Export PDF"), button:contains("Download")',
    position: 'bottom'
  },
  {
    id: 'interview',
    title: 'Practice Interviews',
    content: 'Use our AI interview coach to practice and get real-time feedback on your responses.',
    anchor: '[data-tour="interview"]',
    fallback: 'button:contains("Practice"), button:contains("Interview")',
    position: 'bottom'
  },
  {
    id: 'metrics',
    title: 'Track Your Progress',
    content: 'Monitor your ATS scores, practice sessions, and overall performance here.',
    anchor: '[data-tour="metrics"]',
    fallback: '.grid:has([class*="Card"])',
    position: 'top'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    content: 'Ready to land your next executive role? Start by creating your first résumé.',
    anchor: null,
    position: 'center'
  }
];

export default function GuidedTour({ onComplete, onDismiss }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [anchorElement, setAnchorElement] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const currentStepData = tourSteps[currentStep];

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
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      let top, left;
      
      switch (currentStepData.position) {
        case 'bottom':
          top = rect.bottom + scrollTop + 10;
          left = rect.left + scrollLeft + (rect.width / 2);
          break;
        case 'top':
          top = rect.top + scrollTop - 10;
          left = rect.left + scrollLeft + (rect.width / 2);
          break;
        case 'right':
          top = rect.top + scrollTop + (rect.height / 2);
          left = rect.right + scrollLeft + 10;
          break;
        case 'left':
          top = rect.top + scrollTop + (rect.height / 2);
          left = rect.left + scrollLeft - 10;
          break;
        default:
          top = rect.bottom + scrollTop + 10;
          left = rect.left + scrollLeft + (rect.width / 2);
      }
      
      setTooltipPosition({ top, left });
      
      // Highlight the element
      element.style.position = 'relative';
      element.style.zIndex = '1001';
      element.style.boxShadow = '0 0 0 4px rgba(184, 139, 74, 0.3)';
      element.style.borderRadius = '8px';
    } else {
      setAnchorElement(null);
    }
  }, [currentStepData.anchor, currentStepData.fallback, currentStepData.position]);

  useEffect(() => {
    if (currentStepData.anchor) {
      findAndPositionTooltip();
    }
  }, [currentStep, findAndPositionTooltip]);

  const clearHighlight = () => {
    if (anchorElement) {
      anchorElement.style.position = '';
      anchorElement.style.zIndex = '';
      anchorElement.style.boxShadow = '';
      anchorElement.style.borderRadius = '';
    }
  };

  const handleNext = () => {
    clearHighlight();
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    clearHighlight();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    clearHighlight();
    setIsVisible(false);
    try {
      await User.updateMyUserData({ 
        tour_first5_status: 'completed',
        tour_first5_dismissed: false
      });
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error completing tour:', error);
    }
  };

  const handleDismiss = async () => {
    clearHighlight();
    setIsVisible(false);
    try {
      await User.updateMyUserData({ 
        tour_first5_dismissed: true 
      });
      if (onDismiss) onDismiss();
    } catch (error) {
      console.error('Error dismissing tour:', error);
    }
  };

  if (!isVisible) return null;

  const isCenter = currentStepData.position === 'center' || !currentStepData.anchor;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-1000" />
      
      {/* Tour Tooltip */}
      <Card 
        className={`fixed z-1002 w-80 shadow-2xl border-2 border-gold ${
          isCenter ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' : ''
        }`}
        style={!isCenter ? {
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: currentStepData.position === 'top' ? 'translate(-50%, -100%)' : 
                   currentStepData.position === 'bottom' ? 'translate(-50%, 0)' :
                   currentStepData.position === 'left' ? 'translate(-100%, -50%)' :
                   currentStepData.position === 'right' ? 'translate(0, -50%)' : 'translate(-50%, 0)'
        } : {}}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-gold" />
              <h3 className="font-semibold text-navy">{currentStepData.title}</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-6 w-6">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-slate-600 mb-4">{currentStepData.content}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {currentStep + 1} of {tourSteps.length}
            </span>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrevious}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              <Button 
                size="sm" 
                onClick={handleNext}
                className="bg-navy hover:bg-navy/90"
              >
                {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                {currentStep < tourSteps.length - 1 && <ArrowRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
