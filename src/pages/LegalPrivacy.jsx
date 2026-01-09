import React from 'react';
// PRODUCTION FIX: Removed react-markdown dependency
// Using simple pre-formatted text instead
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from 'lucide-react';

const privacyContent = `
# Privacy Policy
Last updated: September 3, 2025

We collect information you provide (like email, resume text) and technical data (like device and usage). We use this to operate and improve the service, personalize features, and communicate with you.

**Payments.** We use Stripe to process payments. SoshlOps does not store full card numbers. See Stripe's privacy policy for details.

**Cookies.** We use cookies and similar technologies for authentication and analytics. You can control cookies in your browser.

**Data Sharing.** We share data with service providers who help us run the product (e.g., hosting, payments, analytics). We do not sell your personal information.

**Retention.** We keep data as long as your account is active or as needed to provide the service.

**Your Rights.** You may access, update, or delete your information. Contact support@soshlops.com.

**Security.** We take reasonable measures to protect your data, but no method is 100% secure.

**Children.** SoshlOps is not intended for children under 16.

**Contact.** support@soshlops.com
`;

export default function LegalPrivacyPage() {
  return (
    <div className="min-h-screen bg-warm-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-navy" />
          <h1 className="text-3xl font-bold text-navy">Privacy Policy</h1>
        </div>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 sm:p-8">
            {/* PRODUCTION FIX: Simple pre-formatted text instead of ReactMarkdown */}
            <div className="prose prose-slate max-w-none whitespace-pre-wrap font-sans">
              {privacyContent}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}