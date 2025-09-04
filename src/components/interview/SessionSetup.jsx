import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Loader2, User, Briefcase, Scale, BrainCircuit } from 'lucide-react';
import { usePaywall } from '../subscription/PaywallProvider';

const sessionTypes = [
  { id: 'behavioral', name: 'Behavioral', icon: User, requiredPlan: 'starter' },
  { id: 'executive', name: 'Executive Case', icon: Briefcase, requiredPlan: 'pro' },
  { id: 'legal', name: 'Legal/Compliance', icon: Scale, requiredPlan: 'elite' },
  { id: 'technical', name: 'Technical Leadership', icon: BrainCircuit, requiredPlan: 'elite' },
];

export default function SessionSetup({ onStart, isLoading }) {
  const [sessionType, setSessionType] = useState('behavioral');
  const [targetRole, setTargetRole] = useState('');
  const { requirePlan } = usePaywall();

  const handleStart = async () => {
    const selectedSession = sessionTypes.find(s => s.id === sessionType);
    if (selectedSession.requiredPlan !== 'starter') {
      const featureKey = selectedSession.id === 'executive' ? 'interview_sim' : 'industry_templates';
      if (!requirePlan(selectedSession.requiredPlan, featureKey)) {
        return;
      }
    }
    onStart(sessionType, targetRole);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-navy">Set Up Your Interview Practice</CardTitle>
        <p className="text-slate-600">Choose a session type and specify your target role for a tailored experience.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-semibold text-slate-800">1. Select Interview Type</Label>
          <Tabs value={sessionType} onValueChange={setSessionType} className="w-full mt-2">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              {sessionTypes.map((type) => (
                <TabsTrigger key={type.id} value={type.id} className="flex flex-col gap-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <type.icon className="w-4 h-4" />
                  <span className="text-xs">{type.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div>
          <Label htmlFor="target-role" className="text-sm font-semibold text-slate-800">2. What is your target role?</Label>
          <Input
            id="target-role"
            placeholder="e.g., Chief Financial Officer, VP of Engineering"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="mt-2"
          />
        </div>
        
        <Button
          onClick={handleStart}
          disabled={isLoading || !targetRole}
          className="w-full bg-navy hover:bg-navy/90 text-warm-white text-base py-6"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <>
              Start Session
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}