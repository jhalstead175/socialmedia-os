/**
 * Lightweight analytics tracking
 */

/**
 * Get or assign A/B test variant
 * Stored in localStorage for consistency across sessions
 */
export function getHeadlineVariant() {
  if (typeof window === "undefined") return "A";

  let variant = localStorage.getItem("headline_variant");

  if (!variant) {
    // Assign variant (50/50 split)
    variant = Math.random() > 0.5 ? "A" : "B";
    localStorage.setItem("headline_variant", variant);
  }

  return variant;
}

/**
 * Track event (replace with your analytics provider)
 */
export function track(eventName, properties = {}) {
  if (typeof window === "undefined") return;

  // Add variant and role to all events
  const enrichedProperties = {
    ...properties,
    variant: getHeadlineVariant(),
    role: localStorage.getItem("user_role") || "executive",
    timestamp: new Date().toISOString()
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${eventName}`, enrichedProperties);
  }

  // TODO: Send to analytics provider
  // Example: window.analytics?.track(eventName, enrichedProperties);
}

/**
 * Headline variants for A/B testing
 */
export const HEADLINES = {
  A: "Professional Resumes. Interview-Ready.",
  B: "Position Yourself to Win the Interview."
};

/**
 * Get current headline variant
 */
export function getHeadline() {
  const variant = getHeadlineVariant();
  return HEADLINES[variant];
}
