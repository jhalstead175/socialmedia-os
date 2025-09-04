import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { RezemaiLogo } from '../Logo';

export function FooterSitemapV2({
  description = "AI-powered resume & interview coaching to land offers faster.",
  year = new Date().getFullYear(),
}) {
  const cols = [
    { 
      title: "Product", 
      links: [ 
        { label: "Features", href: createPageUrl("Landing") + "#features" }, 
        { label: "Templates", href: createPageUrl("Templates") }, 
        { label: "Pricing", href: createPageUrl("Landing") + "#pricing" }, 
        { label: "Changelog", href: createPageUrl("Changelog") } 
      ] 
    },
    { 
      title: "Company", 
      links: [ 
        { label: "About", href: createPageUrl("Landing") }, 
        { label: "Support", href: createPageUrl("Support") }, 
        { label: "Status", href: createPageUrl("Status") }, 
        { label: "Contact", href: createPageUrl("Contact") } 
      ] 
    },
    { 
      title: "Resources", 
      links: [ 
        { label: "FAQ", href: createPageUrl("FAQ") }, 
        { label: "Help Center", href: createPageUrl("Help") }, 
        { label: "Support SLA", href: createPageUrl("SupportSLA") }, 
        { label: "Referrals", href: createPageUrl("Referrals") } 
      ] 
    },
    { 
      title: "Legal", 
      links: [ 
        { label: "Terms", href: createPageUrl("LegalTerms") }, 
        { label: "Privacy", href: createPageUrl("LegalPrivacy") } 
      ] 
    },
  ];
  
  return (
    <footer className="mt-14 border-t border-zinc-800/70 bg-zinc-950/40">
      <div className="mx-auto max-w-7xl px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <RezemaiLogo size={28} showWordmark={false} />
              <span className="text-xl font-extrabold tracking-widest text-zinc-100">REZEMAI</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-zinc-400">{description}</p>
            <div className="mt-4 flex items-center gap-3 text-zinc-400">
              <a href="https://x.com/rezemai" className="hover:text-zinc-200">X</a>
              <span aria-hidden>•</span>
              <a href="https://linkedin.com/company/rezemai" className="hover:text-zinc-200">LinkedIn</a>
              <span aria-hidden>•</span>
              <a href="mailto:support@rezemai.com" className="hover:text-zinc-200">Email</a>
            </div>
          </div>
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {cols.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h4 className="text-sm font-semibold text-zinc-300">{col.title}</h4>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      {l.href.startsWith('http') ? (
                        <a href={l.href} className="text-sm text-zinc-400 hover:text-zinc-200">{l.label}</a>
                      ) : (
                        <Link to={l.href} className="text-sm text-zinc-400 hover:text-zinc-200">{l.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/70 pt-6 text-xs text-zinc-500">
          <div>© {year} REZEMAI. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Status")} className="hover:text-zinc-300">System Status</Link>
            <Link to={createPageUrl("Changelog")} className="hover:text-zinc-300">Full Changelog</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterSitemapV2;