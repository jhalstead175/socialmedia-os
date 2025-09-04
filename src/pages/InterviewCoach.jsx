import React, { useState, useEffect } from "react";
import { InterviewSession } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Video, Mic, StopCircle, ArrowRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

import SessionSetup from "../components/interview/SessionSetup";
import QuestionDisplay from "../components/interview/QuestionDisplay";
import Controls from "../components/interview/Controls";
import FeedbackDisplay from "../components/interview/FeedbackDisplay";
import SessionSummary from "../components/interview/SessionSummary";
import { INTERVIEWER_PERSONALITIES, generateAIResponse } from "../components/interview/AIPersonality";

const INTERVIEW_STATES = {
  SETUP: 'SETUP',
  QUESTION: 'QUESTION',
  ANSWERING: 'ANSWERING',
  FEEDBACK: 'FEEDBACK',
  SUMMARY: 'SUMMARY',
};

export default function InterviewCoach() {
  const [sessionState, setSessionState] = useState(INTERVIEW_STATES.SETUP);
  const [sessionData, setSessionData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [avatarEmotion, setAvatarEmotion] = useState('neutral');
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);

  const startSession = async (sessionType, targetRole) => {
    setIsLoading(true);
    setError(null);
    try {
      const newSession = await InterviewSession.create({
        session_type: sessionType,
        questions_answered: 0,
      });
      setSessionData({ ...newSession, targetRole });

      // Set avatar emotion to encouraging at start
      setAvatarEmotion('encouraging');
      setIsAvatarSpeaking(true);
      
      setTimeout(() => {
        setIsAvatarSpeaking(false);
        setAvatarEmotion('neutral');
      }, 2000);

      await generateQuestion(sessionType, targetRole, []);
      setSessionState(INTERVIEW_STATES.QUESTION);
    } catch (err) {
      console.error("Error starting session:", err);
      setError("Failed to start interview session. Please try again.");
    }
    setIsLoading(false);
  };

  const generateQuestion = async (sessionType, targetRole, previousQuestions) => {
    setIsLoading(true);
    setError(null);
    setIsAvatarSpeaking(true);
    setAvatarEmotion('thoughtful');
    
    try {
      const interviewer = INTERVIEWER_PERSONALITIES[sessionType] || INTERVIEWER_PERSONALITIES.executive;
      
      const prompt = `
        You are ${interviewer.name}, a ${interviewer.title}. 
        Your interviewing style: ${interviewer.traits.communication_style}
        Your approach: ${interviewer.traits.questioning_approach}
        
        Conduct a ${sessionType} interview for a candidate targeting the role of "${targetRole || 'a senior leadership position'}".
        
        Previous questions asked:
        ${previousQuestions.map(q => `- ${q.question}`).join('\n')}
        
        Ask the next interview question in your characteristic style. The question should be:
        - Challenging but fair for an executive-level candidate
        - Different from previous questions
        - Aligned with your interviewing personality
        - Specific to the ${sessionType} interview type
      `;
      
      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            question: { type: "string" },
            context: { type: "string" }
          }
        }
      });
      
      setCurrentQuestion(result.question);
      
      // Avatar finishes speaking
      setTimeout(() => {
        setIsAvatarSpeaking(false);
        setAvatarEmotion('neutral');
      }, 1500);
      
    } catch (err) {
      console.error("Error generating question:", err);
      setError("Failed to generate interview question. Please try again.");
      setIsAvatarSpeaking(false);
      setAvatarEmotion('concerned');
    }
    setIsLoading(false);
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    setIsLoading(true);
    setError(null);
    setSessionState(INTERVIEW_STATES.FEEDBACK);

    // Avatar reacts to the answer
    const aiResponse = generateAIResponse(sessionData.session_type, currentQuestion, currentAnswer);
    setAvatarEmotion(aiResponse.suggested_emotion);
    setIsAvatarSpeaking(true);

    try {
      const interviewer = INTERVIEWER_PERSONALITIES[sessionData.session_type];
      
      const prompt = `
        You are ${interviewer.name}, interviewing for "${sessionData.targetRole || 'a senior executive'}" position.
        
        Question asked: "${currentQuestion}"
        Candidate's answer: "${currentAnswer}"
        
        Your personality traits:
        - Communication style: ${interviewer.traits.communication_style}
        - Personality: ${interviewer.traits.personality}
        - Background: ${interviewer.traits.background}
        
        Provide feedback in your characteristic style. Evaluate:
        - Clarity and structure of the response
        - Relevance to the question and role
        - Leadership and strategic thinking demonstrated
        - Communication effectiveness
        - Specific areas for improvement
        
        Give scores (1-100) for each dimension and provide constructive feedback that matches your personality.
      `;
      
      const feedbackResult = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            clarity_score: { type: "number" },
            relevance_score: { type: "number" },
            leadership_score: { type: "number" },
            communication_score: { type: "number" },
            overall_score: { type: "number" },
            strengths: { type: "string" },
            improvement_suggestions: { type: "string" },
            interviewer_comment: { type: "string" }
          }
        }
      });
      
      setCurrentFeedback({
        ...feedbackResult,
        conciseness_score: feedbackResult.relevance_score, // Map for compatibility
        confidence_score: feedbackResult.leadership_score
      });

      const updatedQuestionsData = [
        ...(sessionData.questions_data || []),
        {
          question: currentQuestion,
          response_duration: 0,
          individual_score: feedbackResult.overall_score,
          feedback: feedbackResult.improvement_suggestions
        }
      ];

      const updatedSession = await InterviewSession.update(sessionData.id, {
        questions_answered: (sessionData.questions_answered || 0) + 1,
        questions_data: updatedQuestionsData,
      });

      setSessionData(updatedSession);
      
      // Avatar finishes giving feedback
      setTimeout(() => {
        setIsAvatarSpeaking(false);
      }, 3000);

    } catch (err) {
      console.error("Error getting feedback:", err);
      setError("Failed to analyze your answer. Please try again.");
      setAvatarEmotion('concerned');
      setIsAvatarSpeaking(false);
    }
    setIsLoading(false);
  };

  const nextQuestion = () => {
    if (questionIndex >= 4) {
      endSession();
      return;
    }
    
    setCurrentAnswer("");
    setCurrentFeedback(null);
    setQuestionIndex(prev => prev + 1);
    setSessionState(INTERVIEW_STATES.QUESTION);
    setAvatarEmotion('neutral');
    
    const previousQuestions = sessionData.questions_data || [];
    generateQuestion(sessionData.session_type, sessionData.targetRole, previousQuestions);
  };
  
  const endSession = async () => {
    setIsLoading(true);
    setError(null);
    setAvatarEmotion('encouraging');
    setIsAvatarSpeaking(true);
    
    try {
      const finalScores = sessionData.questions_data.reduce((acc, q) => {
        acc.overall += q.individual_score;
        return acc;
      }, { overall: 0 });
      
      const finalAvgScore = Math.round(finalScores.overall / sessionData.questions_data.length);
      
      const finalSession = await InterviewSession.update(sessionData.id, {
        overall_score: finalAvgScore,
        feedback_summary: "Session complete. Review your performance on each question."
      });

      setSessionData(finalSession);
      setSessionState(INTERVIEW_STATES.SUMMARY);
      
      setTimeout(() => {
        setIsAvatarSpeaking(false);
      }, 2000);
      
    } catch (err) {
      console.error("Error ending session:", err);
      setError("Failed to finalize session. Please check your network connection.");
      setAvatarEmotion('concerned');
      setIsAvatarSpeaking(false);
    }
    setIsLoading(false);
  };

  const renderContent = () => {
    switch (sessionState) {
      case INTERVIEW_STATES.SETUP:
        return <SessionSetup onStart={startSession} isLoading={isLoading} />;
      case INTERVIEW_STATES.QUESTION:
      case INTERVIEW_STATES.ANSWERING:
        return (
          <>
            <QuestionDisplay 
              question={currentQuestion} 
              isLoading={isLoading} 
              questionIndex={questionIndex}
              sessionType={sessionData?.session_type}
              avatarEmotion={avatarEmotion}
              isAvatarSpeaking={isAvatarSpeaking}
            />
            <Controls 
              sessionState={sessionState}
              onAnswerChange={setCurrentAnswer}
              answer={currentAnswer}
              onSubmit={submitAnswer}
              onStateChange={setSessionState}
              isLoading={isLoading}
            />
          </>
        );
      case INTERVIEW_STATES.FEEDBACK:
        return (
            <FeedbackDisplay 
                feedback={currentFeedback} 
                isLoading={isLoading} 
                onNext={nextQuestion}
                isLastQuestion={questionIndex >= 4}
                sessionType={sessionData?.session_type}
                avatarEmotion={avatarEmotion}
                isAvatarSpeaking={isAvatarSpeaking}
            />
        );
      case INTERVIEW_STATES.SUMMARY:
        return <SessionSummary 
          session={sessionData} 
          onRestart={() => {
            setSessionState(INTERVIEW_STATES.SETUP);
            setAvatarEmotion('neutral');
            setQuestionIndex(0);
          }} 
        />;
      default:
        return null;
    }
  };

  // Error display for SETUP state
  if (error && sessionState === INTERVIEW_STATES.SETUP) {
    return (
      <div className="min-h-full bg-warm-white flex flex-col items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={() => setError(null)} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-warm-white flex flex-col p-4 md:p-6">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-navy flex items-center gap-3">
          <Video className="w-6 h-6 md:w-8 md:h-8 text-gold" />
          AI Interview Coach
        </h1>
        <p className="text-slate-600 mt-1 max-w-2xl text-sm md:text-base">
          Meet your personal AI interviewer - a professional with realistic personality and expert feedback.
        </p>
      </header>

      {error && sessionState !== INTERVIEW_STATES.SETUP && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}