import React from 'react';
import { UserCircle } from 'lucide-react';

// PRODUCTION FIX: Removed three.js dependency
// Replaced 3D avatar with simple placeholder icon for launch
// Re-enable 3D avatar after installing three.js and testing

export default function AIAvatar({
  emotion = 'neutral',
  isListening = false,
  isSpeaking = false,
  interviewerName = "Alexandra",
  className = ""
}) {
  // Map emotions to colors for simple visual feedback
  const emotionColors = {
    encouraging: 'text-blue-600',
    thoughtful: 'text-purple-600',
    impressed: 'text-green-600',
    concerned: 'text-red-600',
    neutral: 'text-blue-700'
  };

  const textColor = emotionColors[emotion] || emotionColors.neutral;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`relative ${textColor}`}>
        <UserCircle
          className={`w-24 h-24 ${isSpeaking ? 'animate-pulse' : ''} ${isListening ? 'opacity-70' : 'opacity-100'}`}
        />
        {isListening && (
          <div className="absolute inset-0 border-2 border-current rounded-full animate-ping" />
        )}
      </div>
      <p className="mt-2 text-sm font-medium text-slate-600">{interviewerName}</p>
      {isSpeaking && (
        <p className="text-xs text-slate-500 mt-1">Speaking...</p>
      )}
      {isListening && !isSpeaking && (
        <p className="text-xs text-slate-500 mt-1">Listening...</p>
      )}
    </div>
  );
}
