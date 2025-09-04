
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { FilePlus, Video, ArrowRight, Sparkles } from 'lucide-react';

export default function GettingStarted() {
  return (
    <div className="bg-gradient-to-br from-navy to-slate-800 p-8 rounded-2xl md:rounded-3xl shadow-2xl my-8 text-white">
      <div className="text-center">
        <Sparkles className="w-10 h-10 text-gold mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2 font-poppins">Let's Get Started</h2>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Your journey to securing your next executive position begins now with REZEMAI. Take the first step.
        </p>
      </div>
      <div className="mt-8 grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <Link to={createPageUrl('ResumeBuilder')} className="h-full">
          <div className="group bg-white/10 p-6 rounded-xl hover:bg-white/20 transition-all duration-300 h-full flex flex-col justify-between text-left">
            <div>
              <div className="p-3 bg-gold/20 rounded-lg inline-block mb-3">
                <FilePlus className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Build Your Résumé</h3>
              <p className="text-slate-300">
                Craft a compelling, ATS-optimized résumé with our AI-powered builder.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-gold font-semibold">
              Start Building <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
        <Link to={createPageUrl('InterviewCoach')} className="h-full">
          <div className="group bg-white/10 p-6 rounded-xl hover:bg-white/20 transition-all duration-300 h-full flex flex-col justify-between text-left">
            <div>
              <div className="p-3 bg-gold/20 rounded-lg inline-block mb-3">
                <Video className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Practice Interviewing</h3>
              <p className="text-slate-300">
                Hone your skills and build confidence with our AI interview coach.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-gold font-semibold">
              Start Practicing <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
