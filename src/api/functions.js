/**
 * Function Stubs - Awaiting Supabase Migration
 *
 * These are placeholder stubs to prevent build errors.
 * Backend functions need to be migrated to Supabase Edge Functions.
 */

const createMockFunction = (name) => async (...args) => {
  console.warn(`${name}() - Backend not implemented. Migrate to Supabase Edge Functions.`);
  throw new Error(`Backend function not available. Migrate ${name}() to Supabase.`);
};

// Export function stubs
export const createCheckoutSession = createMockFunction('createCheckoutSession');
export const createPortalSession = createMockFunction('createPortalSession');
export const stripeWebhook = createMockFunction('stripeWebhook');
export const generateResumePdf = createMockFunction('generateResumePdf');
export const sendCampaignEmail = createMockFunction('sendCampaignEmail');
export const optimizeResume = createMockFunction('optimizeResume');
export const sendWelcomeEmail = createMockFunction('sendWelcomeEmail');
export const createInterviewSession = createMockFunction('createInterviewSession');
export const evaluateInterviewResponse = createMockFunction('evaluateInterviewResponse');
export const createSupportTicket = createMockFunction('createSupportTicket');
export const trackUsage = createMockFunction('trackUsage');
export const webhookTestTools = createMockFunction('webhookTestTools');
export const activationOrchestrator = createMockFunction('activationOrchestrator');
export const emailSender = createMockFunction('emailSender');
export const createStripePromo = createMockFunction('createStripePromo');
export const validatePromo = createMockFunction('validatePromo');
export const referralHandler = createMockFunction('referralHandler');
export const grantReferralReward = createMockFunction('grantReferralReward');
export const campaignRedirect = createMockFunction('campaignRedirect');
export const qaReporter = createMockFunction('qaReporter');
export const runQATests = createMockFunction('runQATests');
export const lintATS = createMockFunction('lintATS');
export const triageTicket = createMockFunction('triageTicket');
