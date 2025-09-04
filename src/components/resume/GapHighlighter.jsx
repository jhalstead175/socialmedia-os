import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Plus, 
  Check, 
  AlertTriangle, 
  TrendingUp, 
  Loader2,
  Lightbulb,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import { trackEvent } from '@/components/shared/Analytics';
import { DraftResume } from '@/api/entities';

export default function GapHighlighter({ resumeData, draftResumeId, onResumeUpdate }) {
  const [jobDescription, setJobDescription] = useState('');
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [appliedSuggestions, setAppliedSuggestions] = useState(new Set());
  const [completedActions, setCompletedActions] = useState(new Set());

  const analyzeGaps = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description to analyze gaps');
      return;
    }

    if (!resumeData || !resumeData.experience?.length) {
      setError('Please add some work experience to your resume first');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const prompt = `
        You are a resume optimization expert. Analyze the gap between this resume and job description.
        
        RESUME DATA:
        Summary: ${resumeData.summary || ''}
        Experience: ${JSON.stringify(resumeData.experience)}
        Skills: ${(resumeData.skills || []).join(', ')}
        Education: ${JSON.stringify(resumeData.education || [])}
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        ANALYSIS TASKS:
        1. Extract key competencies, tools, and skills from the JD
        2. Identify which ones are missing from the resume
        3. Find near-matches that could be strengthened
        4. Generate metric-focused bullet suggestions
        5. Create a 3-step action plan
        
        Focus on:
        - Hard skills and technical competencies
        - Leadership and management capabilities
        - Industry-specific experience
        - Quantifiable achievements
        
        Return detailed analysis with specific, actionable recommendations.
      `;

      const analysis = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            matched_keywords: {
              type: "array",
              items: { type: "string" },
              description: "Keywords/skills found in both resume and JD"
            },
            missing_keywords: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  keyword: { type: "string" },
                  importance: { type: "string", enum: ["high", "medium", "low"] },
                  category: { type: "string", enum: ["technical", "leadership", "industry", "soft_skill"] }
                }
              }
            },
            near_matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  resume_term: { type: "string" },
                  jd_term: { type: "string" },
                  suggestion: { type: "string" }
                }
              }
            },
            bullet_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  current: { type: "string" },
                  improved: { type: "string" },
                  keywords_added: { type: "array", items: { type: "string" } },
                  rationale: { type: "string" },
                  company: { type: "string" }
                }
              }
            },
            action_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  quick_fix: { type: "string" },
                  impact: { type: "string" }
                }
              }
            }
          }
        }
      });

      setGapAnalysis(analysis);
      trackEvent('gap_analysis_complete', {
        matched_count: analysis.matched_keywords.length,
        missing_count: analysis.missing_keywords.length,
        suggestions_count: analysis.bullet_suggestions.length
      });

    } catch (err) {
      console.error('Gap analysis failed:', err);
      setError('Failed to analyze gaps. Please try again.');
    }
    
    setIsAnalyzing(false);
  };

  const applyBulletSuggestion = async (suggestion, index) => {
    if (!draftResumeId) {
      setError('Cannot apply suggestions without a draft resume');
      return;
    }

    try {
      // Find the company/experience to update
      const experienceIndex = resumeData.experience.findIndex(
        exp => exp.company === suggestion.company
      );

      if (experienceIndex === -1) {
        setError('Could not find matching experience entry');
        return;
      }

      // Create updated resume data
      const updatedExperience = [...resumeData.experience];
      const currentAchievements = updatedExperience[experienceIndex].achievements || [];
      
      // Replace the current bullet if it exists, otherwise add the new one
      const currentIndex = currentAchievements.findIndex(
        achievement => achievement.trim() === suggestion.current?.trim()
      );
      
      if (currentIndex !== -1) {
        currentAchievements[currentIndex] = suggestion.improved;
      } else {
        currentAchievements.push(suggestion.improved);
      }
      
      updatedExperience[experienceIndex].achievements = currentAchievements;

      // Update the draft resume
      await DraftResume.update(draftResumeId, {
        experience: updatedExperience
      });

      // Update local state
      setAppliedSuggestions(prev => new Set([...prev, index]));
      
      // Notify parent component
      if (onResumeUpdate) {
        onResumeUpdate({ ...resumeData, experience: updatedExperience });
      }

      trackEvent('gap_apply_bullet', {
        suggestion_index: index,
        company: suggestion.company,
        keywords_added: suggestion.keywords_added
      });

    } catch (err) {
      console.error('Failed to apply suggestion:', err);
      setError('Failed to apply suggestion. Please try again.');
    }
  };

  const markActionComplete = (actionIndex) => {
    setCompletedActions(prev => new Set([...prev, actionIndex]));
    trackEvent('gap_action_done', {
      action_index: actionIndex,
      action_task: gapAnalysis.action_plan[actionIndex].task
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Resume Gap Analysis
        </CardTitle>
        <p className="text-sm text-slate-600">
          Compare your resume against a specific job description to identify gaps and optimization opportunities.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Job Description Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Job Description
          </label>
          <Textarea
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="h-32"
          />
          <Button 
            onClick={analyzeGaps}
            disabled={isAnalyzing || !jobDescription.trim()}
            className="mt-3 w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Gaps...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Analyze Resume Gaps
              </>
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {gapAnalysis && (
          <Tabs defaultValue="keywords" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="action-plan">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="keywords" className="space-y-4">
              {/* Matched Keywords */}
              <div>
                <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Matched Keywords ({gapAnalysis.matched_keywords.length})
                </h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {gapAnalysis.matched_keywords.map((keyword, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800 border-green-200">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Missing Keywords */}
              <div>
                <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Missing Keywords ({gapAnalysis.missing_keywords.length})
                </h4>
                <div className="space-y-2">
                  {gapAnalysis.missing_keywords.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="font-medium">{item.keyword}</span>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(item.importance)}>
                          {item.importance}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Near Matches */}
              {gapAnalysis.near_matches.length > 0 && (
                <div>
                  <h4 className="font-semibold text-yellow-700 mb-3">Near Matches</h4>
                  <div className="space-y-2">
                    {gapAnalysis.near_matches.map((match, index) => (
                      <div key={index} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-slate-600">You have:</span>
                          <Badge variant="outline">{match.resume_term}</Badge>
                          <ArrowRight className="w-3 h-3" />
                          <span className="text-sm text-slate-600">Consider:</span>
                          <Badge className="bg-yellow-100 text-yellow-800">{match.jd_term}</Badge>
                        </div>
                        <p className="text-xs text-slate-600">{match.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Bullet Point Improvements ({gapAnalysis.bullet_suggestions.length})
                </h4>
                <div className="space-y-4">
                  {gapAnalysis.bullet_suggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-slate-50">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-xs">
                          {suggestion.company}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => applyBulletSuggestion(suggestion, index)}
                          disabled={appliedSuggestions.has(index)}
                          className="h-7 px-3"
                        >
                          {appliedSuggestions.has(index) ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Applied
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 mr-1" />
                              Apply
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {suggestion.current && (
                        <div className="mb-2">
                          <span className="text-xs text-slate-500">Current:</span>
                          <p className="text-sm text-slate-600 line-through">{suggestion.current}</p>
                        </div>
                      )}
                      
                      <div className="mb-2">
                        <span className="text-xs text-slate-500">Improved:</span>
                        <p className="text-sm font-medium text-slate-900">{suggestion.improved}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {suggestion.keywords_added?.map((keyword, kIndex) => (
                          <Badge key={kIndex} className="bg-blue-100 text-blue-800 text-xs">
                            +{keyword}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="text-xs text-slate-500 italic">{suggestion.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="action-plan" className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  3-Step Action Plan
                </h4>
                <div className="space-y-3">
                  {gapAnalysis.action_plan.map((action, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-700">
                            Step {index + 1}
                          </span>
                          <Badge className={getPriorityColor(action.priority)}>
                            {action.priority}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markActionComplete(index)}
                          disabled={completedActions.has(index)}
                          className="h-7 px-3"
                        >
                          {completedActions.has(index) ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Done
                            </>
                          ) : (
                            'Mark Complete'
                          )}
                        </Button>
                      </div>
                      
                      <h5 className="font-medium text-slate-900 mb-1">{action.task}</h5>
                      <p className="text-sm text-slate-600 mb-2">{action.quick_fix}</p>
                      <p className="text-xs text-green-700 font-medium">
                        Impact: {action.impact}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}