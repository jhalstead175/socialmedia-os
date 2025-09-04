
import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Zap, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { trackEvent } from '@/components/shared/Analytics';
import { usePaywall } from '../subscription/PaywallProvider';
import { usePromoStore } from '../marketing/PromoStore';
import { PromoURL } from '../marketing/PromoURL';
import { BillingURL } from '../subscription/BillingURL';
import HurryChip from '../shared/HurryChip'; // Added import

const REASONS = {
  starter: "Light usage and core essentials—start free and upgrade anytime.",
  pro: "Multiple applications + advanced tailoring and drills each week.",
  elite: "Executive polish and industry-specific templates for high-stakes roles."
};

function computeSuggestion(a) {
  // a = { q1: '1-3'|'4-10'|'10+', q2: {proVers, proTailor, proDrills, eliteNarr, eliteTmpl, elitePort}, q3: 'entry'|'manager'|'exec' }
  let s = 0;
  s += a.q1 === '4-10' ? 1 : a.q1 === '10+' ? 2 : 0;
  s += (a.q2?.proVers ? 1 : 0) + (a.q2?.proTailor ? 1 : 0) + (a.q2?.proDrills ? 1 : 0);
  s += (a.q2?.eliteNarr ? 2 : 0) + (a.q2?.eliteTmpl ? 2 : 0) + (a.q2?.elitePort ? 2 : 0);
  s += a.q3 === 'manager' ? 1 : a.q3 === 'exec' ? 2 : 0;

  const eliteWanted = !!(a.q2?.eliteNarr || a.q2?.eliteTmpl || a.q2?.elitePort);
  let plan = 'starter';
  if (eliteWanted) plan = 'elite';
  else if (s <= 1) plan = 'starter';
  else if (s <= 4) plan = 'pro';
  else plan = 'elite';

  return { plan, score: s, reason: REASONS[plan] };
}

