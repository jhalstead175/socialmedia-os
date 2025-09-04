import React, { useEffect } from 'react';
import { trackEvent } from '../shared/Analytics';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const whatsNewItems = [
    {
        tag: 'NEW',
        title: 'New Templates Added',
        desc: 'Legal & Consulting resume layouts are now available for Pro and Elite users.',
        link: '/app/Templates',
    },
    {
        tag: 'NEW',
        title: 'LinkedIn Optimizer',
        desc: 'Auto-polish your headline & About section based on your target roles.',
        link: '/app/ResumeBuilder', // or a more specific link
    },
    {
        tag: 'NEW',
        title: 'Panel Interview Simulator',
        desc: 'Practice multi-interviewer scenarios and get consolidated feedback.',
        link: '/app/InterviewCoach',
    },
    {
        tag: 'IMPROVED',
        title: 'Metrics Dashboard',
        desc: 'Track your applications & callback rates with our new performance visualizations.',
        link: '/app/Dashboard',
    },
    {
        tag: 'NEW',
        title: 'Cover Letter Generator',
        desc: 'One-click personalized letters tailored to the job description and company voice.',
        link: '/app/ResumeBuilder',
    },
];

const NewsCard = ({ item }) => {
  const handleCardClick = () => {
    trackEvent('whats_new_card_click', { title: item.title });
  };

  return (
    <Link to={item.link} onClick={handleCardClick} className="block group">
      <div className="h-full bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/10">
        <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
        <p className="text-sm text-white/70 mb-4">{item.desc}</p>
        <div className="text-sm font-medium text-white/80 flex items-center gap-1 group-hover:text-white transition-colors">
          Explore Feature <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};

export default function WhatsNew() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          trackEvent('whats_new_view');
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById('whats-new');
    if (section) observer.observe(section);
    
    return () => observer.disconnect();
  }, []);

  return (
    <section id="whats-new" aria-labelledby="whats-new-title" className="py-16 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="whats-new-title" className="h2 mb-4">What’s New</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whatsNewItems.map((item, i) => (
            <NewsCard key={i} item={item} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to={createPageUrl("Changelog")} className="font-medium text-white/80 hover:text-white transition-colors">
            Full changelog →
          </Link>
        </div>
      </div>
    </section>
  );
}