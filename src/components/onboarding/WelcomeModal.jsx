
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Resume } from "@/api/entities";
import RezemaiLogo from '../Logo'; // Import the logo
import { 
  Sparkles, 
  FileText, 
  Video, 
  Palette, 
  ArrowRight, 
  CheckCircle,
  User as UserIcon,
  Target,
  Crown
} from "lucide-react";

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to REZEMAI',
    description: 'Your AI-powered executive career platform',
    icon: Sparkles,
    content: (
      <div className="space-y-4 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto overflow-hidden">
          <RezemaiLogo variant="monogram" theme="dark" className="w-full h-full" />
        </div>
        <p className="text-slate-600">
          REZEMAI helps C-suite executives and senior leaders create outstanding résumés and ace interviews using AI technology.
        </p>
        <Badge className="bg-gold/20 text-gold">Premium Platform</Badge>
      </div>
    )
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Help us personalize your experience',
    icon: UserIcon,
    content: (
      <div className="space-y-4">
        <p className="text-slate-600">We'll use your profile information to:</p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Pre-fill your résumé with basic information
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Customize AI recommendations for your industry
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Track your career advancement progress
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 'features',
    title: 'Platform Features',
    description: 'Everything you need for career success',
    icon: Target,
    content: (
      <div className="grid gap-4">
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
          <FileText className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-navy">AI Resume Builder</h4>
            <p className="text-sm text-slate-600">Create ATS-optimized résumés with AI assistance</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
          <Video className="w-6 h-6 text-purple-600 mt-1" />
          <div>
            <h4 className="font-semibold text-navy">Interview Coach</h4>
            <p className="text-sm text-slate-600">Practice with AI and get instant feedback</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
          <Palette className="w-6 h-6 text-amber-600 mt-1" />
          <div>
            <h4 className="font-semibold text-navy">Premium Templates</h4>
            <p className="text-sm text-slate-600">Professional designs for executive roles</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'sample-data',
    title: 'Create Sample Resume',
    description: 'Let us create an example to get you started',
    icon: FileText,
    content: (
      <div className="space-y-4">
        <p className="text-slate-600">
          We'll create a sample résumé with placeholder data so you can see how everything works. You can edit or delete it anytime.
        </p>
        <div className="p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold mb-2">Sample Resume Will Include:</h4>
          <ul className="text-sm space-y-1 text-slate-600">
            <li>• Executive summary template</li>
            <li>• Professional experience format</li>
            <li>• Education and skills sections</li>
            <li>• ATS-optimized structure</li>
          </ul>
        </div>
      </div>
    )
  }
];

export default function WelcomeModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreatingSample, setIsCreatingSample] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadUser();
    }
  }, [isOpen]);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const createSampleResume = async () => {
    setIsCreatingSample(true);
    try {
      const sampleData = {
        title: "Sample Executive Resume - Getting Started",
        template_id: "executive-modern",
        personal_info: {
          full_name: user?.full_name || "Your Name",
          email: user?.email || "your.email@example.com",
          phone: "+1 (555) 123-4567",
          location: "City, State",
          linkedin: "linkedin.com/in/yourprofile",
          summary: "Dynamic executive leader with 15+ years of experience driving organizational transformation and sustainable growth. Proven track record of leading cross-functional teams, optimizing operations, and delivering measurable results in competitive markets."
        },
        experience: [{
          company: "Your Current Company",
          position: "Chief Executive Officer",
          location: "City, State",
          start_date: "2020-01",
          current: true,
          achievements: [
            "Led organizational transformation resulting in 35% revenue growth over 3 years",
            "Expanded market presence to 8 new regions while maintaining operational efficiency",
            "Built and managed high-performing executive team of 12 direct reports"
          ]
        }],
        education: [{
          institution: "Your University",
          degree: "MBA",
          field: "Business Administration",
          graduation_year: "2010",
          honors: "Magna Cum Laude"
        }],
        skills: [
          "Strategic Leadership",
          "P&L Management", 
          "Digital Transformation",
          "Mergers & Acquisitions",
          "Global Operations",
          "Stakeholder Management"
        ],
        target_role: "Chief Executive Officer"
      };

      await Resume.create(sampleData);
      
      // Mark user as onboarded
      await User.updateMyUserData({ 
        onboarding_completed: true,
        onboarding_completed_date: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("Error creating sample resume:", error);
    }
    setIsCreatingSample(false);
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
      await createSampleResume();
    }
    onClose();
  };

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <currentStepData.icon className="w-5 h-5 text-gold" />
              {currentStepData.title}
            </DialogTitle>
            <Badge variant="outline">{currentStep + 1} of {onboardingSteps.length}</Badge>
          </div>
          <DialogDescription>{currentStepData.description}</DialogDescription>
          <Progress value={progress} className="h-2" />
        </DialogHeader>

        <div className="py-6">
          {currentStepData.content}
        </div>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Skip Setup
            </Button>
            <Button 
              onClick={currentStep === onboardingSteps.length - 1 ? handleComplete : handleNext}
              disabled={isCreatingSample}
              className="bg-navy hover:bg-navy/90"
            >
              {currentStep === onboardingSteps.length - 1 ? (
                isCreatingSample ? 'Creating...' : 'Get Started'
              ) : (
                <>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
