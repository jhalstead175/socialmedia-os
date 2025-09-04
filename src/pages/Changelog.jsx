import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { trackEvent } from '@/components/shared/Analytics';
import BrandHeader from '../components/changelog/BrandHeader';
import ChangelogSection from '../components/changelog/ChangelogSection';

export default function Changelog() {
  const navigate = useNavigate();

  React.useEffect(() => {
    trackEvent('page_view', { page: 'Changelog' });
  }, []);

  const handleCta = () => {
    navigate(createPageUrl('Signin'));
  };

  return (
    <div className="min-h-screen bg-warm-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <BrandHeader onCta={handleCta} />
        <ChangelogSection />
      </div>
    </div>
  );
}