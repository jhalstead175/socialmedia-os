import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * ConnectAccountModal - OAuth connection flow placeholder
 * UI ONLY - No real OAuth implementation
 */
export default function ConnectAccountModal({
  isOpen,
  onClose,
  platform
}) {
  const platformNames = {
    x: 'X',
    linkedin: 'LinkedIn',
    meta: 'Meta'
  };

  const handleContinue = () => {
    // UI ONLY - No actual OAuth flow
    // In production, this would initiate OAuth redirect
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="card"
        style={{
          background: 'var(--surf-2)',
          border: '1px solid var(--bd-weak)',
          maxWidth: '420px'
        }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-xl font-semibold"
            style={{ color: 'var(--text-100)' }}
          >
            Connect account
          </DialogTitle>
          <DialogDescription
            className="text-sm mt-2"
            style={{ color: 'var(--text-80)' }}
          >
            Authorization required to publish and read engagement data.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            aria-label="Cancel connection"
          >
            Cancel
          </Button>
          <Button
            className="btn-primary"
            onClick={handleContinue}
            aria-label={`Continue to connect ${platformNames[platform] || 'account'}`}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
