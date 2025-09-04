
import React, { useState, useEffect } from 'react';
import { User, DraftResume, Resume } from "@/api/entities";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { trackEvent } from '@/components/shared/Analytics';
import { generateResumePdf } from '@/api/functions'; // Added import

import OnboardingNav from '../components/onboarding/OnboardingNav';
import StepImport from '../components/onboarding/StepImport';
import StepTailor from '../components/onboarding/StepTailor';
import StepTemplate from '../components/onboarding/StepTemplate';
import StepDrill from '../components/onboarding/StepDrill';
import OnboardingMicroTour from '../components/onboarding/OnboardingMicroTour';
import { Button } from '@/components/ui/button';
import { Loader2, HelpCircle } from 'lucide-react';

const ONBOARDING_STEPS = [
  { id: 'import', title: 'Import' },
  { id: 'tailor', title: 'Tailor' },
  { id: 'template', title: 'Template' },
  { id: 'drill', title: 'Drill' },
  { id: 'done', title: 'Finish' }
];

export default function Onboarding() {
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState('import');
  const [draftResume, setDraftResume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMicroTour, setShowMicroTour] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        setCurrentStep(currentUser.onboarding_step || 'import');
        
        const existingDrafts = await DraftResume.filter({ user_id: currentUser.id }, '-created_date', 1);
        if (existingDrafts.length > 0) {
          setDraftResume(existingDrafts[0]);
        }
        
        // Check if we should show the micro tour
        if (currentUser.onboarding_step !== 'done' && 
            ['not_started', 'started'].includes(currentUser.tour_ob_micro_status) && 
            !currentUser.tour_ob_micro_dismissed) {
          setShowMicroTour(true);
          // Update status to started if it was not_started
          if (currentUser.tour_ob_micro_status === 'not_started') {
            await User.updateMyUserData({ tour_ob_micro_status: 'started' });
          }
        }
        
        trackEvent('ob_step_view', { step: currentUser.onboarding_step || 'import' });
      } catch (e) {
        navigate(createPageUrl("Signin"));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const restartMicroTour = async () => {
    try {
      await User.updateMyUserData({ 
        tour_ob_micro_status: 'not_started',
        tour_ob_micro_dismissed: false
      });
      setShowMicroTour(true);
    } catch (error) {
      console.error('Error restarting micro tour:', error);
    }
  };

  const handleMicroTourComplete = () => {
    setShowMicroTour(false);
  };

  const handleMicroTourDismiss = () => {
    setShowMicroTour(false);
  };

  const updateDraftAndStep = async (newData, newStep) => {
    let currentDraft = draftResume;
    if (currentDraft) {
      await DraftResume.update(currentDraft.id, newData);
      currentDraft = { ...currentDraft, ...newData };
    } else {
      currentDraft = await DraftResume.create({ ...newData, user_id: user.id });
    }
    setDraftResume(currentDraft);
    
    await User.updateMyUserData({ onboarding_step: newStep });
    setCurrentStep(newStep);
    trackEvent('ob_step_view', { step: newStep });
  };

  const handleNext = async (data, isBack = false) => {
    const currentIndex = ONBOARDING_STEPS.findIndex(s => s.id === currentStep);
    const newIndex = isBack ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= ONBOARDING_STEPS.length) return;
    
    const newStep = ONBOARDING_STEPS[newIndex].id;
    updateDraftAndStep(data, newStep);
  };
  
  const handleFinish = async () => {
    setIsLoading(true);
    try {
        // Create final resume
        const finalResume = await Resume.create({
            title: `Resume - ${new Date().toLocaleDateString()}`,
            template_id: draftResume.template_key || 'executive-modern',
            personal_info: { summary: draftResume.summary },
            experience: draftResume.experience,
            education: draftResume.education,
            skills: draftResume.skills
        });
        
        await User.updateMyUserData({ onboarding_step: 'done' });
        setCurrentStep('done');
        setDraftResume(finalResume); // Store final resume for export
        trackEvent('ob_finish');
    } catch(e) {
        console.error("Failed to finish onboarding", e)
    } finally {
        setIsLoading(false);
    }
  }

  const handleSkip = async () => {
    await User.updateMyUserData({ onboarding_step: 'done' });
    navigate(createPageUrl('Dashboard'));
  };
  
  const handleExport = async () => {
    try {
      const { data } = await generateResumePdf({ resumeId: draftResume.id });
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Rezemai_Resume.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      trackEvent('ob_export_pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'import':
        return <StepImport onNext={(data) => handleNext(data)} draftResume={draftResume} setDraftResume={setDraftResume} />;
      case 'tailor':
        return <StepTailor onNext={(data, isBack) => handleNext(data, isBack)} draftResume={draftResume} setDraftResume={setDraftResume} />;
      case 'template':
        return <StepTemplate onNext={(data, isBack) => handleNext(data, isBack)} draftResume={draftResume} setDraftResume={setDraftResume} />;
      case 'drill':
        return <StepDrill onNext={(data, isBack) => handleNext(data, isBack)} onFinish={handleFinish} draftResume={draftResume} />;
      case 'done':
        return (
            <div className="text-center py-12">
                <h2 className="text-3xl font-bold text-navy mb-4">Congratulations!</h2>
                <p className="text-slate-600 mb-8">Your executive resume is ready. What would you like to do next?</p>
                <div className="flex justify-center gap-4">
                    <Button onClick={handleExport} variant="outline">Export PDF</Button>
                    <Button onClick={() => navigate(createPageUrl('Dashboard'))}>Go to Dashboard</Button>
                </div>
            </div>
        )
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-navy" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {showMicroTour && (
        <OnboardingMicroTour
          onComplete={handleMicroTourComplete}
          onDismiss={handleMicroTourDismiss}
        />
      )}
      
      <div className="max-w-5xl mx-auto">
        <div className="text-right mb-4 flex justify-between items-center">
          <div>
            <button 
              onClick={restartMicroTour}
              className="text-sm text-slate-500 hover:text-navy underline"
            >
              Need a hint?
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={restartMicroTour}
              className="text-sm text-slate-600 hover:text-navy flex items-center gap-1"
            >
              <HelpCircle className="w-4 h-4" />
              Restart Onboarding Tour
            </button>
            <Button variant="link" onClick={handleSkip}>Skip for now</Button>
          </div>
        </div>
        <OnboardingNav currentStep={currentStep} steps={ONBOARDING_STEPS} />
        <div className="bg-white p-8 rounded-lg shadow-sm">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
