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

// Social Media Operations (SoshOps-specific entities)
export const SocialPost = createMockEntity('SocialPost');
export const ScheduledContent = createMockEntity('ScheduledContent');
export const SocialAccount = createMockEntity('SocialAccount');
export const Campaign = createMockEntity('Campaign');
export const PostAnalytics = createMockEntity('PostAnalytics');

// Subscription & Usage
export const Subscription = createMockEntity('Subscription');
export const Usage = createMockEntity('Usage');

// Support & Feedback
export const SupportTicket = createMockEntity('SupportTicket');

// Marketing & Referrals
export const Referral = createMockEntity('Referral');
export const ReferralCode = createMockEntity('ReferralCode');
export const ReferralAttribution = createMockEntity('ReferralAttribution');
export const Promo = createMockEntity('Promo');
export const PromoRedemption = createMockEntity('PromoRedemption');
export const PromoBanner = createMockEntity('PromoBanner');
export const CampaignLink = createMockEntity('CampaignLink');

// Email & Communication
// NOTE: the former EmailCampaign / EmailTemplate / ScheduledEmail mock stubs were
// removed during the Email Campaigns module build. Real, RLS-backed data access
// lives in src/api/email/ (db.js + functions.js); see docs/email-campaigns/.

// System & Monitoring
export const PerformanceLog = createMockEntity('PerformanceLog');
export const AuditEvent = createMockEntity('AuditEvent');
export const ProcessedEvent = createMockEntity('ProcessedEvent');
export const WebhookLog = createMockEntity('WebhookLog');
export const StatusComponent = createMockEntity('StatusComponent');
export const Incident = createMockEntity('Incident');
export const Maintenance = createMockEntity('Maintenance');
export const ChangelogEntry = createMockEntity('ChangelogEntry');

// Features & Configuration
export const FeatureFlag = createMockEntity('FeatureFlag');

// Team Management
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
