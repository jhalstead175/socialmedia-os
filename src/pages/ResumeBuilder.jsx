
import React, { useState, useEffect, useCallback } from "react";
import { Resume, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  Plus,
  Trash2,
  Download,
  Sparkles,
  FileText,
  User as UserIcon,
  Briefcase,
  GraduationCap,
  Settings,
  Target,
  CheckCircle,
  AlertCircle,
  Loader2, // Added for spinner
  BadgeHelp, // Added for ATS Linter icon
  ShieldAlert, // Added for ATS issue severity
  Info, // Added for ATS issue severity
  Check // Added for ATS issue severity
} from "lucide-react";
import { InvokeLLM } from "@/api/integrations";
import { usePaywall } from "../components/subscription/PaywallProvider";

import PersonalInfoForm from "../components/resume/PersonalInfoForm";
import ExperienceForm from "../components/resume/ExperienceForm";
import EducationForm from "../components/resume/EducationForm";
import SkillsForm from "../components/resume/SkillsForm";
import ResumePreview from "../components/resume/ResumePreview";
import RezemaiLogo from "../components/Logo";

import { lintATS } from "@/api/functions"; // New import
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // New import
import { toast } from "sonner"; // New import

import GapHighlighter from "../components/resume/GapHighlighter"; // New import

// Simple debounce function
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}


