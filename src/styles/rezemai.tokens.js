/**
 * Rezemai Brand Style Tokens
 * Tier-5K production styling - clean, fast, operator-grade
 */

export const theme = {
  colors: {
    bg: "#0B0F14",
    panel: "#111827",
    textPrimary: "#FFFFFF",
    textSecondary: "#CBD5E1",
    accent: "#10B981", // emerald (single accent only)
    border: "#1F2937"
  },
  radius: {
    card: "rounded-xl",
    button: "rounded-lg"
  },
  shadow: {
    soft: "shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
  },
  spacing: {
    section: "py-24",
    container: "max-w-7xl mx-auto px-6"
  },
  typography: {
    headings: "tracking-tight font-semibold",
    body: "leading-relaxed"
  }
};

// Role-based copy variants
export const ROLE_COPY = {
  executive: {
    headline: "Results-Ready Resumes. Interview Confidence Built In.",
    sub: "Precision AI for leaders who don't have time to iterate.",
    primaryCTA: "Get Early Access",
    secondaryCTA: "See How It Works"
  },
  legal: {
    headline: "Clear Positioning. Credible Tone. Interview-Ready.",
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

// Stripe pricing IDs
export const STRIPE_PRICES = {
  FREE: null,
  PRO: "price_rezemai_pro_monthly",
  ELITE: "price_rezemai_elite_monthly"
};

// Pricing tiers
export const PRICING_TIERS = {
  free: {
    name: "Free",
    price: "$0",
    period: "/forever",
    description: "Resume Score + Preview",
    features: [
      "Resume score analysis",
      "Basic formatting review",
      "ATS compatibility check",
      "Preview mode only"
    ],
    cta: "Start Free",
    stripePrice: STRIPE_PRICES.FREE,
    highlighted: false
  },
  pro: {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "Full optimization, ATS, exports",
    features: [
      "Everything in Free",
      "Full resume optimization",
      "ATS-optimized exports (PDF/DOCX)",
      "Unlimited revisions",
      "Custom templates",
      "Email support"
    ],
    cta: "Get Pro",
    stripePrice: STRIPE_PRICES.PRO,
    highlighted: true
  },
  elite: {
    name: "Elite",
    price: "$79",
    period: "/mo",
    description: "Interview coaching, tone control",
    features: [
      "Everything in Pro",
      "AI interview coach",
      "Real-time feedback",
      "Tone & style control",
      "Mock interview sessions",
      "Priority support",
      "Career guidance"
    ],
    cta: "Get Elite",
    stripePrice: STRIPE_PRICES.ELITE,
    highlighted: false
  }
};