const QuizCard = ({ onComplete, onClose, billing, promo, priceView }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    q1: '',
    q2: {},
    q3: ''
  });
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent('plan_quiz_view');
  }, []);

  const handleAnswer = (question, value, isMultiple = false) => {
    let newAnswers;
    if (question === 'q2') {
      // Toggle boolean flag for feature selection
      newAnswers = {
        ...answers,
        q2: {
          ...answers.q2,
          [value]: !answers.q2[value]
        }
      };
    } else {
      newAnswers = { ...answers, [question]: value };
    }
    
    setAnswers(newAnswers);
    trackEvent('plan_quiz_answer', { q: currentStep, value });
  };

  const canProceed = () => {
    if (currentStep === 1) return !!answers.q1;
    if (currentStep === 2) return true; // Features are optional, can proceed without selection
    if (currentStep === 3) return !!answers.q3;
    return false;
  };

  const handleSubmit = () => {
    const recommendation = computeSuggestion(answers);
    setResult(recommendation);
    
    // Store in localStorage
    localStorage.setItem('rezemai_plan_quiz', JSON.stringify({
      ts: Date.now(),
      plan: recommendation.plan,
      answers
    }));
    
    trackEvent('plan_quiz_submit', { 
      score: recommendation.score, 
      plan: recommendation.plan 
    });
    
    onComplete(recommendation);
  };

  const handleCheckout = (plan) => {
    const base = createPageUrl(`Checkout?plan=${plan}`);
    const withBilling = BillingURL.applyToUrl(base);
    const href = PromoURL.applyToUrl(withBilling);
    
    trackEvent('plan_quiz_cta_click', { 
      plan, 
      billing: BillingURL.get() || 'annual', 
      promo: promo.code || null 
    });
    
    navigate(href);
  };

  if (result) {
    const priceData = priceView({
      plan: result.plan,
      billing,
      promo: promo.valid ? promo : null
    });

    return (
      <div className="card-quiet p-6 border-[var(--bd-weak)] rounded-[var(--r-2xl)] mb-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-[var(--text-100)] mb-2">
            We recommend <strong>{result.plan.charAt(0).toUpperCase() + result.plan.slice(1)}</strong>
          </h3>
          <p className="text-[var(--text-70)] mb-4">{result.reason}</p>
          
          <div className="mb-4">
            {priceData.discounted ? (
              <div>
                <div className="line-through text-[var(--text-60)]">{priceData.original}</div>
                <div className="text-2xl font-bold text-[var(--text-100)]">{priceData.discounted}</div>
              </div>
            ) : result.plan === 'starter' ? (
              <div className="text-2xl font-bold text-[var(--text-100)]">Free</div>
            ) : (
              <div className="text-2xl font-bold text-[var(--text-100)]">{priceData.original}</div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {result.plan !== 'starter' && (
              <Button
                onClick={() => handleCheckout(result.plan)}
                className="btn btn-primary"
              >
                {priceData.ctaLabel || `Upgrade to ${result.plan.charAt(0).toUpperCase() + result.plan.slice(1)}`}
              </Button>
            )}
            
            {result.plan === 'starter' && (
              <Button
                onClick={() => navigate('/auth/signup?plan=starter')}
                className="btn btn-primary"
              >
                Get Started Free
              </Button>
            )}
            
            <button
              onClick={onClose}
              className="text-sm text-[var(--text-70)] hover:text-[var(--text-100)] underline"
            >
              See detailed comparison
            </button>
          </div>

          {priceData.footnote && (
            <p className="text-xs text-[var(--text-60)] mt-3">{priceData.footnote}</p>
          )}
        </div>
        
        <button
          onClick={() => {
            setResult(null);
            setCurrentStep(1);
            setAnswers({ q1: '', q2: {}, q3: '' }); // Reset answers to new structure
            trackEvent('plan_quiz_retake');
          }}
          className="text-sm text-[var(--text-70)] hover:text-[var(--text-100)] underline mt-4 block mx-auto"
        >
          Retake quiz
        </button>
      </div>
    );
  }

  const questions = [
    {
      id: 1,
      question: "How many roles do you typically apply to each month?",
      options: [
        { value: '1-3', label: '1–3' },
        { value: '4-10', label: '4–10' },
        { value: '10+', label: '10+' }
      ],
      type: 'radio',
      field: 'q1'
    },
    {
      id: 2,
      question: "Which features do you need right now?",
      subtitle: "Feature tags help us match the right plan.",
      options: [
        { value: 'proVers', label: 'Unlimited resume versions', tag: 'Pro' },
        { value: 'proTailor', label: 'Role-tailtailored bullet rewrites', tag: 'Pro' },
        { value: 'proDrills', label: 'Interview drills with feedback', tag: 'Pro' },
        { value: 'eliteNarr', label: 'Executive narrative builder', tag: 'Elite' },
        { value: 'eliteTmpl', label: 'Industry templates (Legal • Finance • Tech)', tag: 'Elite' },
        { value: 'elitePort', label: 'Portfolio / case-study builder', tag: 'Elite' }
      ],
      type: 'checkbox',
      field: 'q2'
    },
    {
      id: 3,
      question: "What level are you targeting?",
      options: [
        { value: 'entry', label: 'Entry / IC' },
        { value: 'manager', label: 'Manager / Lead' },
        { value: 'exec', label: 'Director / VP / C-Level' }
      ],
      type: 'radio',
      field: 'q3'
    }
  ];

  const currentQuestion = questions[currentStep - 1];

  return (
    <div className="card-quiet p-6 border-[var(--bd-weak)] rounded-[var(--r-2xl)] mb-6">
      <div className="flex justify-between items-center mb-4">
        <Badge className="badge">{currentStep}/3</Badge>
        <button
          onClick={onClose}
          className="text-[var(--text-60)] hover:text-[var(--text-100)]"
          aria-label="Close quiz"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <fieldset className="mb-6">
        <legend className="text-lg font-semibold text-[var(--text-100)] mb-2">
          {currentQuestion.question}
        </legend>
        {currentQuestion.subtitle && (
          <p className="text-sm text-[var(--text-60)] mb-4">{currentQuestion.subtitle}</p>
        )}

        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 p-3 rounded-lg border border-[var(--bd-weak)] hover:bg-[var(--surf-1)] cursor-pointer transition-colors"
            >
              <input
                type={currentQuestion.type}
                name={currentQuestion.field}
                value={option.value}
                checked={
                  currentQuestion.type === 'radio'
                    ? answers[currentQuestion.field] === option.value
                    : !!answers.q2[option.value] // Updated for q2 checkbox logic
                }
                onChange={() => handleAnswer(
                  currentQuestion.field,
                  option.value,
                  currentQuestion.type === 'checkbox'
                )}
                className="w-4 h-4"
              />
              <span className="text-[var(--text-100)] flex-1">{option.label}</span>
              {option.tag && (
                <Badge className="badge text-xs">{option.tag}</Badge>
              )}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 1}
          className="btn btn-outline"
        >
          Back
        </Button>
        
        {currentStep < 3 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="btn btn-outline"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed()}
            className="btn btn-primary"
          >
            Submit
          </Button>
        )}
      </div>
    </div>
  );
};

