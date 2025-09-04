import React from 'react';
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";

export default function OnboardingNav({ currentStep, steps }) {
  const stepIndex = steps.findIndex(s => s.id === currentStep);
  const progressValue = ((stepIndex + 1) / steps.length) * 100;

  return (
    <div className="w-full mb-8">
      <Progress value={progressValue} className="mb-4 h-2" />
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="text-center flex-1">
            <div className={`flex items-center justify-center gap-2 font-semibold ${index <= stepIndex ? 'text-navy' : 'text-slate-400'}`}>
              {index < stepIndex ? <CheckCircle className="w-4 h-4 text-green-500" /> : <div className={`w-3 h-3 rounded-full border-2 ${index === stepIndex ? 'border-navy bg-navy' : 'border-slate-400'}`}></div>}
              <span className="text-sm">{step.title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}