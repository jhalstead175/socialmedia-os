
import React, { useState, useEffect, useCallback } from 'react';
import { EmailCampaign, User, Subscription } from '@/api/entities';
import { SendEmail } from '@/api/integrations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Mail, Send, AlertCircle, CheckCircle } from 'lucide-react';

export default function EmailCampaignManager() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newCampaign, setNewCampaign] = useState({
    subject: '',
    body: '',
    target_audience: 'all_users'
  });

  const loadCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const allCampaigns = await EmailCampaign.list('-created_date');
      setCampaigns(allCampaigns);
    } catch (err) {
      setError('Failed to load campaigns.');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleInputChange = (field, value) => {
    setNewCampaign(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateAndSend = async (e) => {
    e.preventDefault();
    if (!newCampaign.subject || !newCampaign.body) {
      setError('Subject and body are required.');
      return;
    }
    
    setError('');
    setSuccess('');
    setIsSending(true);

    try {
      // 1. Create the campaign record
      const campaign = await EmailCampaign.create({ ...newCampaign, status: 'sending' });
      
      // 2. Fetch target users
      let targetUsers = [];
      switch (newCampaign.target_audience) {
        case 'premium_users':
          const premiumSubs = await Subscription.filter({ plan_type: 'premium' });
          targetUsers = await User.filter({ id: { $in: premiumSubs.map(s => s.user_id) }});
          break;
        case 'trial_users':
          const trialSubs = await Subscription.filter({ status: 'trial' });
          targetUsers = await User.filter({ id: { $in: trialSubs.map(s => s.user_id) }});
          break;
        // Add free_users case if needed
        default: // all_users
          targetUsers = await User.list('', 1000); // Limit to 1000 for safety
      }
      
      // 3. Send emails
      for (const user of targetUsers) {
        await SendEmail({
          to: user.email,
          subject: newCampaign.subject,
          body: newCampaign.body.replace('{{user.name}}', user.full_name?.split(' ')[0] || 'there')
        });
      }

      // 4. Update campaign status
      await EmailCampaign.update(campaign.id, { 
        status: 'sent', 
        sent_at: new Date().toISOString(),
        sent_to_count: targetUsers.length
      });

      setSuccess(`Campaign sent successfully to ${targetUsers.length} users.`);
      setNewCampaign({ subject: '', body: '', target_audience: 'all_users' });
      loadCampaigns(); // Refresh list

    } catch (err) {
      setError(`Failed to send campaign: ${err.message}`);
    }
    setIsSending(false);
  };

  return (
    <div className="space-y-6">
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert variant="default" className="bg-green-50 border-green-200"><CheckCircle className="h-4 w-4 text-green-600" /><AlertDescription>{success}</AlertDescription></Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Create New Email Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAndSend} className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={newCampaign.subject} onChange={e => handleInputChange('subject', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="body">Body (HTML supported, use {'{{user.name}}'} for personalization)</Label>
              <Textarea id="body" value={newCampaign.body} onChange={e => handleInputChange('body', e.target.value)} required className="h-40 font-mono" />
            </div>
            <div>
              <Label htmlFor="target_audience">Target Audience</Label>
              <Select value={newCampaign.target_audience} onValueChange={value => handleInputChange('target_audience', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_users">All Users</SelectItem>
                  <SelectItem value="premium_users">Premium Users</SelectItem>
                  <SelectItem value="trial_users">Trial Users</SelectItem>
                  <SelectItem value="free_users">Free Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isSending}>
              <Send className="w-4 h-4 mr-2" />
              {isSending ? 'Sending...' : 'Create & Send Campaign'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-40 w-full" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Recipients</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.subject}</TableCell>
                    <TableCell>{c.target_audience}</TableCell>
                    <TableCell><Badge variant={c.status === 'sent' ? 'default' : 'secondary'}>{c.status}</Badge></TableCell>
                    <TableCell>{c.sent_at ? format(new Date(c.sent_at), 'PP p') : 'N/A'}</TableCell>
                    <TableCell>{c.sent_to_count || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
