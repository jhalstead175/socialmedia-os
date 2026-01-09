import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * ConnectedAccountCard - OAuth connection status display
 * UI ONLY - No real OAuth implementation
 */
export default function ConnectedAccountCard({
  platform,
  isConnected = false,
  isExpired = false,
  onConnect,
  onReconnect
}) {
  const platformConfig = {
    x: { name: 'X', color: '#1DA1F2' },
    linkedin: { name: 'LinkedIn', color: '#0A66C2' },
    meta: { name: 'Meta', color: '#0668E1' }
  };

  const config = platformConfig[platform];

  const getStatusText = () => {
    if (isConnected && !isExpired) return 'Connected';
    if (isExpired) return 'Connection expired';
    return 'Not connected';
  };

  const getStatusColor = () => {
    if (isConnected && !isExpired) return 'bg-green-500';
    if (isExpired) return 'bg-amber-500';
    return 'bg-slate-600';
  };

  return (
    <div
      className="card"
      style={{
        padding: 'var(--s-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${getStatusColor()}`}
            aria-label={getStatusText()}
          />
        </div>

        {/* Platform Info */}
        <div className="flex-1">
          <div className="font-semibold text-sm" style={{ color: 'var(--text-100)' }}>
            {config.name}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-60)' }}>
            {getStatusText()}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div>
        {!isConnected && (
          <Button
            variant="outline"
            size="sm"
            onClick={onConnect}
            aria-label={`Connect ${config.name} account`}
          >
            Connect
          </Button>
        )}

        {isConnected && !isExpired && (
          <Button
            variant="ghost"
            size="sm"
            disabled
            title="Coming soon"
            aria-label={`Disconnect ${config.name} account (coming soon)`}
          >
            Disconnect
          </Button>
        )}

        {isExpired && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReconnect}
            aria-label={`Reconnect ${config.name} account`}
          >
            Reconnect
          </Button>
        )}
      </div>
    </div>
  );
}
