import React from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BrandHeaderV2 } from "../components/landing/BrandHeader";
import { FooterSitemapV2 } from "../components/landing/FooterSitemap";

export default function FaqPage() {
  const navigate = useNavigate();
  
  return (
    <main className="min-h-screen bg-[#0B0D15] text-zinc-100">
      <BrandHeaderV2 onCta={() => navigate(createPageUrl("Signin"))} />
      <section className="mx-auto max-w-3xl px-6 md:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Frequently Asked Questions</h1>

        <div className="space-y-8">
          <div className="border-b border-zinc-800 pb-6">
            <h2 className="text-xl font-semibold mb-3">Is Rezemai ATS-friendly?</h2>
            <p className="text-zinc-400">Yes. All our templates use clean formatting that applicant tracking systems can parse correctly. No complex tables, graphics, or unusual fonts that might cause parsing errors.</p>
          </div>

          <div className="border-b border-zinc-800 pb-6">
            <h2 className="text-xl font-semibold mb-3">Can I import my existing resume?</h2>
            <p className="text-zinc-400">Yes. You can paste your resume content directly or upload a document to get started quickly. Rezemai will help you reorganize and optimize the content for your target role.</p>
          </div>

          <div className="border-b border-zinc-800 pb-6">
            <h2 className="text-xl font-semibold mb-3">Who is Rezemai built for?</h2>
            <p className="text-zinc-400">Professionals seeking their next role—from individual contributors to executives. Whether you're changing industries, advancing your career, or exploring new opportunities, Rezemai helps you present your experience effectively.</p>
          </div>

          <div className="border-b border-zinc-800 pb-6">
            <h2 className="text-xl font-semibold mb-3">How does the interview practice work?</h2>
            <p className="text-zinc-400">You can run mock interview sessions with common questions for your role. Get real-time feedback on your answers, including structure, clarity, and impact. Practice behavioral questions with the STAR framework built in.</p>
          </div>

          <div className="border-b border-zinc-800 pb-6">
            <h2 className="text-xl font-semibold mb-3">What's included in the free plan?</h2>
            <p className="text-zinc-400">The Starter plan includes one active resume, ATS-ready formatting, PDF export, and 10 interview Q&A per day. Upgrade to Pro for unlimited resumes, cover letters, and advanced features.</p>
          </div>

          <div className="border-b border-zinc-800 pb-6">
            <h2 className="text-xl font-semibold mb-3">Can I cancel my subscription anytime?</h2>
            <p className="text-zinc-400">Yes. You can cancel from your account settings at any time. Your access continues until the end of your billing period.</p>
          </div>

          <div className="border-b border-zinc-800 pb-6">
            <h2 className="text-xl font-semibold mb-3">Is my data private and secure?</h2>
            <p className="text-zinc-400">Yes. We use Google OAuth for authentication (no passwords stored), and all data is encrypted. Your resumes and interview practice are private to your account. See our <a href={createPageUrl("LegalPrivacy")} className="text-indigo-400 hover:text-indigo-300 underline">Privacy Policy</a> for details.</p>
          </div>

          <div className="pb-6">
            <h2 className="text-xl font-semibold mb-3">How do I get support?</h2>
            <p className="text-zinc-400">Free users get community access and documentation. Pro and Elite plans include priority email support. Visit <a href={createPageUrl("Support")} className="text-indigo-400 hover:text-indigo-300 underline">Support</a> to submit a ticket.</p>
          </div>
        </div>
      </section>
      <FooterSitemapV2 />
    </main>
  );
}