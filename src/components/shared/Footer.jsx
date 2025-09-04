
import React from 'react';
import { Link } from 'react-router-dom';
import RezemaiLogo from '../Logo';
import { createPageUrl } from '@/utils';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Only social links array is needed as other link sections are hardcoded in JSX
  const socialLinks = [
    { name: 'LinkedIn', url: 'https://linkedin.com' },
    { name: 'Twitter', url: 'https://twitter.com' },
  ];

  return (
    <footer className="non-printable bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        {/* Logo and social links section */}
        <div className="mb-10">
          <RezemaiLogo />
          <p className="mt-4 text-sm text-slate-400">
            AI-powered career platform for executives.
          </p>
          <div className="mt-4 flex space-x-4">
            {socialLinks.map((item) => (
              <a 
                key={item.name} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-400 hover:text-gold transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>

        {/* Links grid section */}
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="hover:text-gold transition-colors">About Us</Link></li>
              <li><Link to={createPageUrl("Support")} className="hover:text-gold transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to={createPageUrl("Dashboard")} className="hover:text-gold transition-colors">Dashboard</Link></li>
              <li><Link to={createPageUrl("Templates")} className="hover:text-gold transition-colors">Templates</Link></li>
              <li><Link to="/#pricing" className="hover:text-gold transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to={createPageUrl("Help")} className="hover:text-gold transition-colors">Help Center</Link></li>
              <li><Link to={createPageUrl("Support")} className="hover:text-gold transition-colors">Contact Support</Link></li>
              <li><Link to={createPageUrl("SupportSLA")} className="hover:text-gold transition-colors">Service Levels</Link></li>
              <li><Link to={createPageUrl("Status")} className="hover:text-gold transition-colors">System Status</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to={createPageUrl("LegalPrivacy")} className="hover:text-gold transition-colors">Privacy Policy</Link></li>
              <li><Link to={createPageUrl("LegalTerms")} className="hover:text-gold transition-colors">Terms of Service</Link></li>
              <li><Link to={createPageUrl("Changelog")} className="hover:text-gold transition-colors">Changelog</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright section */}
        <div className="mt-12 border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
          <p>
            &copy; {currentYear} REZEMAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
