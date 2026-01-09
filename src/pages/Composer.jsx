import React, { useState, useEffect } from 'react';
import { PenTool, Image, Hash, Calendar, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ConnectAccountModal from '../components/ConnectAccountModal';
import { useDemoMode, demoData, useDemoAction } from '../hooks/useDemoMode';
import { emit, NAV_EVENTS, ACTION_EVENTS, GATE_EVENTS } from '@/utils/telemetry';

export default function Composer() {
  const isDemoMode = useDemoMode();
  const { handleAction } = useDemoAction();
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [actionFeedback, setActionFeedback] = useState('');

  // UI ONLY - Mock connection state (all connected in demo mode)
  const [connectedAccounts] = useState(
    isDemoMode ? demoData.connectedAccounts : {
      x: false,
      linkedin: false,
      meta: false
    }
  );

  const platforms = [
    { id: 'x', name: 'X' },
    { id: 'linkedin', name: 'LinkedIn' },
    { id: 'meta', name: 'Meta' }
  ];

  useEffect(() => {
    emit(NAV_EVENTS.COMPOSER_OPENED);
  }, []);

  const handlePlatformToggle = (platformId) => {
    if (!connectedAccounts[platformId]) {
      emit(GATE_EVENTS.OAUTH_REQUIRED_ENCOUNTERED);
      setSelectedPlatform(platformId);
      setShowConnectModal(true);
      return;
    }

    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const hasAnyConnection = Object.values(connectedAccounts).some(connected => connected);
  const canPublish = selectedPlatforms.length > 0 && content.trim().length > 0;

  const handlePublish = () => {
    emit(ACTION_EVENTS.PUBLISH_ATTEMPTED);
    const feedback = handleAction('publish');
    if (feedback) {
      setActionFeedback(feedback);
      setTimeout(() => setActionFeedback(''), 3000);
    }
  };

  const handleSaveDraft = () => {
    emit(ACTION_EVENTS.DRAFT_SAVE_ATTEMPTED);
    const feedback = handleAction('save');
    if (feedback) {
      setActionFeedback(feedback);
      setTimeout(() => setActionFeedback(''), 3000);
    }
  };

  return (
    <TooltipProvider>
      <div className="container-7xl py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="h1" style={{ color: 'var(--text-100)' }}>
              Composer
            </h1>
            <p className="lead mt-2">
              Create and schedule posts across platforms
            </p>
          </div>

          {/* Action Feedback */}
          {actionFeedback && (
            <div
              className="card mb-6"
              style={{
                padding: 'var(--s-4)',
                background: 'var(--surf-3)',
                border: '1px solid var(--bd-weak)'
              }}
            >
              <div className="text-sm" style={{ color: 'var(--text-100)' }}>
                {actionFeedback}
              </div>
            </div>
          )}

          {/* No Accounts Warning */}
          {!hasAnyConnection && (
            <div
              className="card mb-6"
              style={{
                padding: 'var(--s-4)',
                background: 'var(--surf-2)',
                border: '1px solid var(--bd-weak)'
              }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: 'var(--text-60)' }} />
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-100)' }}>
                    Connect an account
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-60)' }}>
                    Authorization required to publish
                  </div>
                </div>
                <Link to={createPageUrl("Account")}>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Main Composer Card */}
          <div className="card" style={{ padding: 'var(--s-8)' }}>
            {/* Platform Selection */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-80)' }}>
                Select Platforms
              </label>
              <div className="flex gap-3">
                {platforms.map((platform) => {
                  const isConnected = connectedAccounts[platform.id];
                  const isSelected = selectedPlatforms.includes(platform.id);

                  return (
                    <Tooltip key={platform.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handlePlatformToggle(platform.id)}
                          disabled={!isConnected}
                          className="btn btn-outline"
                          style={{
                            background: isSelected ? 'var(--surf-3)' : 'var(--surf-1)',
                            borderColor: isSelected ? 'var(--bd-strong)' : 'var(--bd-weak)',
                            opacity: isConnected ? 1 : 0.5,
                            cursor: isConnected ? 'pointer' : 'not-allowed'
                          }}
                          aria-label={isConnected ? `Toggle ${platform.name}` : `Connect ${platform.name} account to publish`}
                        >
                          {platform.name}
                        </button>
                      </TooltipTrigger>
                      {!isConnected && (
                        <TooltipContent>
                          <p>Connect account to publish</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="mb-6">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full"
                disabled={!hasAnyConnection}
                style={{
                  background: 'var(--surf-1)',
                  borderColor: 'var(--bd-weak)',
                  color: 'var(--text-100)',
                  fontSize: 'var(--fs-md)',
                  padding: 'var(--s-4)',
                  borderRadius: 'var(--r-lg)',
                  opacity: hasAnyConnection ? 1 : 0.5
                }}
                aria-label="Post content"
              />
              <div className="text-sm mt-2" style={{ color: 'var(--text-60)' }}>
                {content.length} / 280 characters
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-6" style={{ borderBottom: '1px solid var(--bd-weak)' }}>
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" disabled={!hasAnyConnection}>
                  <Image className="w-4 h-4 mr-2" />
                  Media
                </Button>
                <Button variant="ghost" size="sm" disabled={!hasAnyConnection}>
                  <Hash className="w-4 h-4 mr-2" />
                  Hashtags
                </Button>
                <Button variant="ghost" size="sm" disabled={!hasAnyConnection}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                disabled={!hasAnyConnection}
                onClick={handleSaveDraft}
              >
                Save Draft
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      className="btn-primary"
                      disabled={!canPublish}
                      onClick={handlePublish}
                      aria-label={canPublish ? "Publish now" : "Select platform and add content to publish"}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Publish Now
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canPublish && hasAnyConnection && (
                  <TooltipContent>
                    <p>Select platform and add content</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>

          {/* Features Preview (Empty State) */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card card-quiet" style={{ padding: 'var(--s-6)' }}>
              <Image className="w-6 h-6 mb-3" style={{ color: 'var(--text-60)' }} />
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-100)' }}>
                Media Library
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-60)' }}>
                Upload images and videos
              </p>
            </div>

            <div className="card card-quiet" style={{ padding: 'var(--s-6)' }}>
              <Hash className="w-6 h-6 mb-3" style={{ color: 'var(--text-60)' }} />
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-100)' }}>
                Hashtag suggestions
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-60)' }}>
                Platform-specific recommendations
              </p>
            </div>

            <div className="card card-quiet" style={{ padding: 'var(--s-6)' }}>
              <PenTool className="w-6 h-6 mb-3" style={{ color: 'var(--text-60)' }} />
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-100)' }}>
                Draft assistance
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-60)' }}>
                Tone and clarity suggestions
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConnectAccountModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        platform={selectedPlatform}
      />
    </TooltipProvider>
  );
}
