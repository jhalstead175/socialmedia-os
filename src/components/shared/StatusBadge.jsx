import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { StatusComponent } from "@/api/entities";
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { trackEvent } from "@/components/shared/Analytics";

export default function StatusBadge() {
  const [overallStatus, setOverallStatus] = useState('operational');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    // Refresh status every 5 minutes
    const interval = setInterval(loadStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const components = await StatusComponent.list();
      
      if (components.some(c => c.status === 'major_outage')) {
        setOverallStatus('major_outage');
      } else if (components.some(c => ['partial_outage', 'degraded'].includes(c.status))) {
        setOverallStatus('degraded');
      } else {
        setOverallStatus('operational');
      }
    } catch (error) {
      console.error('Error loading status:', error);
      setOverallStatus('operational'); // Default to operational on error
    }
    setIsLoading(false);
  };

  const handleClick = () => {
    trackEvent('status_badge_click', { current_status: overallStatus });
    window.open('/status', '_blank');
  };

  if (isLoading) {
    return null; // Don't show anything while loading
  }

  const getStatusConfig = () => {
    switch (overallStatus) {
      case 'major_outage':
        return {
          icon: XCircle,
          text: 'Outage',
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
        };
      case 'degraded':
        return {
          icon: AlertTriangle,
          text: 'Degraded',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
        };
      default:
        return {
          icon: CheckCircle,
          text: 'Operational',
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge
      className={`cursor-pointer transition-colors duration-200 ${config.className}`}
      onClick={handleClick}
    >
      <config.icon className="w-3 h-3 mr-1" />
      {config.text}
    </Badge>
  );
}