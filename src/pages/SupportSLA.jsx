import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Clock, 
  Mail, 
  MessageSquare, 
  Shield, 
  AlertTriangle,
  Activity,
  ExternalLink,
  CheckCircle,
  XCircle,
  Minus
} from 'lucide-react';

export default function SupportSLA() {
  const slaData = [
    {
      plan: 'Starter',
      planColor: 'bg-slate-100 text-slate-800',
      firstResponse: '1 business day',
      resolution: '3 business days',
      channels: 'Email'
    },
    {
      plan: 'Pro',
      planColor: 'bg-blue-100 text-blue-800',
      firstResponse: '4 business hours',
      resolution: '1 business day',
      channels: 'Email, priority queue'
    },
    {
      plan: 'Elite',
      planColor: 'bg-purple-100 text-purple-800',
      firstResponse: '2 business hours',
      resolution: 'Same business day',
      channels: 'Email, priority queue, live chat'
    }
  ];

  const severityLevels = [
    {
      level: 'SEV-1',
      description: 'Full outage (Auth/Checkout/Webhooks down)',
      icon: XCircle,
      color: 'text-red-500',
      updates: 'Updates every 30–60 min'
    },
    {
      level: 'SEV-2', 
      description: 'Degraded performance (slow checkout, partial errors)',
      icon: AlertTriangle,
      color: 'text-orange-500',
      updates: 'Updates every 2–4 hrs'
    },
    {
      level: 'SEV-3',
      description: 'Minor defects/UX issues',
      icon: Minus,
      color: 'text-yellow-500',
      updates: 'Changelog on fix'
    }
  ];

  return (
    <div className="min-h-screen bg-warm-white p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4">Support Service Levels</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Clear response times and escalation paths based on your plan.
          </p>
        </div>

        {/* Business Hours Card */}
        <Card className="border-0 shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Hours & Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-navy mb-2">Primary Business Hours</h4>
                <p className="text-slate-700">Monday – Friday, 9:00 AM – 6:00 PM ET</p>
                <p className="text-sm text-slate-500">(America/New_York timezone)</p>
              </div>
              <div>
                <h4 className="font-semibold text-navy mb-2">Support Channels</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">Email: support@rezemai.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">In-app messages (all plans)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <span className="text-slate-700">Priority queue (Pro/Elite)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <span className="text-slate-700">Live chat windows (Elite only)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SLA Table */}
        <Card className="border-0 shadow-lg mb-12">
          <CardHeader>
            <CardTitle>Service Level Agreements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full" role="table" aria-label="Service level agreements by plan">
                <caption className="sr-only">
                  Response times and resolution commitments for each subscription plan
                </caption>
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-navy" scope="col">Plan</th>
                    <th className="text-left py-3 px-4 font-semibold text-navy" scope="col">First Response</th>
                    <th className="text-left py-3 px-4 font-semibold text-navy" scope="col">Typical Resolution</th>
                    <th className="text-left py-3 px-4 font-semibold text-navy" scope="col">Channels</th>
                  </tr>
                </thead>
                <tbody>
                  {slaData.map((row, index) => (
                    <tr key={index} className={index !== slaData.length - 1 ? 'border-b border-slate-100' : ''}>
                      <td className="py-4 px-4">
                        <Badge className={row.planColor}>{row.plan}</Badge>
                      </td>
                      <td className="py-4 px-4 text-slate-700 font-medium">{row.firstResponse}</td>
                      <td className="py-4 px-4 text-slate-700">{row.resolution}</td>
                      <td className="py-4 px-4 text-slate-600">{row.channels}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Escalation Policy */}
        <Card className="border-0 shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Escalation Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">1</div>
                <div>
                  <h4 className="font-semibold text-navy">Ticket Created</h4>
                  <p className="text-slate-600">Auto-acknowledgment sent within minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-semibold text-sm">2</div>
                <div>
                  <h4 className="font-semibold text-navy">SLA Breach Alert</h4>
                  <p className="text-slate-600">If no response within SLA window, reply "ESCALATE" to the ticket email</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-semibold text-sm">3</div>
                <div>
                  <h4 className="font-semibold text-navy">On-Call Escalation</h4>
                  <p className="text-slate-600">Escalation routes to on-call within 1 hour (business hours)</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold text-sm">4</div>
                <div>
                  <h4 className="font-semibold text-navy">Major Incident Response</h4>
                  <p className="text-slate-600">Major incidents (checkout, auth) trigger status page updates and broadcast notifications</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Severity Definitions */}
        <Card className="border-0 shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Severity Definitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {severityLevels.map((severity, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                  <severity.icon className={`w-6 h-6 ${severity.color} mt-0.5`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="font-mono text-xs">{severity.level}</Badge>
                      <span className="font-semibold text-navy">{severity.description}</span>
                    </div>
                    <p className="text-sm text-slate-600">{severity.updates}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl("Support")}>
            <Button className="bg-navy hover:bg-navy/90 text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Open a Ticket
            </Button>
          </Link>
          <Link to={createPageUrl("Status")}>
            <Button variant="outline">
              <Activity className="w-4 h-4 mr-2" />
              Check Status
            </Button>
          </Link>
          <Link to={createPageUrl("Changelog")}>
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Changelog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}