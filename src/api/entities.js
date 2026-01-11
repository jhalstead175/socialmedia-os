/**
 * Entity Stubs - Awaiting Supabase Migration
 *
 * These are placeholder stubs to prevent build errors.
 * Backend features need to be migrated to Supabase.
 */

const createMockEntity = (name) => ({
  list: async () => {
    console.warn(`${name}.list() - Backend not implemented. Migrate to Supabase.`);
    return [];
  },
  get: async (id) => {
    console.warn(`${name}.get() - Backend not implemented. Migrate to Supabase.`);
    return null;
  },
  create: async (data) => {
    console.warn(`${name}.create() - Backend not implemented. Migrate to Supabase.`);
    throw new Error('Backend not implemented. Migrate to Supabase.');
  },
  update: async (id, data) => {
    console.warn(`${name}.update() - Backend not implemented. Migrate to Supabase.`);
    throw new Error('Backend not implemented. Migrate to Supabase.');
  },
  delete: async (id) => {
    console.warn(`${name}.delete() - Backend not implemented. Migrate to Supabase.`);
    throw new Error('Backend not implemented. Migrate to Supabase.');
  },
  filter: async (query) => {
    console.warn(`${name}.filter() - Backend not implemented. Migrate to Supabase.`);
    return [];
  },
});

// Export entity stubs
export const Resume = createMockEntity('Resume');
export const InterviewSession = createMockEntity('InterviewSession');
export const Subscription = createMockEntity('Subscription');
export const Usage = createMockEntity('Usage');
export const SupportTicket = createMockEntity('SupportTicket');
export const Referral = createMockEntity('Referral');
export const PerformanceLog = createMockEntity('PerformanceLog');
export const EmailCampaign = createMockEntity('EmailCampaign');
export const AuditEvent = createMockEntity('AuditEvent');
export const ProcessedEvent = createMockEntity('ProcessedEvent');
export const WebhookLog = createMockEntity('WebhookLog');
export const StatusComponent = createMockEntity('StatusComponent');
export const Incident = createMockEntity('Incident');
export const Maintenance = createMockEntity('Maintenance');
export const ChangelogEntry = createMockEntity('ChangelogEntry');
export const DraftResume = createMockEntity('DraftResume');
export const EmailTemplate = createMockEntity('EmailTemplate');
export const ScheduledEmail = createMockEntity('ScheduledEmail');
export const Promo = createMockEntity('Promo');
export const PromoRedemption = createMockEntity('PromoRedemption');
export const ReferralCode = createMockEntity('ReferralCode');
export const ReferralAttribution = createMockEntity('ReferralAttribution');
export const PromoBanner = createMockEntity('PromoBanner');
export const CampaignLink = createMockEntity('CampaignLink');
export const FeatureFlag = createMockEntity('FeatureFlag');
export const Team = createMockEntity('Team');
export const TeamMember = createMockEntity('TeamMember');

// Auth - redirect to Clerk
export const User = {
  me: async () => {
    console.warn('User.me() - Use useClerkAuth() hook instead');
    throw new Error('Use useClerkAuth() hook in React components');
  },
  loginWithRedirect: async () => {
    console.warn('User.loginWithRedirect() - Use useClerkAuth() hook instead');
    throw new Error('Use useClerkAuth() hook in React components');
  },
  logout: async () => {
    console.warn('User.logout() - Use useClerkAuth() hook instead');
    throw new Error('Use useClerkAuth() hook in React components');
  },
};
