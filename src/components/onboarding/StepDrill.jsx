import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { usePaywall } from '../subscription/PaywallProvider';

export default function StepDrill({ onNext, onFinish, draftResume }) {
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState(['', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const { requirePlan } = usePaywall();
  const questions = ["Tell me about your biggest accomplishment.", "Describe a time you failed.", "Where do you see yourself in 5 years?"];

  const handleAnswerChange = (text) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = text;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (qIndex < 2) {
      setQIndex(qIndex + 1);
    } else {
      // Show summary card after 3rd question
      setIsLoading(true); // Simulate getting feedback
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const handleFullSim = () => {
    if(requirePlan("pro", "interview_sim")){
      // Redirect to full simulator
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-navy">3-question warmup</h2>
      <p className="text-slate-600">Let's practice a few common interview questions to get you warmed up.</p>

      {qIndex < 3 ? (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">{qIndex + 1}. {questions[qIndex]}</h3>
            <Textarea 
              className="h-40"
              value={answers[qIndex]}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Use the STAR method: Situation, Task, Action, Result."
            />
            <div className="text-right mt-4">
              <Button onClick={handleNextQuestion}>
                {qIndex < 2 ? "Next Question" : "Get Feedback"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <h3 className="font-bold text-xl text-navy mb-4">Your Scorecard</h3>
            {isLoading ? <Loader2 className="animate-spin mx-auto"/> : (
              <>
                <p className="font-semibold">Strengths:</p>
                <p className="text-slate-700 mb-2">Clear results, good structure.</p>
                <p className="font-semibold">Improvement Pointer:</p>
                <p className="text-slate-700 mb-4">Try to quantify the impact of your actions more.</p>
                <Button onClick={handleFullSim}>Start Full Simulator</Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="ghost" onClick={() => onNext(draftResume, true)}>Back</Button>
        <Button onClick={onFinish} size="lg">Finish & Create Resume</Button>
      </div>
    </div>
  );
}