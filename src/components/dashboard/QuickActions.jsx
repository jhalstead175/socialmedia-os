
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Sparkles, FileText, Briefcase, Layers } from "lucide-react";
import { usePaywall } from '../subscription/PaywallProvider';

export default function QuickActions() {
    const { requirePlan } = usePaywall();

    const handleNarrativeBuilder = () => {
        requirePlan('elite', 'executive_narrative');
    };

    const handlePortfolioBuilder = () => {
        requirePlan('elite', 'portfolio_builder');
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4 text-navy">Quick Actions</h3>
            <div className="space-y-3">
                <Link to={createPageUrl("ResumeBuilder")}>
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 text-base" data-tour="tailor">
                        <FileText className="w-5 h-5 text-blue-600" /> New Résumé
                    </Button>
                </Link>
                <Link to={createPageUrl("InterviewCoach")}>
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 text-base">
                        <Sparkles className="w-5 h-5 text-amber-500" /> Start Interview Drill
                    </Button>
                </Link>
                 <Button onClick={handleNarrativeBuilder} variant="outline" className="w-full justify-start gap-3 h-12 text-base relative">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    <span>Executive Narrative</span>
                    <span className="absolute top-1 right-1 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">Elite</span>
                </Button>
                <Button onClick={handlePortfolioBuilder} variant="outline" className="w-full justify-start gap-3 h-12 text-base relative">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <span>Portfolio Builder</span>
                     <span className="absolute top-1 right-1 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold">Elite</span>
                </Button>
            </div>
        </div>
    );
}
