/**
 * Integration Stubs - Awaiting Supabase Migration
 *
 * These are placeholder stubs to prevent build errors.
 * Integrations need to be migrated to Supabase Edge Functions.
 *
 * NOTE (Email Campaigns module): email + AI for the campaigns product no longer
 * use these stubs — they call dedicated Edge Functions via src/api/email/
 * (email-send, email-test, email-domain, and the Phase-2 ai-generate). The
 * InvokeLLM / SendEmail stubs below remain only for legacy callers not yet
 * migrated (e.g. ReferralSystem, the deprecated EmailService, TestingDashboard);
 * remove them once those are ported. Do not use them in new code.
 */

const createMockIntegration = (name) => async (...args) => {
  console.warn(`${name}() - Integration not implemented. Migrate to Supabase.`);
  throw new Error(`Integration not available. Migrate ${name}() to Supabase.`);
};

// Export integration stubs
export const Core = {
  InvokeLLM: createMockIntegration('InvokeLLM'),
  SendEmail: createMockIntegration('SendEmail'),
  UploadFile: createMockIntegration('UploadFile'),
  GenerateImage: createMockIntegration('GenerateImage'),
  ExtractDataFromUploadedFile: createMockIntegration('ExtractDataFromUploadedFile'),
  CreateFileSignedUrl: createMockIntegration('CreateFileSignedUrl'),
  UploadPrivateFile: createMockIntegration('UploadPrivateFile'),
};

export const InvokeLLM = Core.InvokeLLM;
export const SendEmail = Core.SendEmail;
export const UploadFile = Core.UploadFile;
export const GenerateImage = Core.GenerateImage;
export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile;
export const CreateFileSignedUrl = Core.CreateFileSignedUrl;
export const UploadPrivateFile = Core.UploadPrivateFile;