const PlanCompareDrawer = ({ open, onClose }) => {
  const [billing, setBilling] = useState('annual');
  // Renamed showQuiz to quizExpanded for consistency as per outline's implied usage
  const [quizExpanded, setQuizExpanded] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const navigate = useNavigate();
  const { requirePlan } = usePaywall();
  const promo = usePromoStore();
  const headerRef = useRef(null);

  // Price constants
  const PRICE = {
    starter: { monthly: 0, annual: 0 },
    pro: { monthly: 19, annual: 144 },
    elite: { monthly: 49, annual: 468 }
  };

  // Price formatters
  const fmt = (n) => `$${Number(n).toFixed(2).replace(/\.00$/,'')}`;

  // Returns { original, discounted, footnote, ctaLabel }
  function priceView({ plan, billing, promo }) {
    const base = PRICE[plan][billing];
    if (!promo?.valid || !promo.applies_to_plans?.includes(plan) || !promo.applies_to_billing?.includes(billing)) {
      return {
        original: billing==='monthly' ? `${fmt(base)}/mo` : `${fmt(base)}/yr`,
        discounted: null,
        footnote: null,
        ctaLabel: "Upgrade"
      };
    }

    const type = promo.type;
    const val  = promo.value_number;
    const dur  = promo.duration;
    const N    = promo.duration_in_months || (billing==='annual' && dur!=='once' ? 12 : 1);

    let disc;
    if (type === "percent") {
      const factor = Math.max(0, 1 - val/100);
      disc = +(base * factor).toFixed(2);
    } else {
      const off = billing==='monthly' ? val/100 : (dur==='once' ? val/100 : (val/100)*N);
      disc = Math.max(0, +(base - off).toFixed(2));
    }

    let foot;
    if (dur === "once")           foot = billing==='monthly' ? `First month` : `First year`;
    else if (dur === "forever")   foot = `Every renewal`;
    else                          foot = billing==='monthly' ? `First ${N} mo` : `First year`;

    const original = billing==='monthly' ? `${fmt(base)}/mo` : `${fmt(base)}/yr`;
    const discounted = billing==='monthly' ? `${fmt(disc)}/mo` : `${fmt(disc)}/yr`;
    const footnote = type==="percent"
      ? `Save ${val}% • ${foot}`
      : `Save ${fmt(val/100)}${dur==='repeating' ? (billing==='monthly' ? `/mo • ${foot}` : ` • ${foot}`) : ` • ${foot}`}`;

    const ctaLabel = promo.code
      ? `Apply ${promo.code} & Upgrade — ${billing==='monthly' ? fmt(disc)+"/mo" : fmt(disc)+"/yr"}`
      : `Upgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)}`;

    return { original, discounted, footnote, ctaLabel };
  }

  useEffect(() => {
    if (open) {
      BillingURL.syncFromCurrentUrl();
      PromoURL.syncFromCurrentUrl();
      setBilling(BillingURL.get() || 'annual');
      
      trackEvent('plan_compare_open', { 
        billing: BillingURL.get() || 'annual', 
        promo: promo.code || null 
      });

      const storedQuizResult = localStorage.getItem('rezemai_plan_quiz');
      if (storedQuizResult) {
        try {
          const parsed = JSON.parse(storedQuizResult);
          const sevenDays = 7 * 24 * 60 * 60 * 1000; // Changed from 14 days to 7 days as per outline
          if (Date.now() - parsed.ts < sevenDays) {
            setQuizResult(parsed);
          }
        } catch (e) {
          console.warn('Could not parse stored quiz result.');
        }
      }

      // Focus header when drawer opens
      setTimeout(() => {
        headerRef.current?.focus();
      }, 100);
    }
  }, [open, promo.code]);

  const handleBillingToggle = (newBilling) => {
    setBilling(newBilling);
    BillingURL.set(newBilling);
    trackEvent('plan_compare_toggle_billing', { billing: newBilling });
  };

  const handleTryFeature = (featureKey, targetPlan) => {
    trackEvent('plan_compare_try_feature', { featureKey, targetPlan });
    
    if (requirePlan(targetPlan, featureKey)) {
      // User has access, navigate to feature
      const routes = {
        role_tailor: createPageUrl('Onboarding?step=tailor'),
        interview_sim: createPageUrl('InterviewCoach?mode=panel'),
        industry_templates: createPageUrl('Templates?filter=industry'),
        portfolio_builder: createPageUrl('Portfolio/new')
      };
      
      if (routes[featureKey]) {
        navigate(routes[featureKey]);
        onClose();
      }
    }
    // If user doesn't have access, paywall modal opens automatically
  };

  const handleCheckout = (plan) => {
    const base = createPageUrl(`Checkout?plan=${plan}`);
    const withBilling = BillingURL.applyToUrl(base);
    const href = PromoURL.applyToUrl(withBilling);
    
    trackEvent('plan_compare_cta', { 
      plan, 
      billing: BillingURL.get() || 'annual', 
      promo: promo.code || null 
    });
    
    navigate(href);
    onClose();
  };

  const handleClose = () => {
    trackEvent('plan_compare_close');
    onClose();
  };

  const handleQuizComplete = (result) => {
    setQuizResult(result);
    setQuizExpanded(false); // Updated to quizExpanded
  };

  const handleQuizClose = () => { // Used for QuizCard onClose prop
    setQuizExpanded(false);
  };

  const comparison = [
    {
      feature: "Active resumes",
      starter: "1",
      pro: "Unlimited", 
      elite: "Unlimited"
    },
    {
      feature: "Role-tailored rewrites",
      starter: "Single-role only",
      pro: "Unlimited",
      elite: "Unlimited + Executive narrative",
      tryable: true,
      featureKey: "role_tailor",
      minPlan: "pro"
    },
    {
      feature: "Cover letters & outreach",
      starter: "—",
      pro: "Included",
      elite: "Included"
    },
    {
      feature: "Interview drills",
      starter: "10 Q&A/day",
      pro: "Full drills + feedback",
      elite: "Panel simulator + expert modes",
      tryable: true,
      featureKey: "interview_sim", 
      minPlan: "pro"
    },
    {
      feature: "Templates",
      starter: "ATS basic",
      pro: "Full catalog",
      elite: "Industry: Legal • Finance • Tech",
      tryable: true,
      featureKey: "industry_templates",
      minPlan: "elite"
    },
    {
      feature: "LinkedIn optimizer",
      starter: "—",
      pro: "Included",
      elite: "Included"
    },
    {
      feature: "Portfolio / case-study builder",
      starter: "—",
      pro: "—",
      elite: "Included",
      tryable: true,
      featureKey: "portfolio_builder",
      minPlan: "elite"
    },
    {
      feature: "Metrics & progress tracking",
      starter: "Basic",
      pro: "Advanced",
      elite: "Advanced"
    },
    {
      feature: "Support",
      starter: "Community",
      pro: "Priority",
      elite: "White-glove"
    },
    {
      feature: "Billing & terms",
      starter: "Free • Cancel anytime",
      pro: "Monthly or annual",
      elite: "Monthly or annual"
    }
  ];

  const pvPro = priceView({ plan: "pro", billing, promo: promo.valid ? promo : null });
  const pvElite = priceView({ plan: "elite", billing, promo: promo.valid ? promo : null });

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent 
        side="right" 
        className="sm:max-w-3xl w-full p-0 bg-[var(--bg)] text-[var(--text-100)] overflow-y-auto" // Updated width, removed border, added text color and overflow
      >
        <SheetHeader 
          ref={headerRef}
          tabIndex={-1}
          className="p-6 sticky top-0 bg-[var(--bg)]/80 backdrop-blur z-10 border-b border-[var(--bd-weak)]" // Made header sticky with blur
        >
          <div className="flex justify-between items-start"> {/* Adjusted alignment for header content */}
            <div>
              <SheetTitle 
                className="text-2xl font-bold text-[var(--text-100)]" // Removed focus outline
              >
                Compare plans
              </SheetTitle>
              <p className="text-sm text-[var(--text-70)] mt-1">Pick the plan that fits how you work. Cancel anytime.</p> {/* Updated text size and margin */}
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="text-[var(--text-60)] hover:text-[var(--text-100)]"> {/* Changed to Button component */}
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4"> {/* Added new div for billing and hurry chip */}
            <div className="badge p-1">
              <button
                onClick={() => handleBillingToggle('monthly')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${ // Updated py
                  billing === 'monthly' ? 'bg-white text-[var(--bg)]' : 'text-[var(--text-70)] hover:text-[var(--text-100)]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => handleBillingToggle('annual')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${ // Updated py
                  billing === 'annual' ? 'bg-white text-[var(--bg)]' : 'text-[var(--text-70)] hover:text-[var(--text-100)]'
                }`}
              >
                Annual
                <span className="ml-2 badge-new text-xs">Save 37%</span> {/* Moved span outside button as per outline */}
              </button>
            </div>
            <HurryChip location="drawer" quizPlan={quizResult?.plan} /> {/* Added HurryChip component */}
          </div>
        </SheetHeader>

        <div className="p-6"> {/* Simplified this div's class name */}
          {/* Quiz Toggle */}
          <button
            onClick={() => setQuizExpanded(!quizExpanded)} // Updated to quizExpanded
            className="flex items-center gap-2 text-sm text-[var(--text-70)] hover:text-[var(--text-100)] mb-4" // Added mb-4 for spacing
          >
            {quizExpanded ? ( // Updated to quizExpanded
              <>
                <ChevronUp className="w-4 h-4" />
                Close quiz
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Not sure? Take a 30-second quiz
              </>
            )}
          </button>
          
          {/* Quiz Card */}
          {quizExpanded && ( // Updated to quizExpanded
            <QuizCard 
              onComplete={handleQuizComplete}
              onClose={handleQuizClose}
              billing={billing}
              promo={promo}
              priceView={priceView}
            />
          )}
          
          {/* Quiz Result Display */}
          {quizResult && !quizExpanded && ( // Updated to quizExpanded
            <div className="card-quiet p-4 border-[var(--bd-weak)] rounded-[var(--r-lg)] mb-6 bg-[var(--surf-1)]">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-[var(--text-80)]">
                    Quiz recommendation: <strong className="text-[var(--text-100)]">{quizResult.plan.charAt(0).toUpperCase() + quizResult.plan.slice(1)}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setQuizExpanded(true)} // Updated to quizExpanded
                  className="text-xs text-[var(--text-60)] hover:text-[var(--text-100)] underline"
                >
                  Retake
                </button>
              </div>
            </div>
          )}

          {/* Comparison Table */}
          {!quizExpanded && ( // Updated to quizExpanded
            <div role="table" aria-label="Feature comparison by plan" className="w-full">
              <table className="w-full border-collapse">
                <caption className="sr-only">Feature comparison by plan</caption>
                <thead role="rowgroup">
                  <tr role="row" className="border-b border-gray-200">
                    <th role="columnheader" className="text-left py-4 pr-4 font-medium text-gray-900 sticky left-0 bg-white">
                      Features
                    </th>
                    <th role="columnheader" className="text-center py-4 px-4 font-medium text-gray-900">
                      <div className="card-quiet p-3 rounded-lg">
                        <div className="font-semibold">Starter</div>
                        <div className="text-sm text-gray-600">Free</div>
                      </div>
                    </th>
                    <th role="columnheader" className="text-center py-4 px-4 font-medium text-gray-900">
                      <div className="card p-3 rounded-lg relative" style={{
                        borderTop: '2px solid transparent',
                        borderImage: 'linear-gradient(90deg, var(--acc-a), var(--acc-b), var(--acc-c)) 1',
                        background: 'var(--surf-2)'
                      }}>
                        <div className="font-semibold flex items-center gap-2">
                          Pro 
                          <Badge className="bg-blue-100 text-blue-800 text-xs">Popular</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {pvPro.discounted ? (
                            <div>
                              <span className="line-through text-gray-400">{pvPro.original}</span>
                              <span className="ml-1 font-semibold text-green-600">{pvPro.discounted}</span>
                            </div>
                          ) : (
                            pvPro.original
                          )}
                        </div>
                      </div>
                    </th>
                    <th role="columnheader" className="text-center py-4 px-4 font-medium text-gray-900">
                      <div className="card-quiet p-3 rounded-lg">
                        <div className="font-semibold">Elite</div>
                        <div className="text-sm text-gray-600">
                          {pvElite.discounted ? (
                            <div>
                              <span className="line-through text-gray-400">{pvElite.original}</span>
                              <span className="ml-1 font-semibold text-green-600">{pvElite.discounted}</span>
                            </div>
                          ) : (
                            pvElite.original
                          )}
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody role="rowgroup">
                  {comparison.map((row, index) => (
                    <tr key={index} role="row" className="border-b border-gray-100">
                      <td role="cell" className="py-4 pr-4 font-medium text-gray-800 sticky left-0 bg-white">
                        {row.feature}
                      </td>
                      <td role="cell" className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {row.starter === "—" ? (
                            <span className="text-gray-400">—</span>
                          ) : row.starter.includes("Included") ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <Check className="w-4 h-4" />
                              <span className="text-sm">Included</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-700">{row.starter}</span>
                          )}
                        </div>
                      </td>
                      <td role="cell" className="py-4 px-4 text-center bg-blue-50/30">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {row.pro === "—" ? (
                            <span className="text-gray-400">—</span>
                          ) : row.pro.includes("Included") ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <Check className="w-4 h-4" />
                              <span className="text-sm">Included</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-700">{row.pro}</span>
                          )}
                          {row.tryable && row.minPlan === 'pro' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="badge text-xs py-1 px-2 hover:bg-blue-100"
                              onClick={() => handleTryFeature(row.featureKey, row.minPlan)}
                              aria-label={`Try ${row.feature} on Pro`}
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Try
                            </Button>
                          )}
                        </div>
                      </td>
                      <td role="cell" className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {row.elite === "—" ? (
                            <span className="text-gray-400">—</span>
                          ) : row.elite.includes("Included") ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <Check className="w-4 h-4" />
                              <span className="text-sm">Included</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-700">{row.elite}</span>
                          )}
                          {row.tryable && row.minPlan === 'elite' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="badge text-xs py-1 px-2 hover:bg-purple-100"
                              onClick={() => handleTryFeature(row.featureKey, row.minPlan)}
                              aria-label={`Try ${row.feature} on Elite`}
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Try
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* CTA Footer */}
        <div className="sticky bottom-0 p-6 bg-gradient-to-t from-[var(--bg)] to-transparent border-t border-[var(--bd-weak)]"> {/* Made footer sticky with gradient and border */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="text-center">
              <Button 
                onClick={() => handleCheckout('pro')}
                className="w-full btn btn-primary mb-2"
                aria-describedby="pro-footnote"
              >
                {pvPro.ctaLabel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {pvPro.footnote && (
                <p id="pro-footnote" className="text-xs text-green-600">
                  {pvPro.footnote}
                </p>
              )}
            </div>
            <div className="text-center">
              <Button 
                onClick={() => handleCheckout('elite')}
                className="w-full btn btn-outline mb-2"
                aria-describedby="elite-footnote"
              >
                {pvElite.ctaLabel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {pvElite.footnote && (
                <p id="elite-footnote" className="text-xs text-green-600">
                  {pvElite.footnote}
                </p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PlanCompareDrawer;
