
import React, { useState, useEffect, Suspense } from "react";
import { Resume } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Eye, Palette, Sparkles, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePaywall } from "../components/subscription/PaywallProvider"; // New import

// Lazy load the TemplatePreview component
const TemplatePreview = React.lazy(() => import("../components/templates/TemplatePreview"));

const templates = [
  {
    id: 'executive-modern',
    name: 'Executive Modern',
    description: 'Clean, sophisticated design perfect for C-suite executives',
    category: 'Executive',
    color: 'Navy & Gold',
    features: ['ATS Optimized', 'Single Page', 'Professional Typography'],
    isPremium: false,
    requiredPlan: 'starter'
  },
  {
    id: 'executive-classic',
    name: 'Executive Classic',
    description: 'Traditional executive format with timeless elegance',
    category: 'Executive',
    color: 'Deep Navy',
    features: ['Conservative Layout', 'ATS Optimized', 'Traditional Styling'],
    isPremium: false,
    requiredPlan: 'starter' // Added requiredPlan
  },
  {
    id: 'legal-professional',
    name: 'Legal Professional',
    description: 'Designed specifically for legal professionals and law firms',
    category: 'Legal',
    color: 'Charcoal & Accent',
    features: ['Legal Industry Standard', 'Clean Sections', 'Professional'],
    isPremium: true,
    requiredPlan: 'elite' // Added requiredPlan
  },
  {
    id: 'consulting-elite',
    name: 'Consulting Elite',
    description: 'Strategic consulting format with emphasis on achievements',
    category: 'Consulting',
    color: 'Navy & Silver',
    features: ['Metrics Focused', 'Achievement Highlights', 'Modern Layout'],
    isPremium: true,
    requiredPlan: 'pro' // Added requiredPlan
  },
  {
    id: 'finance-executive',
    name: 'Finance Executive',
    description: 'Tailored for CFOs, finance directors, and banking executives',
    category: 'Finance',
    color: 'Navy & Gold',
    features: ['Numbers Focused', 'Clean Metrics', 'Executive Level'],
    isPremium: true,
    requiredPlan: 'elite' // Added requiredPlan
  },
  {
    id: 'creative-executive',
    name: 'Creative Executive',
    description: 'For creative directors and marketing executives',
    category: 'Creative',
    color: 'Multi-Color Accent',
    features: ['Creative Flair', 'Visual Elements', 'Brand Focused'],
    isPremium: true,
    requiredPlan: 'pro' // Added requiredPlan
  }
];

const sampleResume = {
  personal_info: {
    full_name: 'Alexandra Thompson',
    email: 'a.thompson@executive.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    linkedin: 'linkedin.com/in/alexandrathompson',
    summary: 'Results-driven executive with 15+ years of experience leading transformational change and driving sustainable growth in Fortune 500 companies.'
  },
  experience: [{
    company: 'Global Industries Inc.',
    position: 'Chief Executive Officer',
    location: 'New York, NY',
    start_date: '2020-01',
    current: true,
    achievements: [
      'Led company transformation resulting in 45% revenue growth over 3 years',
      'Expanded market presence to 12 new international markets'
    ]
  }],
  education: [{
    institution: 'Harvard Business School',
    degree: 'MBA',
    field: 'Strategic Management',
    graduation_year: '2008'
  }],
  skills: ['Strategic Leadership', 'P&L Management', 'Digital Transformation', 'Global Operations'],
  certifications: []
};

