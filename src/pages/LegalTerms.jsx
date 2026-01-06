import React from 'react';
// PRODUCTION FIX: Removed react-markdown dependency
// Using simple pre-formatted text instead
import { Card, CardContent } from "@/components/ui/card";
import { Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const termsContent = `
# Terms of Service
Last updated: September 3, 2025

Rezemai provides tools to help you create resumes, cover letters, and interview practice content. By using Rezemai, you agree to these terms.

**Accounts.** You are responsible for safeguarding your account and for all activity under it.

**Subscriptions.** Paid plans renew automatically until canceled. You can manage or cancel anytime from **Account → Manage Billing**. Unless required by law or stated otherwise, fees are non-refundable once a billing period begins.

**Acceptable Use.** Do not use Rezemai to submit unlawful content or to violate the rights of others.

**No Professional Advice.** Rezemai provides educational and drafting assistance only. We do not provide legal, financial, medical, or professional advice.

**Intellectual Property.** The platform and its components are owned by Rezemai. You own your uploaded content and outputs, subject to these terms.

**Availability.** We strive for high availability but do not guarantee uninterrupted service. See our **Status** page for incidents and maintenance.

**Limitation of Liability.** Rezemai is provided “as is.” To the maximum extent permitted by law, we are not liable for indirect or consequential damages.

**Changes.** If we materially change these terms, we’ll update the “Last updated” date and, when appropriate, notify you.

**Contact.** support@rezemai.com
`;

export default function LegalTermsPage() {
  return (
    <div className="min-h-screen bg-warm-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Scale className="w-8 h-8 text-navy" />
          <h1 className="text-3xl font-bold text-navy">Terms of Service</h1>
        </div>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 sm:p-8">
            {/* PRODUCTION FIX: Simple pre-formatted text instead of ReactMarkdown */}
            <div className="prose prose-slate max-w-none whitespace-pre-wrap font-sans">
              {termsContent}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}