export default function ResumeBuilder() {
  const [currentResume, setCurrentResume] = useState({
    title: '',
    template_id: 'executive-modern', // Default template_id
    personal_info: {
      full_name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    target_role: ''
  });

  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isOptimizing, setOptimizing] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [progress, setProgress] = useState(20);
  const [formErrors, setFormErrors] = useState({});
  const [resumes, setResumes] = useState([]); // New state to track all resumes
  const { requirePlan } = usePaywall(); // New hook
  const [lintResults, setLintResults] = useState(null); // New state for linting results
  const [isLinting, setIsLinting] = useState(false); // New state for linting loading
  const [jdText, setJdText] = useState(""); // New state for job description text

  const calculateProgress = useCallback(() => {
    let completed = 0;
    let total = 6;

    if (currentResume.personal_info.full_name) completed++;
    if (currentResume.personal_info.summary) completed++;
    if (currentResume.experience.length > 0) completed++;
    if (currentResume.education.length > 0) completed++;
    if (currentResume.skills.length > 0) completed++;
    if (currentResume.target_role) completed++;

    setProgress((completed / total) * 100);
  }, [currentResume]);

  // useEffect for initial data loading (user info) and URL parameter parsing
  useEffect(() => {
    const initializeResumeOnMount = async () => {
      try {
        const [userData, allResumes] = await Promise.all([
          User.me(),
          Resume.list('-updated_date', 100) // Fetch all resumes
        ]);
        setResumes(allResumes);
        
        const urlParams = new URLSearchParams(window.location.search);
        const templateParam = urlParams.get('template');

        // Update state using the functional form to avoid dependency issues
        setCurrentResume(prev => {
          let newResume = { ...prev };
          let changed = false;
          let personalInfoUpdates = {};

          // Apply user data if personal_info fields are empty on the current state
          if (userData) {
            if (!prev.personal_info.full_name && userData.full_name) {
              personalInfoUpdates.full_name = userData.full_name;
            }
            if (!prev.personal_info.email && userData.email) {
              personalInfoUpdates.email = userData.email;
            }
          }
          
          if (Object.keys(personalInfoUpdates).length > 0) {
            newResume.personal_info = {
              ...prev.personal_info,
              ...personalInfoUpdates
            };
            changed = true;
          }

          // Apply template_id from URL if different
          if (templateParam && prev.template_id !== templateParam) {
            newResume.template_id = templateParam;
            changed = true;
          }

          return changed ? newResume : prev;
        });

      } catch (error) {
        console.error("Error initializing resume data:", error);
      }
    };

    initializeResumeOnMount();
  }, []); // This effect should only run once on mount

  // useEffect for calculating progress, dependent on currentResume changes
  useEffect(() => {
    calculateProgress();
  }, [calculateProgress]);

  const validateForm = useCallback((showErrors = true) => {
    const errors = {};
    const { personal_info } = currentResume;

    if (!personal_info.full_name?.trim()) {
      errors.full_name = "Full name is required.";
    }
    if (!personal_info.email?.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(personal_info.email)) {
      errors.email = "Email address is invalid.";
    }
    if (!personal_info.summary?.trim()) {
      errors.summary = "Professional summary is required.";
    }

    if (showErrors) {
      setFormErrors(errors);
    }
    return Object.keys(errors).length === 0;
  }, [currentResume.personal_info]);

  const handleSave = useCallback(async (showMessages = true) => {
    if (!validateForm(true)) {
      setSaveMessage("Please fix the errors before saving.");
      return;
    }

    setSaving(true);
    setSaveMessage('');
    try {
      // Guard for multiple resumes
      if (!currentResume.id && resumes.length >= 1) { 
        if (!requirePlan('pro', 'multi_resume')) {
          setSaving(false);
          return;
        }
      }
      
      let resumeToSave = { ...currentResume };
      if (!resumeToSave.title) {
        resumeToSave.title = `Resume - ${new Date().toLocaleDateString()}`;
      }

      // Assuming Resume.create returns the saved/created resume object (with ID if new)
      const savedResume = await Resume.create(resumeToSave);
      
      // If it was a new resume being created, update the state with its ID
      if (!currentResume.id && savedResume && savedResume.id) {
        setCurrentResume(prev => ({ ...prev, id: savedResume.id, title: savedResume.title || prev.title }));
      }

      if (showMessages) {
        setSaveMessage('Resume saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      if (showMessages) {
        setSaveMessage('Error saving resume. Please try again.');
      }
      console.error("Save error:", error);
    }
    setSaving(false);
  }, [validateForm, currentResume, resumes, requirePlan, setCurrentResume, setSaving, setSaveMessage]);

  // Auto-saving logic
  const debouncedSave = useCallback(
    debounce(async (resumeToSave) => {
      if (!validateForm(false)) { // Validate without setting UI errors
        return;
      }
      setIsAutoSaving(true);
      try {
        if (!resumeToSave.id && resumes.length >= 1) {
          if (!requirePlan('pro', 'multi_resume')) {
            setIsAutoSaving(false);
            return;
          }
        }

        let finalResumeToSave = { ...resumeToSave };
        if (!finalResumeToSave.title) {
          finalResumeToSave.title = `Resume - ${new Date().toLocaleDateString()}`;
        }
        
        // Assuming Resume.create returns the saved/created resume object (with ID if new)
        const savedResume = await Resume.create(finalResumeToSave);
        
        // If it was a new resume being created, update the state with its ID
        if (!currentResume.id && savedResume && savedResume.id) {
          setCurrentResume(prev => ({ ...prev, id: savedResume.id, title: savedResume.title || prev.title }));
        }

      } catch (error) {
        console.error("Auto-save error:", error);
      }
      setTimeout(() => setIsAutoSaving(false), 1000); // Show saving indicator for a bit
    }, 2000), // Debounce time: 2 seconds
    [validateForm, resumes, requirePlan, currentResume.id, setIsAutoSaving, setCurrentResume]
  );

  useEffect(() => {
    // Only auto-save if the resume has an ID (i.e., it's an existing resume)
    // or if the title is already set (to prevent auto-saving a completely empty new resume on initial load)
    if (currentResume.id || currentResume.title) { 
        debouncedSave(currentResume);
    }
  }, [currentResume, debouncedSave]);

  // Keyboard shortcut for saving
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave(true); // Call save with messages
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSave]);

  const optimizeWithAI = async () => {
    if (isOptimizing) return; // Prevent spamming
    if (!currentResume.target_role) {
      alert('Please specify a target role first in the Settings tab.');
      return;
    }

    // Guard for AI optimization
    if (!requirePlan('pro', 'role_tailor')) {
        return;
    }

    setOptimizing(true);
    try {
      const optimizationPrompt = `
        Analyze this resume for ATS optimization for the role: ${currentResume.target_role}

        Resume Data:
        ${JSON.stringify(currentResume, null, 2)}

        Provide:
        1. ATS score out of 100
        2. Specific recommendations for improvement
        3. Suggested keywords to add
        4. Areas that need strengthening

        Focus on executive-level positions and ensure recommendations are actionable.
      `;

      const result = await InvokeLLM({
        prompt: optimizationPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            ats_score: { type: "number" },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            suggested_keywords: {
              type: "array",
              items: { type: "string" }
            },
            improvement_areas: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setCurrentResume(prev => ({
        ...prev,
        ats_score: result.ats_score,
        ats_recommendations: result.recommendations
      }));

      setSaveMessage(`ATS optimization complete! Score: ${result.ats_score}%`);
    } catch (error) {
      setSaveMessage('Error optimizing resume. Please try again.');
      console.error("Optimization error:", error);
    }
    setOptimizing(false);
  };

  const handleLintResume = async () => {
    if (isLinting) return;
    setIsLinting(true);
    setLintResults(null);
    try {
      const { data } = await lintATS({ 
        resumeData: currentResume, 
        jobDescription: jdText 
      });
      setLintResults(data);
      toast.success(`Linting complete! Score: ${data.score_overall}%`);
    } catch (error) {
      console.error("Linting error:", error);
      toast.error("Failed to run ATS Linter. Please try again.");
    }
    setIsLinting(false);
  };

  const handleDownloadPDF = () => {
    if (lintResults?.issues.some(i => i.severity === 'fail')) {
      setSaveMessage("Please fix critical (fail) ATS issues before exporting.");
      toast.error("Export Blocked", {
        description: "Your resume has critical ATS formatting errors that might cause it to be rejected by automated systems. Please fix them before exporting.",
        duration: 8000
      });
      // Scroll to lint results
      const lintSection = document.getElementById('linting-results');
      if (lintSection) {
        lintSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    window.print();
  };

  const updateResumeField = (path, value) => {
    setCurrentResume(prev => {
      const newResume = { ...prev };
      const keys = path.split('.');
      let current = newResume;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newResume;
    });
  };

  const tabConfig = [
    { id: 'personal', label: 'Personal Info', icon: UserIcon },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <RezemaiLogo variant="wordmark" theme="light" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Resume Builder</h1>
                <p className="text-slate-600 mt-1">Create your executive-level résumé with AI optimization</p>
              </div>
            </div>
            <div className="flex gap-3 self-end md:self-center flex-wrap justify-end">
              <Button
                variant="outline"
                onClick={handleLintResume}
                disabled={isLinting}
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                {isLinting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BadgeHelp className="w-4 h-4 mr-2" />
                )}
                ATS Linter
              </Button>
              <Button
                variant="outline"
                onClick={optimizeWithAI}
                disabled={isOptimizing}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                {isOptimizing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Optimize with AI
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                className="border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={isSaving || isAutoSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : isAutoSaving ? (
                  <Save className="h-4 w-4 mr-2 text-blue-300" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : isAutoSaving ? 'Auto-saving...' : 'Save Resume'}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Completion Progress</span>
              <span className="text-sm text-slate-500">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {saveMessage && (
            <Alert className={`mt-4 ${saveMessage.includes('Error') || saveMessage.includes('fix the errors') ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'}`}>
              {saveMessage.includes('Error') || saveMessage.includes('fix the errors') ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{saveMessage}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-3 non-printable">
            {/* Gap Analysis Section - NEW */}
            <GapHighlighter 
              resumeData={currentResume}
              draftResumeId={currentResume?.id}
              onResumeUpdate={setCurrentResume}
            />

            {/* ATS Linter Section */}
            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="text-lg">ATS Linter & Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste a job description here to tailor your resume and run the ATS Linter..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="h-32"
                />
              </CardContent>
            </Card>

            {lintResults && (
              <Card id="linting-results" className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>ATS Linting Results</CardTitle>
                    <Badge className={
                      lintResults.score_overall >= 85 ? 'bg-green-100 text-green-800' :
                      lintResults.score_overall >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      Score: {lintResults.score_overall}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="issues">
                      <AccordionTrigger>
                        Identified Issues ({lintResults.issues.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                          {lintResults.issues.map(issue => (
                            <div key={issue.id} className="flex items-start gap-3 p-2 rounded-md border">
                              {issue.severity === 'fail' && <ShieldAlert className="w-5 h-5 text-red-500 mt-1" />}
                              {issue.severity === 'warn' && <Info className="w-5 h-5 text-yellow-500 mt-1" />}
                              {issue.severity === 'info' && <Check className="w-5 h-5 text-blue-500 mt-1" />}
                              <div>
                                <p className="font-semibold text-slate-800">{issue.message}</p>
                                <p className="text-sm text-slate-600">{issue.fix_suggestion}</p>
                                <Badge variant="outline" className="mt-1 text-xs">{issue.where}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    {lintResults.quick_fixes?.length > 0 && (
                      <AccordionItem value="fixes">
                        <AccordionTrigger>Quick Fixes ({lintResults.quick_fixes.length})</AccordionTrigger>
                        <AccordionContent>
                           <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {lintResults.quick_fixes.map((fix, idx) => (
                              <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500 line-through">{fix.original}</p>
                                <p className="text-sm text-green-700">{fix.revised}</p>
                                <p className="text-xs text-slate-600 italic mt-1">{fix.reason}</p>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                    {jdText && lintResults.coverage && ( // Ensure coverage object exists if jdText is present
                       <AccordionItem value="keywords">
                        <AccordionTrigger>Keyword Coverage</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-green-700 mb-2">Matched Keywords</h4>
                              <div className="flex flex-wrap gap-2">
                                {lintResults.coverage.matched_keywords.map(k => <Badge key={k} variant="secondary">{k}</Badge>)}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-red-700 mb-2">Missing Keywords</h4>
                              <div className="flex flex-wrap gap-2">
                                {lintResults.coverage.missing_keywords.map(k => <Badge key={k} variant="destructive">{k}</Badge>)}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                </CardContent>
              </Card>
            )}
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="border-b border-slate-100 p-6">
                    <TabsList className="grid w-full grid-cols-5 bg-slate-100">
                      {tabConfig.map(tab => (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className="flex flex-col gap-1 py-3 data-[state=active]:bg-white"
                        >
                          <tab.icon className="w-4 h-4" />
                          <span className="text-xs hidden sm:block">{tab.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <div className="p-6">
                    <TabsContent value="personal" className="mt-0">
                      <PersonalInfoForm
                        data={currentResume.personal_info}
                        onChange={(field, value) => updateResumeField(`personal_info.${field}`, value)}
                        errors={formErrors}
                      />
                    </TabsContent>

                    <TabsContent value="experience" className="mt-0">
                      <ExperienceForm
                        experiences={currentResume.experience}
                        onChange={(value) => updateResumeField('experience', value)}
                      />
                    </TabsContent>

                    <TabsContent value="education" className="mt-0">
                      <EducationForm
                        education={currentResume.education}
                        onChange={(value) => updateResumeField('education', value)}
                      />
                    </TabsContent>

                    <TabsContent value="skills" className="mt-0">
                      <SkillsForm
                        skills={currentResume.skills}
                        certifications={currentResume.certifications}
                        onSkillsChange={(value) => updateResumeField('skills', value)}
                        onCertificationsChange={(value) => updateResumeField('certifications', value)}
                      />
                    </TabsContent>

                    <TabsContent value="settings" className="mt-0">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Resume Title
                          </label>
                          <Input
                            placeholder="e.g., Senior Executive Resume"
                            value={currentResume.title}
                            onChange={(e) => updateResumeField('title', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Target Role
                          </label>
                          <Input
                            placeholder="e.g., Chief Executive Officer, General Counsel"
                            value={currentResume.target_role}
                            onChange={(e) => updateResumeField('target_role', e.target.value)}
                          />
                          <p className="text-sm text-slate-500 mt-1">
                            This helps our AI optimize your resume for ATS systems
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Template ID
                          </label>
                          <Input
                            placeholder="e.g., executive-modern"
                            value={currentResume.template_id}
                            onChange={(e) => updateResumeField('template_id', e.target.value)}
                          />
                          <p className="text-sm text-slate-500 mt-1">
                            Sets the visual template for your resume export.
                          </p>
                        </div>
                        {currentResume.ats_score && (
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">
                              ATS Score: {currentResume.ats_score}%
                            </h4>
                            {currentResume.ats_recommendations?.map((rec, index) => (
                              <p key={index} className="text-sm text-blue-800 mb-1">• {rec}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-2 printable-full-width">
            <ResumePreview resume={currentResume} />
          </div>
        </div>
      </div>
    </div>
  );
}
