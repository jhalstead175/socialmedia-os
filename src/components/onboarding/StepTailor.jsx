
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, Check } from 'lucide-react';
import { InvokeLLM } from "@/api/integrations";
import { usePaywall } from '../subscription/PaywallProvider';

export default function StepTailor({ onNext, draftResume, setDraftResume }) {
  const [jdText, setJdText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState('');
  const { requirePlan } = usePaywall();

  const handleGenerate = async () => {
    if (!jdText.trim()) {
      setError("Please paste a job description to generate suggestions.");
      return;
    }
    setIsLoading(true);
    setError('');

    const prompt = `
      Given this resume experience: ${JSON.stringify(draftResume.experience.slice(0, 3))}
      And this job description: ${jdText}

      Generate targeted bullet points for each of the last 3 roles. 
      Also provide a list of keywords from the JD.
      Return a JSON object with keys: "rewrites" (an array of objects with "company" and "bullets" array), and "keywords" (an array of strings).
    `;
    
    try {
      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            rewrites: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  company: { type: 'string' },
                  bullets: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            keywords: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      setSuggestions(result);
    } catch (e) {
      console.error("Suggestion generation failed", e);
      setError("Failed to generate suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = (companyName, bullet) => {
    setDraftResume(prev => {
      const newExperience = [...prev.experience];
      const jobIndex = newExperience.findIndex(job => job.company === companyName);
      if (jobIndex !== -1) {
        newExperience[jobIndex].achievements.push(bullet);
      }
      return { ...prev, experience: newExperience };
    });
  };

  const handleBulkApply = () => {
    if (requirePlan("pro", "role_tailor")) {
      // Implement bulk apply logic here
      alert("Bulk apply is a Pro feature! Applying all suggestions.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-navy">Target a role</h2>
      <p className="text-slate-600">Paste a job description below, and we'll help you tailor your resume to match.</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="font-semibold text-navy">Paste the job description</label>
          <Textarea 
            className="mt-2 h-48"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            data-tour="ob-tailor"
          />
          <Button onClick={handleGenerate} disabled={isLoading} className="mt-4 w-full">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Generate Targeted Bullets
          </Button>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-gold"/> AI Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
              {!suggestions && !isLoading && <p className="text-slate-500 text-center py-8">Your suggestions will appear here.</p>}
              {isLoading && <p className="text-slate-500 text-center py-8">Generating...</p>}
              {suggestions && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.keywords.map(k => <span key={k} className="text-xs bg-slate-100 px-2 py-1 rounded">{k}</span>)}
                    </div>
                  </div>
                  {suggestions.rewrites.map(rewrite => (
                    <div key={rewrite.company}>
                      <h4 className="font-semibold">{rewrite.company}</h4>
                      <ul className="list-disc pl-5 space-y-2 mt-2">
                        {rewrite.bullets.map(bullet => (
                          <li key={bullet} className="text-sm text-slate-700 flex justify-between items-center">
                            <span>{bullet}</span>
                            <Button size="sm" variant="ghost" onClick={() => applySuggestion(rewrite.company, bullet)}><Check className="w-4 h-4"/></Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Button onClick={handleBulkApply} variant="outline" className="w-full">Apply All Suggestions</Button>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="ghost" onClick={() => onNext(draftResume, true)}>Back</Button>
        <Button onClick={() => onNext(draftResume)} size="lg">Continue</Button>
      </div>
    </div>
  );
}
