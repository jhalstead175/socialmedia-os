import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';
import { InvokeLLM } from "@/api/integrations";

export default function StepImport({ onNext, draftResume, setDraftResume }) {
  const [pastedText, setPastedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleParse = async () => {
    if (!pastedText.trim()) {
      setError("Please paste your resume text to continue.");
      return;
    }
    setIsLoading(true);
    setError('');

    const prompt = `
      Parse the following resume text into a structured JSON object. 
      The JSON object must have the following keys: "summary" (string), "experience" (array of objects with "company", "position", "start_date", "end_date", "achievements" array of strings), "education" (array of objects with "institution", "degree", "graduation_year"), and "skills" (array of strings).

      Resume Text:
      ---
      ${pastedText}
      ---
    `;

    try {
      const parsedData = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            experience: { type: "array", items: { type: "object", properties: { company: { type: "string" }, position: { type: "string" }, start_date: { type: "string" }, end_date: { type: "string" }, achievements: { type: "array", items: { type: "string" } } } } },
            education: { type: "array", items: { type: "object", properties: { institution: { type: "string" }, degree: { type: "string" }, graduation_year: { type: "string" } } } },
            skills: { type: "array", items: { type: "string" } }
          }
        }
      });
      onNext(parsedData);
    } catch (e) {
      console.error("Parsing failed", e);
      setError("We had trouble parsing your resume. Please check the format or try simplifying the text.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-navy">Let's start with your current resume</h2>
      <p className="text-slate-600">Paste your full resume below. Our AI will automatically structure it for you.</p>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="grid gap-4">
        <div>
          <label htmlFor="resume-text" className="font-semibold text-navy">Paste your resume text</label>
          <Textarea
            id="resume-text"
            placeholder="Example: John Doe..."
            className="mt-2 h-64"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            data-tour="ob-import"
          />
        </div>
        <div>
          <label htmlFor="linkedin-url" className="font-semibold text-navy">Import from LinkedIn profile URL (optional)</label>
          <Input
            id="linkedin-url"
            placeholder="https://linkedin.com/in/your-profile"
            className="mt-2"
            value={draftResume?.linkedin_url || ''}
            onChange={(e) => setDraftResume && setDraftResume(prev => ({
              ...prev,
              linkedin_url: e.target.value
            }))}
          />
        </div>
      </div>
      
      <div className="text-right">
        <Button onClick={handleParse} disabled={isLoading} size="lg">
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Continue
        </Button>
      </div>
    </div>
  );
}