
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User } from "@/api/entities";
import { createSupportTicket } from "@/api/functions";
import { UploadFile } from "@/api/integrations";
import { Link } from 'react-router-dom'; // Assuming react-router-dom for Link component
import { 
  LifeBuoy, 
  CreditCard,
  UserCircle,
  Zap,
  Wrench,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Shield // New import for Shield icon
} from 'lucide-react';

// Placeholder for createPageUrl - in a real app, this would be imported from a router or utility file
const createPageUrl = (pageName) => {
  switch (pageName) {
    case "SupportSLA":
      return "/support/sla";
    case "Status":
      return "/status";
    case "Help":
      return "/help";
    default:
      return "/";
  }
};

const faqItems = {
  billing: [
    { q: "How do I change my plan?", a: "You can upgrade or downgrade your plan anytime from your Account page under the 'Subscription' tab." },
    { q: "Can I get a refund?", a: "Please see our Terms of Service for our refund policy. Generally, subscriptions are non-refundable, but we review cases individually." }
  ],
  account: [
    { q: "How do I reset my password?", a: "We use passwordless sign-in via Google. If you've lost access to your Google account, you'll need to recover it through them." },
    { q: "How do I delete my account?", a: "You can delete your account and all associated data from the 'Account' tab in your Profile page." }
  ],
  product: [
    { q: "What's the difference between Pro and Elite?", a: "Pro is great for individuals, offering unlimited resumes and AI rewrites. Elite is for senior executives, adding features like the Executive Narrative builder and panel interview simulations." },
    { q: "How does the ATS score work?", a: "Our AI analyzes your resume against keywords and formatting rules common in Applicant Tracking Systems to give you a score and actionable feedback." }
  ],
  technical: [
    { q: "My resume PDF is not formatting correctly.", a: "Please ensure you are using a modern web browser like Chrome or Firefox. If the issue persists, contact us with the resume title and we'll investigate." },
    { q: "I'm experiencing slow loading times.", a: "Try clearing your browser cache. If slowness continues, it might be a temporary issue. Check our Status page for any reported incidents." }
  ]
};

export default function Support() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', topic: '', message: '', plan: 'starter' });
  const [attachment, setAttachment] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ state: 'idle', message: '' });

  useEffect(() => {
    User.me().then(currentUser => {
      if (currentUser) {
        setUser(currentUser);
        setFormData(prev => ({
          ...prev,
          name: currentUser.full_name || '',
          email: currentUser.email || '',
          plan: currentUser.plan || 'starter'
        }));
      }
    }).catch(() => { /* not logged in */ });
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid.";
    if (!formData.topic) newErrors.topic = "Please select a topic.";
    if (!formData.message || formData.message.length < 30) newErrors.message = "Message must be at least 30 characters long.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      let attachmentUrl = null;
      if (attachment) {
        const { file_url } = await UploadFile({ file: attachment });
        attachmentUrl = file_url;
      }

      const { data } = await createSupportTicket({
        name: formData.name,
        email: formData.email,
        topic: formData.topic,
        message: formData.message,
        attachment_url: attachmentUrl
      });
      
      setSubmitStatus({ state: 'success', message: `Ticket #${data.ticket_id} created successfully! We'll be in touch soon.` });
      setFormData({ name: user?.full_name || '', email: user?.email || '', topic: '', message: '', plan: user?.plan || 'starter' });
      setAttachment(null);

    } catch (error) {
      console.error("Support ticket submission error:", error);
      setSubmitStatus({ state: 'error', message: "Failed to submit ticket. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-warm-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center py-12">
          <div className="inline-block p-4 bg-navy/10 rounded-full mb-4">
            <LifeBuoy className="w-10 h-10 text-navy" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">How can we help?</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Find quick answers, browse tutorials, or contact our dedicated support team.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Column A: Quick Answers */}
          <div>
            <h2 className="text-2xl font-semibold text-navy mb-6">Quick Answers</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="billing">
                <AccordionTrigger className="font-semibold"><CreditCard className="w-5 h-5 mr-3 text-gold"/>Billing & Subscriptions</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {faqItems.billing.map((item, i) => <div key={i}><strong>{item.q}</strong><p>{item.a}</p></div>)}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="account">
                <AccordionTrigger className="font-semibold"><UserCircle className="w-5 h-5 mr-3 text-gold"/>Account & Sign-in</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {faqItems.account.map((item, i) => <div key={i}><strong>{item.q}</strong><p>{item.a}</p></div>)}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="product">
                <AccordionTrigger className="font-semibold"><Zap className="w-5 h-5 mr-3 text-gold"/>Product & Features</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {faqItems.product.map((item, i) => <div key={i}><strong>{item.q}</strong><p>{item.a}</p></div>)}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="technical">
                <AccordionTrigger className="font-semibold"><Wrench className="w-5 h-5 mr-3 text-gold"/>Technical Issues</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {faqItems.technical.map((item, i) => <div key={i}><strong>{item.q}</strong><p>{item.a}</p></div>)}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Column B: Contact Form */}
          <div>
            <Card className="border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-navy">Contact Support</CardTitle>
              </CardHeader>
              <CardContent>
                {submitStatus.state === 'success' ? (
                  <Alert className="border-green-200 bg-green-50 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{submitStatus.message}</AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} disabled={!!user} className="input bg-white/80 !text-slate-800 border-slate-300 placeholder:text-slate-500"/>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} disabled={!!user} className="input bg-white/80 !text-slate-800 border-slate-300 placeholder:text-slate-500"/>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="topic">Topic</Label>
                      <Select onValueChange={(value) => handleInputChange('topic', value)} value={formData.topic}>
                        <SelectTrigger id="topic" className="input bg-white/80 !text-slate-800 border-slate-300">
                          <SelectValue placeholder="Select a topic..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Billing">Billing</SelectItem>
                          <SelectItem value="Account">Account</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="Technical">Technical</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic}</p>}
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" rows={6} value={formData.message} onChange={(e) => handleInputChange('message', e.target.value)} className="input bg-white/80 !text-slate-800 border-slate-300 placeholder:text-slate-500" />
                      {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="attachment">Attachment (optional)</Label>
                      <Input id="attachment" type="file" onChange={(e) => setAttachment(e.target.files[0])} className="input bg-white/80 !text-slate-800 border-slate-300 file:text-navy"/>
                    </div>
                    <p className="text-xs text-slate-500">By submitting, you agree to our Privacy Policy.</p>
                    {submitStatus.state === 'error' && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{submitStatus.message}</AlertDescription>
                      </Alert>
                    )}
                    <button type="submit" className="w-full btn btn-primary !bg-navy !text-white" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                      Submit Ticket
                    </button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-navy mb-4">More Resources</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("SupportSLA")}>
              <Button variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Service Levels
              </Button>
            </Link>
            <Link to={createPageUrl("Status")}>
              <Button variant="outline">
                <CheckCircle className="w-4 h-4 mr-2" />
                System Status
              </Button>
            </Link>
            <Link to={createPageUrl("Help")}>
              <Button variant="outline">
                <LifeBuoy className="w-4 h-4 mr-2" />
                Help Center
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
