import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Mail,
  ExternalLink,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { StatusComponent, Incident, Maintenance } from '@/api/entities';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { trackEvent } from '@/components/shared/Analytics';
import Logo from '@/components/Logo';

const getStatusConfig = (status) => {
  const configs = {
    operational: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100', text: 'Operational' },
    degraded: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-100', text: 'Degraded' },
    partial_outage: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100', text: 'Partial Outage' },
    major_outage: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100', text: 'Major Outage' }
  };
  return configs[status] || configs.operational;
};

const getSeverityConfig = (severity) => {
  const configs = {
    sev1: { color: 'bg-red-100 text-red-800', text: 'Critical' },
    sev2: { color: 'bg-orange-100 text-orange-800', text: 'Major' },
    sev3: { color: 'bg-yellow-100 text-yellow-800', text: 'Minor' }
  };
  return configs[severity] || configs.sev3;
};

const getOverallStatus = (components) => {
  let statusKey = 'operational';
  if (components.some(c => c.status === 'major_outage')) {
    statusKey = 'major_outage';
  } else if (components.some(c => ['partial_outage', 'degraded'].includes(c.status))) {
    statusKey = 'degraded';
  }

  const config = getStatusConfig(statusKey);
  let overallText = config.text; 

  if (statusKey === 'degraded') {
    overallText = 'Degraded Performance';
  } else if (statusKey === 'major_outage') {
    overallText = 'Major Outage';
  } else {
    overallText = 'All Systems Operational';
  }

  return {
    status: statusKey,
    text: overallText,
    color: config.color,
    icon: config.icon,
    bg: config.bg
  };
};

export default function Status() {
  const [components, setComponents] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [expandedIncident, setExpandedIncident] = useState(null);

  useEffect(() => {
    trackEvent('page_view', { page: 'Status' });
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [componentsData, incidentsData, maintenanceData] = await Promise.all([
          StatusComponent.list(),
          Incident.filter({ public: true }, '-started_at', 20),
          Maintenance.list('-window_start', 10)
        ]);

        setComponents(componentsData);

        if (componentsData.length > 0) {
          const latestUpdate = componentsData.reduce((latest, comp) => {
            const compDate = parseISO(comp.updated_at);
            return latest === null || compDate > latest ? compDate : latest;
          }, null);
          setLastUpdated(latestUpdate);
        }

        setIncidents(incidentsData);
        setMaintenances(maintenanceData);
      } catch (err) {
        console.error("Error fetching status data:", err);
        setError("Could not load system status. Please try again later.");
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const toggleIncidentExpansion = (incidentId) => {
    setExpandedIncident(expandedIncident === incidentId ? null : incidentId);
    if (expandedIncident !== incidentId) {
      trackEvent('incident_expanded', { incident_id: incidentId });
    }
  };

  const overallStatus = getOverallStatus(components);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3 mb-8"></div>
          <div className="grid gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Landing')}>
              <Logo />
            </Link>
            <Link to={createPageUrl('Dashboard')} className="hidden sm:inline-block">
              <Button variant="outline">Go to Dashboard <ExternalLink className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <div className="text-center mb-10">
          <Badge className={`${overallStatus.bg} ${overallStatus.color} px-4 py-1.5 text-sm mb-4`}>
            <overallStatus.icon className="w-4 h-4 mr-2" />
            {overallStatus.text}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-navy mb-2">System Status</h1>
          <p className="text-slate-500 text-sm">
            {lastUpdated ? `Last updated: ${format(lastUpdated, 'MMMM d, yyyy, h:mm:ss a')}` : 'Checking status...'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Times are displayed in your local timezone.</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {/* Components Status */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle>System Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {components.map((component) => {
                const config = getStatusConfig(component.status);
                return (
                  <div key={component.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <config.icon className={`w-5 h-5 ${config.color}`} />
                      <div>
                        <h4 className="font-semibold text-navy">{component.name}</h4>
                        {component.description && (
                          <p className="text-sm text-slate-600">{component.description}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={`${config.bg} ${config.color} border-0`}>
                      {config.text}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Active Incidents */}
        {incidents.length > 0 && (
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Active Incidents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {incidents.map((incident) => {
                const severityConfig = getSeverityConfig(incident.severity);
                const isExpanded = expandedIncident === incident.id;
                const visibleUpdates = isExpanded ? incident.timeline : incident.timeline.slice(-3);
                
                return (
                  <div key={incident.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-navy mb-2">{incident.title}</h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={severityConfig.color}>{severityConfig.text}</Badge>
                          <Badge variant="outline" className="capitalize">{incident.status.replace('_', ' ')}</Badge>
                          <span className="text-sm text-slate-500">
                            Started {format(new Date(incident.started_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-3">
                      {visibleUpdates.map((update, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-slate-700">{update.text}</p>
                            <p className="text-slate-500 text-xs">
                              {format(new Date(update.timestamp), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {incident.timeline.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleIncidentExpansion(incident.id)}
                        className="mt-3"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-2" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-2" />
                            Show All Updates ({incident.timeline.length})
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Scheduled Maintenance */}
        {maintenances.length > 0 && (
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Scheduled Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {maintenances.map((item) => (
                <div key={item.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-navy">{item.title}</h4>
                    <Badge variant="outline" className="capitalize">{item.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-slate-700 mb-3">{item.notice}</p>
                  <div className="text-sm text-slate-500">
                    <p>
                      {format(new Date(item.window_start), 'MMM d, yyyy h:mm a')} - {format(new Date(item.window_end), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Subscribe Section */}
        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-navy mb-4">Stay Updated</h3>
            <p className="text-slate-600 mb-6">
              Get notified about incidents and maintenance windows affecting our services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <a href="mailto:support@rezemai.com?subject=Status Update Subscription">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Updates
                </a>
              </Button>
              <Link to={createPageUrl("Support")}>
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open a Ticket
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center">
          <Link to={createPageUrl("Changelog")} className="text-blue-600 hover:text-blue-800">
            View Changelog →
          </Link>
        </div>
      </main>
    </div>
  );
}