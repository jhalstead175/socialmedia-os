import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, StopCircle, SendHorizonal, Loader2 } from 'lucide-react';

const INTERVIEW_STATES = {
  SETUP: 'SETUP',
  QUESTION: 'QUESTION',
  ANSWERING: 'ANSWERING',
  FEEDBACK: 'FEEDBACK',
  SUMMARY: 'SUMMARY',
};

export default function Controls({ sessionState, onAnswerChange, answer, onSubmit, onStateChange, isLoading }) {

  if (sessionState === INTERVIEW_STATES.QUESTION) {
    return (
      <div className="text-center">
        <Button 
          size="lg"
          className="bg-gold hover:bg-gold/90 text-navy font-bold rounded-full py-8 px-8 shadow-lg"
          onClick={() => onStateChange(INTERVIEW_STATES.ANSWERING)}
        >
          <Mic className="w-6 h-6 mr-3" />
          Start Answering
        </Button>
        <p className="text-slate-500 text-sm mt-3">Click to start typing your answer.</p>
      </div>
    )
  }

  if (sessionState === INTERVIEW_STATES.ANSWERING) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Textarea
          placeholder="Articulate your response here..."
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          className="h-48 text-base p-4 border-navy/20 focus:ring-gold"
          disabled={isLoading}
        />
        <div className="flex justify-end">
          <Button
            size="lg"
            className="bg-navy hover:bg-navy/90 text-warm-white font-bold rounded-xl"
            onClick={onSubmit}
            disabled={isLoading || !answer.trim()}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <SendHorizonal className="w-5 h-5 mr-2" />
            )}
            Submit for Feedback
          </Button>
        </div>
      </div>
    )
  }

  return null;
}