export default function Templates() {
  const [selectedTemplate, setSelectedTemplate] = useState('executive-modern');
  const [previewMode, setPreviewMode] = useState(false);
  const [userResumes, setUserResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { requirePlan } = usePaywall(); // Changed from checkPlan to requirePlan
  const [visibleCount, setVisibleCount] = useState(6); // State for virtual scrolling

  useEffect(() => {
    loadUserResumes();
  }, []);

  const loadUserResumes = async () => {
    try {
      const resumes = await Resume.list('-updated_date', 5);
      setUserResumes(resumes);
    } catch (err) {
      console.error("Error loading resumes:", err);
      setError("Failed to load your résumés. Some features may not work.");
    }
    setIsLoading(false);
  };

  // Function to apply template for a new resume
  const applyTemplate = async (template) => {
    if (template.isPremium) {
      if (!requirePlan(template.requiredPlan, 'industry_templates')) {
        return;
      }
    }
    
    // Redirect to resume builder with selected template
    window.location.href = createPageUrl("ResumeBuilder") + `?template=${template.id}`;
  };

  // Function to apply template to an existing resume
  const applyTemplateToExisting = async (template, resumeId) => {
    if (template.isPremium) {
      if (!requirePlan(template.requiredPlan, 'industry_templates')) {
        return;
      }
    }

    // Apply to existing resume
    await Resume.update(resumeId, { template_id: template.id });
    alert('Template applied successfully!');
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse mb-8">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-slate-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-navy flex items-center gap-3">
                REZEMAI Templates
              </h1>
              <p className="text-slate-600 mt-2 max-w-2xl text-sm md:text-base">
                Choose from our collection of executive-grade résumé templates, each designed to make a powerful first impression and pass ATS systems.
              </p>
            </div>
            <div className="flex gap-3 self-stretch md:self-center">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                className="border-navy/20 flex-1 md:flex-none"
              >
                <Eye className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{previewMode ? 'Grid View' : 'Preview Mode'}</span>
                <span className="sm:hidden">{previewMode ? 'Grid' : 'Preview'}</span>
              </Button>
              <Link to={createPageUrl("ResumeBuilder")} className="flex-1 md:flex-none">
                <Button className="bg-navy hover:bg-navy/90 text-warm-white w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Create New Résumé</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {previewMode ? (
          /* Preview Mode - Large Template Preview */
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
              <h2 className="text-xl font-semibold text-navy">Select Template</h2>
              <div className="space-y-3 max-h-96 lg:max-h-none overflow-y-auto lg:overflow-visible">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedTemplate === template.id
                        ? 'border-gold bg-gold/10 shadow-lg'
                        : 'border-neutral-gray hover:border-navy/50 hover:bg-navy/5'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-navy text-sm md:text-base">{template.name}</h3>
                      {template.isPremium && (
                        <Badge className="bg-gold/20 text-gold text-xs">Premium</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2 leading-tight">{template.description}</p>
                    <div className="flex gap-1 flex-wrap">
                      {template.features.slice(0, 2).map((feature, i) => (
                        <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded">{feature}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-neutral-gray">
                <Button
                  onClick={() => applyTemplate(selectedTemplateData)} 
                  className="w-full bg-navy hover:bg-navy/90 text-warm-white"
                >
                  Use This Template
                </Button>

                {userResumes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Apply to existing résumé:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {userResumes.slice(0, 3).map((resume) => (
                        <Button
                          key={resume.id}
                          variant="outline"
                          size="sm"
                          onClick={() => applyTemplateToExisting(selectedTemplateData, resume.id)} 
                          className="w-full justify-start text-left text-sm"
                        >
                          {resume.title}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="bg-white rounded-xl shadow-2xl p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-navy">{selectedTemplateData?.name}</h3>
                    <p className="text-slate-600 text-sm md:text-base">{selectedTemplateData?.description}</p>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>Category: {selectedTemplateData?.category}</p>
                    <p>Color: {selectedTemplateData?.color}</p>
                  </div>
                </div>

                <div className="border border-neutral-gray rounded-lg overflow-hidden">
                  <Suspense fallback={<Skeleton className="h-[700px] w-full bg-slate-100" />}>
                    <TemplatePreview
                      template={selectedTemplate}
                      resume={sampleResume}
                      scale={window.innerWidth < 768 ? 0.4 : 0.7}
                    />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Grid Mode - Template Gallery */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {templates.slice(0, visibleCount).map((template) => (
                <Card key={template.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="aspect-[3/4] bg-neutral-gray/20 relative overflow-hidden">
                    <div className="absolute inset-0 p-2 md:p-4">
                      <Suspense fallback={<Skeleton className="h-full w-full bg-slate-100" />}>
                        <TemplatePreview
                          template={template.id}
                          resume={sampleResume}
                          scale={0.25}
                        />
                      </Suspense>
                    </div>
                    {template.isPremium && (
                      <Badge className="absolute top-3 right-3 bg-gold text-navy text-xs">Premium</Badge>
                    )}
                  </div>

                  <CardHeader className="p-3 md:p-4">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-base md:text-lg text-navy">{template.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">{template.category}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 leading-tight">{template.description}</p>
                  </CardHeader>

                  <CardContent className="p-3 md:p-4 pt-0">
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.features.map((feature, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template.id);
                          setPreviewMode(true);
                        }}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Preview</span>
                        <span className="sm:hidden">View</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => applyTemplate(template)} 
                        className="flex-1 bg-navy hover:bg-navy/90 text-warm-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Use
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {visibleCount < templates.length && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount(prev => prev + 6)}
                >
                  Load More Templates
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
