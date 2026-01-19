
import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Share2,
  Calendar,
  BarChart3,
  ArrowRight,
  CheckCircle,
  User as UserIcon,
  Target,
  Zap
} from "lucide-react";

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to SoshOps',
    description: 'Professional social media operations platform',
    icon: Sparkles,
    content: (
      <div className="space-y-4 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto">
          <Share2 className="w-10 h-10 text-white" />
        </div>
        <p className="text-slate-600">
          SoshOps helps you manage, schedule, and optimize your social media presence across multiple platforms with professional-grade tools.
        </p>
        <Badge className="bg-blue-500/20 text-blue-700">Professional Platform</Badge>
      </div>
    )
  },
  {
    id: 'profile',
    title: 'Set Up Your Profile',
    description: 'Personalize your workspace',
    icon: UserIcon,
    content: (
      <div className="space-y-4">
        <p className="text-slate-600">Your profile helps us:</p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Customize your dashboard and preferences
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Connect your social media accounts
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Track your posting performance
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 'features',
    title: 'Platform Features',
    description: 'Everything you need for social media success',
    icon: Target,
    content: (
      <div className="grid gap-3">
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
          <Calendar className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-navy">Content Scheduler</h4>
            <p className="text-sm text-slate-600">Plan and schedule posts across all platforms</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
          <BarChart3 className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-navy">Analytics Dashboard</h4>
            <p className="text-sm text-slate-600">Track engagement and optimize performance</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
          <Zap className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-navy">Multi-Platform Publishing</h4>
            <p className="text-sm text-slate-600">Post to LinkedIn, Twitter, and more from one place</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'getting-started',
    title: 'Ready to Get Started',
    description: 'Your workspace is all set up',
    icon: CheckCircle,
    content: (
      <div className="space-y-4">
        <p className="text-slate-600">
          You're ready to start managing your social media presence professionally. Connect your accounts and schedule your first post!
        </p>
        <div className="p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold mb-2">Next Steps:</h4>
          <ul className="text-sm space-y-1 text-slate-600">
            <li>• Connect your social media accounts</li>
            <li>• Explore the content scheduler</li>
            <li>• Create your first scheduled post</li>
            <li>• Check out the analytics dashboard</li>
          </ul>
        </div>
      </div>
    )
  }
];

export default function WelcomeModal({ isOpen, onClose }) {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const completeOnboarding = async () => {
    setIsCompleting(true);
    try {
      // Store onboarding completion in localStorage (fallback)
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem('onboarding_completed_date', new Date().toISOString());

      // CRITICAL: Update Clerk metadata to prevent modal from showing again
      // Note: Client-side can only update unsafeMetadata, not publicMetadata
      if (user) {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            onboardingCompleted: true,
            onboardingCompletedAt: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
    setIsCompleting(false);
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (currentStep === onboardingSteps.length - 1) {
      await completeOnboarding();
    }
    onClose();
  };

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <currentStepData.icon className="w-5 h-5 text-blue-600" />
              {currentStepData.title}
            </DialogTitle>
            <Badge variant="outline" className="text-xs">{currentStep + 1} of {onboardingSteps.length}</Badge>
          </div>
          <DialogDescription className="text-sm">{currentStepData.description}</DialogDescription>
          <Progress value={progress} className="h-2" />
        </DialogHeader>

        <div className="py-4 overflow-y-auto flex-1">
          {currentStepData.content}
        </div>

        <div className="flex justify-between pt-4 border-t flex-shrink-0">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            size="sm"
          >
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleComplete} size="sm">
              Skip
            </Button>
            <Button
              onClick={currentStep === onboardingSteps.length - 1 ? handleComplete : handleNext}
              disabled={isCompleting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              {currentStep === onboardingSteps.length - 1 ? (
                isCompleting ? 'Completing...' : 'Get Started'
              ) : (
                <>
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
