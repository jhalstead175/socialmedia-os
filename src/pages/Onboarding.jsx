
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Onboarding() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard - onboarding is now handled via WelcomeModal
    navigate(createPageUrl('Dashboard'));
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting to Dashboard...</h2>
        <p className="text-slate-600">Onboarding is now handled via the welcome modal.</p>
      </div>
    </div>
  );
}
