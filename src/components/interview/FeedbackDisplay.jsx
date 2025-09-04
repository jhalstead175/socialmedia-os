import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ThumbsUp, ThumbsDown, ArrowRight, Sparkles, Check, PartyPopper } from 'lucide-react';
import AIAvatar from './AIAvatar';
import { INTERVIEWER_PERSONALITIES } from './AIPersonality';

const ScoreBar = ({ label, score }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="text-sm font-bold text-navy">{score}%</p>
    </div>
    <Progress value={score} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-gold/70 [&>div]:to-gold" />
  </div>
);

export default function FeedbackDisplay({ 
  feedback, 
  isLoading, 
  onNext, 
  isLastQuestion, 
  sessionType = 'executive',
  avatarEmotion = 'thoughtful',
  isAvatarSpeaking = false 
}) {
  const interviewer = INTERVIEWER_PERSONALITIES[sessionType] || INTERVIEWER_PERSONALITIES.executive;
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Avatar while thinking */}
        <div className="text-center">
          <AIAvatar 
            emotion="thoughtful"
            isListening={false}
            isSpeaking={true}
            interviewerName={interviewer.name}
          />
          <div className="mt-4 p-4 bg-white/50 rounded-xl">
            <p className="text-slate-600 italic">"{interviewer.name} is analyzing your response..."</p>
          </div>
        </div>
        
        <Card className="shadow-lg animate-pulse">
          <CardContent className="p-8 space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!feedback) return null;

  return (
    <div className="space-y-6">
      {/* Avatar giving feedback */}
      <div className="text-center">
        <AIAvatar 
          emotion={avatarEmotion}
          isListening={false}
          isSpeaking={isAvatarSpeaking}
          interviewerName={interviewer.name}
        />
        
        <div className="mt-4 p-4 bg-white/50 rounded-xl">
          <h3 className="font-semibold text-navy mb-2">{interviewer.name}'s Assessment</h3>
          {feedback.interviewer_comment && (
            <p className="text-slate-700 italic">"{feedback.interviewer_comment}"</p>
          )}
        </div>
      </div>

      <Card className="shadow-2xl border-navy/10 animate-fade-in-up">
        <CardContent className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-gold" />
            <h2 className="text-2xl font-bold text-navy">Professional Feedback</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ScoreBar label="Overall Score" score={feedback.overall_score} />
              <ScoreBar label="Clarity" score={feedback.clarity_score} />
              <ScoreBar label="Relevance" score={feedback.relevance_score || feedback.conciseness_score} />
              <ScoreBar label="Leadership" score={feedback.leadership_score || feedback.confidence_score} />
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-navy flex items-center gap-2 mb-2">
                  <ThumbsUp className="w-5 h-5 text-green-600"/>What Impressed Me
                </h3>
                <p className="text-slate-700 bg-green-50 p-3 rounded-lg border border-green-200">
                  {feedback.strengths}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-navy flex items-center gap-2 mb-2">
                  <ThumbsDown className="w-5 h-5 text-amber-600"/>Areas to Strengthen
                </h3>
                <p className="text-slate-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  {feedback.improvement_suggestions}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-right">
            <Button onClick={onNext} size="lg" className="bg-navy hover:bg-navy/90 text-warm-white font-bold">
              {isLastQuestion ? 'Complete Interview' : 'Next Question'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}