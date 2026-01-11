
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HelpCircle,
  Search,
  FileText,
  Video,
  MessageSquare,
  BookOpen,
  ChevronRight,
  Clock,
  ArrowRight,
  Zap,
  Users,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const faqCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    questions: [
      {
        q: 'How do I connect my first social media account?',
        a: 'Navigate to Settings > Connected Accounts, click "Add Account," select your platform (LinkedIn, Twitter, etc.), and authorize SoshOps to post on your behalf. Your credentials are securely stored and encrypted.'
      },
      {
        q: 'What makes SoshOps different from other social media tools?',
        a: 'SoshOps is designed for professionals who need streamlined operations. We offer intelligent scheduling, multi-platform publishing, advanced analytics, and a clean interface built for efficiency—not overwhelming feature bloat.'
      },
      {
        q: 'How does the content scheduler work?',
        a: 'Create a post, select your target platforms, choose a date and time (or use optimal timing suggestions), and save. SoshOps will automatically publish your content at the scheduled time across all selected platforms.'
      }
    ]
  },
  {
    id: 'features',
    title: 'Features & Tools',
    icon: Zap,
    questions: [
      {
        q: 'Can I schedule posts to multiple platforms at once?',
        a: 'Yes! When creating a post, select all platforms you want to publish to. SoshOps will optimize formatting for each platform while maintaining your core message.'
      },
      {
        q: 'How do I view analytics for my posts?',
        a: 'Go to Analytics in the dashboard to see engagement metrics across all your posts. Filter by platform, date range, or campaign to track performance and identify what content resonates.'
      },
      {
        q: 'Can I collaborate with team members?',
        a: 'Business plan users can invite team members, assign roles (admin, editor, viewer), and collaborate on content calendars with built-in approval workflows.'
      }
    ]
  },
  {
    id: 'billing',
    title: 'Billing & Plans',
    icon: CreditCard,
    questions: [
      {
        q: 'What\'s included in the free plan?',
        a: 'The free plan includes 1 connected account, up to 5 scheduled posts per month, basic analytics, and access to LinkedIn and Twitter posting.'
      },
      {
        q: 'Can I upgrade or downgrade my plan?',
        a: 'Yes, you can change your plan anytime in account settings. Upgrades take effect immediately, and downgrades take effect at your next billing cycle.'
      },
      {
        q: 'Do you offer refunds?',
        a: 'We offer a 14-day money-back guarantee for new premium subscriptions. After that, subscriptions are non-refundable, but you can cancel anytime and access continues until the end of your billing period.'
      }
    ]
  },
  {
    id: 'technical',
    title: 'Technical Support',
    icon: Users,
    questions: [
      {
        q: 'My post didn\'t publish at the scheduled time',
        a: 'Check that your social account is still connected in Settings. Sometimes platforms require re-authorization. If the connection is active, contact support with the post ID for investigation.'
      },
      {
        q: 'Can I use SoshOps on mobile devices?',
        a: 'Yes! Our platform is fully responsive and works on phones and tablets. For the best experience creating and scheduling content, we recommend using a desktop or laptop.'
      },
      {
        q: 'How secure is my data?',
        a: 'We use enterprise-grade security with SSL encryption, OAuth 2.0 authentication, secure cloud storage, and regular security audits. Your credentials and content are never shared with third parties.'
      }
    ]
  }
];

const tutorials = [
  {
    title: 'Connecting Your Social Accounts',
    duration: '4 min',
    description: 'Learn how to securely connect LinkedIn, Twitter, and other platforms',
    url: '#tutorial-1'
  },
  {
    title: 'Creating Your First Scheduled Post',
    duration: '5 min',
    description: 'Step-by-step guide to writing, scheduling, and publishing content',
    url: '#tutorial-2'
  },
  {
    title: 'Understanding Analytics & Insights',
    duration: '6 min',
    description: 'Track engagement, reach, and performance across platforms',
    url: '#tutorial-3'
  },
  {
    title: 'Campaign Management Best Practices',
    duration: '7 min',
    description: 'Organize content with campaigns and measure ROI effectively',
    url: '#tutorial-4'
  }
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('getting-started');

  const filteredQuestions = faqCategories
    .find(cat => cat.id === selectedCategory)
    ?.questions.filter(q =>
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <HelpCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4">How can we help you?</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              Find answers to common questions, watch tutorials, or contact our support team
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg border-2 border-slate-200 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Browse FAQs</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600 mb-4">Find quick answers to common questions</p>
                <Badge variant="secondary">40+ Articles</Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Video Tutorials</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600 mb-4">Step-by-step video guides</p>
                <Badge variant="secondary">10 Videos</Badge>
              </CardContent>
            </Card>

            <Link to={createPageUrl("Support")}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                <CardHeader className="text-center pb-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Contact Support</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 mb-4">Get personalized help from our team</p>
                  <Badge variant="secondary">Under 24h Response</Badge>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="faq" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="faq">FAQs</TabsTrigger>
              <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            </TabsList>

            <TabsContent value="faq">
              <div className="grid lg:grid-cols-4 gap-8">
                {/* Category Sidebar */}
                <div className="lg:col-span-1">
                  <h3 className="font-semibold text-navy mb-4">Categories</h3>
                  <div className="space-y-2">
                    {faqCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                          selectedCategory === category.id
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <category.icon className="w-5 h-5" />
                        <span className="font-medium">{category.title}</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* FAQ Content */}
                <div className="lg:col-span-3">
                  <div className="space-y-6">
                    {filteredQuestions.map((faq, index) => (
                      <Card key={index} className="border-0 shadow-sm">
                        <CardContent className="p-6">
                          <h4 className="font-semibold text-navy mb-3 flex items-start gap-2">
                            <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            {faq.q}
                          </h4>
                          <p className="text-slate-700 leading-relaxed ml-7">{faq.a}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tutorials">
              <div className="grid md:grid-cols-2 gap-6">
                {tutorials.map((tutorial, index) => (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Video className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-navy mb-2">{tutorial.title}</h4>
                          <p className="text-slate-600 text-sm mb-3">{tutorial.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Clock className="w-4 h-4" />
                              {tutorial.duration}
                            </div>
                            <Button size="sm" variant="outline" className="text-blue-600 border-blue-200">
                              Watch Now
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
