/**
 * Role-based copy management
 */

export const COPY = {
  executive: {
    headline: "Professional Resumes. Interview-Ready.",
    sub: "AI-driven resume optimization and interview preparation for serious professionals.",
    primaryCTA: "Get Early Access",
    secondaryCTA: "How It Works"
  },
  legal: {
    headline: "Credible Positioning for High-Stakes Careers.",
    sub: "AI resume optimization built for attorneys, CPAs, and professionals who trade on trust.",
    primaryCTA: "Build a Professional Resume",
    secondaryCTA: "View Process"
  },
  tech: {
    headline: "Ship Your Resume Like a Product.",
    sub: "AI-driven optimization, ATS alignment, and interview prep—without fluff.",
    primaryCTA: "Start Free",
    secondaryCTA: "How It Works"
  }
};

/**
 * Get current role with priority:
 * 1. URL query parameter (?role=legal)
 * 2. localStorage preference
 * 3. Default to executive
 */
export function getRole() {
  // Check URL parameter
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const urlRole = urlParams.get("role");
    if (urlRole && COPY[urlRole]) {
      // Store preference
      localStorage.setItem("user_role", urlRole);
      return urlRole;
    }

    // Check localStorage
    const storedRole = localStorage.getItem("user_role");
    if (storedRole && COPY[storedRole]) {
      return storedRole;
    }
  }

  // Default
  return "executive";
}

/**
 * Set role preference
 */
export function setRole(role) {
  if (typeof window !== "undefined" && COPY[role]) {
    localStorage.setItem("user_role", role);
  }
}

/**
 * Get copy for current role
 */
export function getRoleCopy() {
  const role = getRole();
  return COPY[role];
}
