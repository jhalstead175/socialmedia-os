import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

export default function BrandHeader({ onCta }) {
  return (
    <div className="text-center mb-12">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-purple-100 rounded-full">
          <BookOpen className="w-8 h-8 text-purple-600" />
        </div>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4">Product Changelog</h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">
        Stay updated with the latest features, improvements, and fixes we've shipped to REZEMAI.
      </p>
      {onCta && (
        <div className="mt-6">
          <Button onClick={onCta}>
            Get Started with REZEMAI
          </Button>
        </div>
      )}
    </div>
  );
}