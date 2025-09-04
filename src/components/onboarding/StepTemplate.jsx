
import React, { useState, Suspense } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
const TemplatePreview = React.lazy(() => import("../templates/TemplatePreview"));

const templates = [
  { id: 'executive-modern', name: 'Executive' },
  { id: 'legal-professional', name: 'Legal' },
  { id: 'creative-executive', name: 'Creative' }
];

export default function StepTemplate({ onNext, draftResume, setDraftResume }) {
  const [selected, setSelected] = useState(draftResume.template_key || 'executive-modern');

  const handleSelect = (templateId) => {
    setSelected(templateId);
    setDraftResume(prev => ({...prev, template_key: templateId}));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-navy">Pick a clean, ATS-ready template</h2>
      <p className="text-slate-600">Choose a professionally designed template. You can change this later.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {templates.map(t => (
            <Card 
              key={t.id} 
              onClick={() => handleSelect(t.id)}
              className={`p-4 cursor-pointer border-2 ${selected === t.id ? 'border-navy' : 'hover:border-slate-400'}`}
              data-tour={t.id === 'executive-modern' ? 'ob-template' : undefined}
            >
              <h3 className="font-semibold">{t.name} Template</h3>
            </Card>
          ))}
        </div>
        <div>
          <Card className="p-4">
            <React.Suspense fallback={<Skeleton className="h-[500px] w-full"/>}>
              <TemplatePreview template={selected} resume={draftResume} scale={0.6}/>
            </React.Suspense>
          </Card>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="ghost" onClick={() => onNext(draftResume, true)}>Back</Button>
        <Button onClick={() => onNext(draftResume)} size="lg">Continue</Button>
      </div>
    </div>
  );
}
