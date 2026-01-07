/**
 * Base44 Client Stub
 *
 * This is a temporary stub to maintain build compatibility.
 * Base44 SDK has been removed - entities will not function until
 * a new backend (Supabase, Firebase, etc.) is implemented.
 *
 * For now, this allows the landing page to build successfully.
 */

// Create mock entity factory
const createMockEntity = (name) => ({
  list: async () => {
    console.warn(`${name}.list() called but Base44 has been removed. Implement new backend.`);
    return [];
  },
  get: async (id) => {
    console.warn(`${name}.get() called but Base44 has been removed. Implement new backend.`);
    return null;
  },
  create: async (data) => {
    console.warn(`${name}.create() called but Base44 has been removed. Implement new backend.`);
    throw new Error('Backend not configured. Base44 has been removed.');
  },
  update: async (id, data) => {
    console.warn(`${name}.update() called but Base44 has been removed. Implement new backend.`);
    throw new Error('Backend not configured. Base44 has been removed.');
  },
  delete: async (id) => {
    console.warn(`${name}.delete() called but Base44 has been removed. Implement new backend.`);
    throw new Error('Backend not configured. Base44 has been removed.');
  },
  filter: async (query) => {
    console.warn(`${name}.filter() called but Base44 has been removed. Implement new backend.`);
    return [];
  },
});

// Create mock function
const createMockFunction = (name) => async (...args) => {
  console.warn(`${name}() called but Base44 has been removed. Implement new backend.`);
  throw new Error(`Backend function not available. Base44 has been removed. Cannot call ${name}().`);
};

// Create mock integration function
const createMockIntegration = (name) => async (...args) => {
  console.warn(`${name}() integration called but Base44 has been removed. Implement new backend.`);
  throw new Error(`Integration not available. Base44 has been removed. Cannot call ${name}().`);
};

// Mock Base44 client
export const base44 = {
  entities: {
    Resume: createMockEntity('Resume'),
    InterviewSession: createMockEntity('InterviewSession'),
    Subscription: createMockEntity('Subscription'),
    Usage: createMockEntity('Usage'),
    SupportTicket: createMockEntity('SupportTicket'),
    Referral: createMockEntity('Referral'),
    PerformanceLog: createMockEntity('PerformanceLog'),
    EmailCampaign: createMockEntity('EmailCampaign'),
    AuditEvent: createMockEntity('AuditEvent'),
    ProcessedEvent: createMockEntity('ProcessedEvent'),
    WebhookLog: createMockEntity('WebhookLog'),
    StatusComponent: createMockEntity('StatusComponent'),
    Incident: createMockEntity('Incident'),
    Maintenance: createMockEntity('Maintenance'),
    ChangelogEntry: createMockEntity('ChangelogEntry'),
    DraftResume: createMockEntity('DraftResume'),
    EmailTemplate: createMockEntity('EmailTemplate'),
    ScheduledEmail: createMockEntity('ScheduledEmail'),
    Promo: createMockEntity('Promo'),
    PromoRedemption: createMockEntity('PromoRedemption'),
    ReferralCode: createMockEntity('ReferralCode'),
    ReferralAttribution: createMockEntity('ReferralAttribution'),
    PromoBanner: createMockEntity('PromoBanner'),
    CampaignLink: createMockEntity('CampaignLink'),
    FeatureFlag: createMockEntity('FeatureFlag'),
    Team: createMockEntity('Team'),
    TeamMember: createMockEntity('TeamMember'),
  },

  // Mock functions (cloud functions)
  functions: {
    createCheckoutSession: createMockFunction('createCheckoutSession'),
    createPortalSession: createMockFunction('createPortalSession'),
    stripeWebhook: createMockFunction('stripeWebhook'),
    generateResumePdf: createMockFunction('generateResumePdf'),
    sendCampaignEmail: createMockFunction('sendCampaignEmail'),
    optimizeResume: createMockFunction('optimizeResume'),
    sendWelcomeEmail: createMockFunction('sendWelcomeEmail'),
    createInterviewSession: createMockFunction('createInterviewSession'),
    evaluateInterviewResponse: createMockFunction('evaluateInterviewResponse'),
    createSupportTicket: createMockFunction('createSupportTicket'),
    trackUsage: createMockFunction('trackUsage'),
    webhookTestTools: createMockFunction('webhookTestTools'),
    activationOrchestrator: createMockFunction('activationOrchestrator'),
    emailSender: createMockFunction('emailSender'),
    createStripePromo: createMockFunction('createStripePromo'),
    validatePromo: createMockFunction('validatePromo'),
    referralHandler: createMockFunction('referralHandler'),
    grantReferralReward: createMockFunction('grantReferralReward'),
    campaignRedirect: createMockFunction('campaignRedirect'),
    qaReporter: createMockFunction('qaReporter'),
    runQATests: createMockFunction('runQATests'),
    lintATS: createMockFunction('lintATS'),
    triageTicket: createMockFunction('triageTicket'),
  },

  // Mock integrations
  integrations: {
    Core: {
      InvokeLLM: createMockIntegration('InvokeLLM'),
      SendEmail: createMockIntegration('SendEmail'),
      UploadFile: createMockIntegration('UploadFile'),
      GenerateImage: createMockIntegration('GenerateImage'),
      ExtractDataFromUploadedFile: createMockIntegration('ExtractDataFromUploadedFile'),
      CreateFileSignedUrl: createMockIntegration('CreateFileSignedUrl'),
      UploadPrivateFile: createMockIntegration('UploadPrivateFile'),
    }
  },

  // Mock auth (Clerk is now handling auth via clerkClient.js)
  auth: {
    me: async () => {
      console.warn('base44.auth.me() called but Base44 has been removed. Use useClerkAuth() instead.');
      return null;
    },
    login: () => {
      console.warn('base44.auth.login() called but Base44 has been removed. Use Clerk sign-in instead.');
    },
    logout: () => {
      console.warn('base44.auth.logout() called but Base44 has been removed. Use Clerk sign-out instead.');
    },
    loginWithRedirect: () => {
      console.warn('base44.auth.loginWithRedirect() called but Base44 has been removed. Use Clerk instead.');
    },
  }
};
