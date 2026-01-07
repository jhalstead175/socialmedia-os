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
