// AI Interviewer Personalities and Traits
export const INTERVIEWER_PERSONALITIES = {
  executive: {
    name: "Victoria Sterling",
    title: "Executive Search Partner",
    traits: {
      communication_style: "Direct, strategic, and results-focused",
      questioning_approach: "Probes for leadership impact and business acumen",
      personality: "Confident, analytical, and decisive",
      background: "Former Fortune 500 CEO with 20+ years in executive search"
    },
    speaking_patterns: [
      "Let's dive right into the strategic aspects...",
      "I'm particularly interested in your approach to...",
      "Tell me about a time when you had to make a difficult leadership decision...",
      "How do you measure success in executive roles?",
      "What's your philosophy on organizational transformation?"
    ],
    reactions: {
      impressive: "That's exactly the kind of strategic thinking we're looking for.",
      needs_improvement: "I'd like you to be more specific about the measurable impact.",
      encouraging: "You're on the right track. Can you elaborate on the outcomes?",
      challenging: "Many executives struggle with this. How would you handle it differently?"
    }
  },
  legal: {
    name: "Robert Chambers",
    title: "Senior Legal Counsel",
    traits: {
      communication_style: "Precise, methodical, and detail-oriented",
      questioning_approach: "Focuses on analytical thinking and ethical reasoning",
      personality: "Thoughtful, thorough, and principled",
      background: "Harvard Law graduate with 15+ years in corporate law"
    },
    speaking_patterns: [
      "Let's examine this from a legal perspective...",
      "How would you approach a complex regulatory challenge?",
      "Tell me about your experience with compliance frameworks...",
      "What's your methodology for risk assessment?",
      "How do you balance legal requirements with business objectives?"
    ],
    reactions: {
      impressive: "Your analytical approach demonstrates strong legal reasoning.",
      needs_improvement: "I'd recommend being more thorough in your analysis.",
      encouraging: "Good foundation. Let's explore the ethical implications.",
      challenging: "This is a complex area. How would you research this issue?"
    }
  },
  behavioral: {
    name: "Sarah Mitchell",
    title: "Chief Human Resources Officer",
    traits: {
      communication_style: "Empathetic, insightful, and people-focused",
      questioning_approach: "Uses STAR method to uncover behavioral patterns",
      personality: "Warm, perceptive, and encouraging",
      background: "20+ years in talent development and organizational psychology"
    },
    speaking_patterns: [
      "I'd love to hear about a specific situation where...",
      "Tell me about a time when you faced a challenging team dynamic...",
      "How did you handle that situation?",
      "What was the outcome and what did you learn?",
      "Can you walk me through your thought process?"
    ],
    reactions: {
      impressive: "That's a wonderful example of emotional intelligence in action.",
      needs_improvement: "Can you provide more specific details about your actions?",
      encouraging: "I can see your growth mindset coming through. Tell me more.",
      challenging: "That sounds difficult. How did you maintain team morale?"
    }
  }
};

export const generateAIResponse = (interviewerType, context, userResponse) => {
  const personality = INTERVIEWER_PERSONALITIES[interviewerType];
  
  return {
    personality: personality,
    response_style: personality.traits.communication_style,
    suggested_emotion: determineEmotion(userResponse),
    speaking_pattern: getRandomSpeakingPattern(personality),
    reaction: getReactionType(userResponse, personality)
  };
};

const determineEmotion = (userResponse) => {
  const responseLength = userResponse.length;
  const hasSpecifics = /\b(increased|decreased|improved|achieved|led|managed)\b/i.test(userResponse);
  const hasNumbers = /\d+/.test(userResponse);
  
  if (hasSpecifics && hasNumbers && responseLength > 100) {
    return 'impressed';
  } else if (responseLength < 50) {
    return 'concerned';
  } else if (hasSpecifics) {
    return 'encouraging';
  }
  return 'thoughtful';
};

const getRandomSpeakingPattern = (personality) => {
  const patterns = personality.speaking_patterns;
  return patterns[Math.floor(Math.random() * patterns.length)];
};

const getReactionType = (userResponse, personality) => {
  const responseQuality = analyzeResponse(userResponse);
  return personality.reactions[responseQuality];
};

const analyzeResponse = (response) => {
  const length = response.length;
  const hasSpecifics = /\b(specifically|particularly|for example|such as)\b/i.test(response);
  const hasMetrics = /\d+%|\$[\d,]+|\b\d+\b/.test(response);
  
  if (length > 150 && hasSpecifics && hasMetrics) return 'impressive';
  if (length < 30) return 'needs_improvement';
  if (hasSpecifics || hasMetrics) return 'encouraging';
  return 'challenging';
};