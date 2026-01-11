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
            <h2 className="text-xl font-semibold mb-3">Which social media platforms does SoshOps support?</h2>
            <p className="text-zinc-400">SoshOps currently supports LinkedIn, Twitter (X), and Facebook. We're actively working on adding Instagram, TikTok, and YouTube. Pro and Business plan users get early access to new platform integrations.</p>
          </div>

          <div className="border-b border-zinc-800 pb-6">
            <h2 className="text-xl font-semibold mb-3">Can I schedule posts across multiple platforms at once?</h2>
            <p className="text-zinc-400">Yes! When creating a post, select all target platforms and SoshOps will publish to all of them simultaneously at your scheduled time. Each platform gets optimized formatting while maintaining your core message.</p>
          </div>

          <div className="border-b border-zinc-800 pb-6">
            <h2 className="text-xl font-semibold mb-3">Who is SoshOps built for?</h2>
            <p className="text-zinc-400">Professionals and businesses who want to maintain a consistent social media presence without the overhead. From solo creators to agencies managing multiple clients, SoshOps streamlines scheduling, publishing, and analytics.</p>
          </div>

          <div className="border-b border-zinc-800 pb-6">
            <h2 className="text-xl font-semibold mb-3">How does the analytics dashboard work?</h2>
            <p className="text-zinc-400">The analytics dashboard shows engagement metrics (likes, comments, shares, reach) across all connected accounts. Filter by platform, date range, or campaign to identify what content performs best and optimize your strategy.</p>
          </div>

          <div className="border-b border-zinc-800 pb-6">
            <h2 className="text-xl font-semibold mb-3">What's included in the free plan?</h2>
            <p className="text-zinc-400">The free plan includes 1 connected account, up to 5 scheduled posts per month, basic analytics, and access to LinkedIn and Twitter. Upgrade to Pro for unlimited accounts, posts, and advanced features.</p>
          </div>

          <div className="border-b border-zinc-800 pb-6">
            <h2 className="text-xl font-semibold mb-3">Can I cancel my subscription anytime?</h2>
            <p className="text-zinc-400">Yes. You can cancel from your account settings at any time. Your access continues until the end of your billing period, and all your scheduled posts will still publish.</p>
          </div>

          <div className="border-b border-zinc-800 pb-6">
            <h2 className="text-xl font-semibold mb-3">Is my data private and secure?</h2>
            <p className="text-zinc-400">Yes. We use OAuth 2.0 for social platform authentication, and all data is encrypted in transit and at rest. Your credentials and content are private to your account. See our <a href={createPageUrl("LegalPrivacy")} className="text-indigo-400 hover:text-indigo-300 underline">Privacy Policy</a> for details.</p>
          </div>

          <div className="pb-6">
            <h2 className="text-xl font-semibold mb-3">How do I get support?</h2>
            <p className="text-zinc-400">Free users get community access and documentation. Pro and Business plans include priority email support. Visit <a href={createPageUrl("Support")} className="text-indigo-400 hover:text-indigo-300 underline">Support</a> to submit a ticket.</p>
          </div>
        </div>
      </section>
      <FooterSitemapV2 />
    </main>
  );
}
