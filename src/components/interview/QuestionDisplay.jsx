import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, User } from 'lucide-react';
import AIAvatar from './AIAvatar';
import { INTERVIEWER_PERSONALITIES } from './AIPersonality';

export default function QuestionDisplay({ 
  question, 
  isLoading, 
  questionIndex, 
  sessionType = 'executive',
  avatarEmotion = 'neutral',
  isAvatarSpeaking = false 
}) {
  const interviewer = INTERVIEWER_PERSONALITIES[sessionType] || INTERVIEWER_PERSONALITIES.executive;
  
  return (
    <div className="space-y-6">
      {/* AI Avatar Section */}
      <div className="text-center">
        <AIAvatar 
          emotion={avatarEmotion}
          isListening={false}
          isSpeaking={isAvatarSpeaking}
          interviewerName={interviewer.name}
        />
        
        {/* Interviewer Introduction */}
        <div className="mt-4 p-4 bg-white/50 rounded-xl">
          <h3 className="font-semibold text-lg text-navy mb-1">{interviewer.name}</h3>
          <p className="text-slate-600 text-sm mb-2">{interviewer.title}</p>
          <p className="text-xs text-slate-500 italic">"{interviewer.traits.communication_style}"</p>
        </div>
      </div>

      {/* Question Card */}
      <Card className="bg-white/50 border-navy/10 shadow-lg animate-fade-in">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-navy rounded-full text-warm-white mt-1 flex-shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold text-gold">Question {questionIndex + 1} of 5</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-3 h-3" />
                  {interviewer.name}
                </div>
              </div>
              {isLoading && !question ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
              ) : (
                <div>
                  <p className="text-xl md:text-2xl font-semibold text-navy leading-snug mb-3">
                    {question}
                  </p>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 italic">
                      💡 Tip: {interviewer.traits.questioning_approach}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}