import React, { useState, useEffect, useCallback } from 'react';
import { SupportTicket } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { LifeBuoy, Filter, Search, Send, File, Save } from 'lucide-react';
import { trackEvent } from '@/components/shared/Analytics';

export default function SupportTicketViewer() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'open', topic: 'all', priority: 'all', search: '' });
  const [activeTicket, setActiveTicket] = useState(null);

  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = {};
      if (filters.status !== 'all') query.status = filters.status;
      if (filters.topic !== 'all') query.topic = filters.topic;
      if (filters.priority !== 'all') query.priority = filters.priority;
      
      let allTickets = await SupportTicket.filter(query, '-created_date', 100);
      
      if (filters.search) {
        allTickets = allTickets.filter(t => 
          t.email.toLowerCase().includes(filters.search.toLowerCase()) || 
          t.id.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      setTickets(allTickets);
    } catch (error) {
      console.error("Failed to load tickets:", error);
    }
    setIsLoading(false);
  }, [filters]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const updateTicketStatus = async (ticketId, status) => {
    await SupportTicket.update(ticketId, { status });
    trackEvent(status === 'resolved' || status === 'closed' ? 'ticket_closed' : 'ticket_status_changed', { ticketId, status });
    loadTickets();
  };
  
  const cannedResponses = [
    { name: 'Billing Question', text: "Hello,\n\nThanks for reaching out about your billing. You can manage your subscription, view invoices, and update payment details directly from your Account page: [link to account page]\n\nLet me know if you have any other questions!\n\nBest," },
    { name: 'Feature Request', text: "Hello,\n\nThank you so much for the excellent suggestion! I've passed it along to our product team for consideration in future updates.\n\nWe love hearing from our users, so please don't hesitate to reach out with more ideas.\n\nBest," },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100';
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><LifeBuoy /> Support Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
          <Input 
            placeholder="Search email or ID..." 
            className="max-w-xs" 
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
           <Select value={filters.topic} onValueChange={(v) => handleFilterChange('topic', v)}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              <SelectItem value="Billing">Billing</SelectItem>
              <SelectItem value="Account">Account</SelectItem>
              <SelectItem value="Product">Product</SelectItem>
              <SelectItem value="Technical">Technical</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full" onValueChange={setActiveTicket}>
            {tickets.map(ticket => (
              <AccordionItem key={ticket.id} value={ticket.id}>
                <AccordionTrigger>
                  <div className="flex justify-between items-center w-full pr-4 text-sm">
                    <div className="font-medium truncate" title={ticket.email}>{ticket.email}</div>
                    <div className="flex items-center gap-4">
                      <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                      <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                      <span className="text-slate-500 w-24 text-right hidden md:inline">
                        {formatDistanceToNow(new Date(ticket.created_date), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-slate-50 rounded-b-md space-y-4">
                  <p><strong>From:</strong> {ticket.name} ({ticket.email})</p>
                  <p><strong>Topic:</strong> {ticket.topic}</p>
                  {ticket.attachment_url && <p><strong>Attachment:</strong> <a href={ticket.attachment_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Attachment</a></p>}
                  <div className="mt-2 border-t pt-2">
                    <p className="whitespace-pre-wrap">{ticket.message}</p>
                  </div>
                  <div className="mt-4 border-t pt-4 space-y-2">
                    <h4 className="font-semibold">Agent Actions</h4>
                    <div className="flex gap-2">
                      <Select onValueChange={(value) => updateTicketStatus(ticket.id, value)} value={ticket.status}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Change status..."/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={() => updateTicketStatus(ticket.id, 'closed')} variant="secondary">Mark Closed</Button>
                    </div>
                    <Textarea placeholder="Add internal notes..."/>
                    <Button size="sm" variant="outline"><Save className="w-4 h-4 mr-2"/>Save Note</Button>
                    <div className="pt-2">
                      <Select>
                         <SelectTrigger className="w-full"><SelectValue placeholder="Reply with canned response..."/></SelectTrigger>
                         <SelectContent>
                           {cannedResponses.map(res => <SelectItem key={res.name} value={res.text}>{res.name}</SelectItem>)}
                         </SelectContent>
                      </Select>
                      <Textarea placeholder="Write a reply..." className="mt-2" rows={5}/>
                      <Button className="mt-2"><Send className="w-4 h-4 mr-2"/>Send Reply</Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}