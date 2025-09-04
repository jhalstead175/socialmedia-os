import React, { useState, useEffect } from 'react';
import { User, WebhookLog } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Webhook, 
  PlayCircle, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { webhookTestTools } from '@/api/functions';
import { format } from 'date-fns';

export default function WebhookTools() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [subscriptionId, setSubscriptionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [user, logs, allUsers] = await Promise.all([
        User.me(),
        WebhookLog.list('-created_date', 20),
        User.list('-created_date', 50)
      ]);
      
      if (user.role !== 'admin') {
        throw new Error('Admin access required');
      }
      
      setCurrentUser(user);
      setWebhookLogs(logs);
      setUsers(allUsers);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
    setIsLoading(false);
  };

  const handleSimulateStatus = async (status) => {
    if (!selectedUserId) {
      setMessage({ type: 'error', text: 'Please select a user first' });
      return;
    }

    setIsProcessing(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await webhookTestTools({
        action: 'simulate_status_change',
        userId: selectedUserId,
        status: status
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: `Successfully simulated ${status} status` });
        loadData(); // Refresh logs
      } else {
        throw new Error('Simulation failed');
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to simulate: ${error.message}` });
    }
    setIsProcessing(false);
  };

  const handleForceResync = async () => {
    if (!subscriptionId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a Stripe Subscription ID' });
      return;
    }

    setIsProcessing(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await webhookTestTools({
        action: 'force_resync',
        subscriptionId: subscriptionId.trim()
      });

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: `Successfully synced subscription data: ${JSON.stringify(response.data.data)}` 
        });
        loadData(); // Refresh logs
        setSubscriptionId('');
      } else {
        throw new Error('Resync failed');
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to resync: ${error.message}` });
    }
    setIsProcessing(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'skipped': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Admin access required</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{backgroundColor: '#F8F8F8'}}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Webhook className="w-8 h-8 text-blue-600" />
            Webhook Testing Tools
          </h1>
          <p className="text-slate-600 mt-1">Test and monitor Stripe webhook processing</p>
        </div>

        {message.text && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="simulate" className="w-full">
          <TabsList>
            <TabsTrigger value="simulate">Simulate Events</TabsTrigger>
            <TabsTrigger value="resync">Force Resync</TabsTrigger>
            <TabsTrigger value="logs">Webhook Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="simulate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Simulate Subscription Status Changes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Select User</label>
                  <select 
                    className="w-full p-2 border rounded-lg"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">Choose a user...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || user.email} ({user.plan || 'starter'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap gap-3">
                  {['active', 'past_due', 'canceled'].map(status => (
                    <Button
                      key={status}
                      onClick={() => handleSimulateStatus(status)}
                      disabled={isProcessing || !selectedUserId}
                      variant="outline"
                      className={`${
                        status === 'active' ? 'border-green-200 text-green-700 hover:bg-green-50' :
                        status === 'past_due' ? 'border-yellow-200 text-yellow-700 hover:bg-yellow-50' :
                        'border-red-200 text-red-700 hover:bg-red-50'
                      }`}
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Set {status}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resync" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Force Resync from Stripe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Stripe Subscription ID
                  </label>
                  <Input
                    placeholder="sub_1Abc123..."
                    value={subscriptionId}
                    onChange={(e) => setSubscriptionId(e.target.value)}
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Fetches latest data from Stripe and updates user record
                  </p>
                </div>

                <Button
                  onClick={handleForceResync}
                  disabled={isProcessing || !subscriptionId.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Force Resync
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Webhook Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Event ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhookLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            <Badge 
                              className={
                                log.status === 'success' ? 'bg-green-100 text-green-800' :
                                log.status === 'error' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {log.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{log.event_type}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">
                          {log.stripe_event_id}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.user_id ? (
                            <span className="font-mono text-xs">{log.user_id}</span>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(log.created_date), 'MMM d, HH:mm:ss')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}