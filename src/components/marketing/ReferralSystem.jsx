import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Referral, User } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { 
  Gift, 
  Users, 
  Copy, 
  CheckCircle, 
  Star,
  TrendingUp,
  Mail,
  Trophy
} from 'lucide-react';

export default function ReferralSystem() {
  const [user, setUser] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      // Generate or get existing referral code
      const code = userData.referral_code || generateReferralCode(userData);
      setReferralCode(code);

      // Load user's referrals
      const userReferrals = await Referral.filter({ referrer_id: userData.id });
      setReferrals(userReferrals);
    } catch (error) {
      console.error('Error loading referral data:', error);
    }
    setIsLoading(false);
  };

  const generateReferralCode = (user) => {
    const name = user.full_name?.replace(/\s+/g, '').toUpperCase() || 'USER';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${name.substring(0, 4)}${random}`;
  };

  const copyReferralLink = async () => {
    const referralUrl = `${window.location.origin}?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail || isInviting) return;

    setIsInviting(true);
    setInviteMessage('');

    try {
      // Create referral record
      await Referral.create({
        referrer_id: user.id,
        referee_email: inviteEmail,
        referee_name: 'Invited User',
        referral_code: referralCode,
        reward_type: 'free_month',
        reward_amount: 1
      });

      // Send invitation email
      const referralUrl = `${window.location.origin}?ref=${referralCode}`;
      await SendEmail({
        to: inviteEmail,
        subject: `${user.full_name} invited you to REZEMAI - Get 14 days free!`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1A2F4B 0%, #B88B4A 100%); color: white; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0;">You're Invited to REZEMAI!</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Executive Career Platform</p>
            </div>
            
            <div style="padding: 30px 20px;">
              <p style="font-size: 18px; color: #1A2F4B; margin-bottom: 20px;">
                <strong>${user.full_name}</strong> thinks REZEMAI can help advance your career!
              </p>
              
              <p>REZEMAI is the AI-powered platform designed exclusively for executives and senior leaders. Create outstanding résumés, practice interviews, and land your next role faster.</p>
              
              <div style="background: #F0F9FF; border: 2px solid #3B82F6; padding: 20px; margin: 25px 0; border-radius: 8px; text-align: center;">
                <h3 style="color: #1A2F4B; margin-top: 0;">🎁 Special Offer</h3>
                <p style="margin: 10px 0; font-size: 16px;"><strong>Get 14 days of Premium features FREE</strong></p>
                <p style="margin: 0; color: #6B7280; font-size: 14px;">Plus, ${user.full_name} gets a free month when you subscribe!</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${referralUrl}" 
                   style="background: #1A2F4B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Start Your Free Trial
                </a>
              </div>
              
              <p style="color: #6B7280; font-size: 14px; text-align: center;">
                This invitation expires in 30 days. Terms and conditions apply.
              </p>
            </div>
          </div>
        `
      });

      setInviteMessage('Invitation sent successfully!');
      setInviteEmail('');
      loadReferralData(); // Refresh referrals
    } catch (error) {
      setInviteMessage('Error sending invitation. Please try again.');
      console.error('Invite error:', error);
    }

    setIsInviting(false);
  };

  const getReferralStats = () => {
    const pending = referrals.filter(r => r.status === 'pending').length;
    const signedUp = referrals.filter(r => r.status === 'signed_up').length;
    const converted = referrals.filter(r => r.status === 'converted').length;
    
    return { pending, signedUp, converted, total: referrals.length };
  };

  const stats = getReferralStats();
  const conversionRate = stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0;

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-navy mb-2">Refer Friends, Earn Rewards</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Share REZEMAI with your network and earn free premium months. 
            Help other executives advance their careers while growing your own benefits!
          </p>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-navy">{stats.total}</div>
            <div className="text-xs text-slate-600">Total Referrals</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-navy">{stats.converted}</div>
            <div className="text-xs text-slate-600">Conversions</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-navy">{conversionRate}%</div>
            <div className="text-xs text-slate-600">Success Rate</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-navy">{stats.converted}</div>
            <div className="text-xs text-slate-600">Months Earned</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Share Your Link */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5 text-blue-600" />
              Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Referral Code
              </label>
              <div className="flex gap-2">
                <Input
                  value={referralCode}
                  readOnly
                  className="font-mono bg-slate-50"
                />
                <Button
                  variant="outline"
                  onClick={copyReferralLink}
                  className="gap-2"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Share your referral link with colleagues</li>
                <li>They sign up and get 14 days free premium</li>
                <li>When they subscribe, you get 1 month free!</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Send Invites */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              Send Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            {inviteMessage && (
              <Alert className={inviteMessage.includes('Error') ? 'border-red-200' : 'border-green-200'}>
                <AlertDescription>{inviteMessage}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={sendInvite}
              disabled={!inviteEmail || isInviting}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isInviting ? 'Sending...' : 'Send Invitation'}
            </Button>

            <div className="text-center text-sm text-slate-600">
              <p>Personalized email with your referral link</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Referrals */}
      {referrals.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.slice(0, 5).map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">{referral.referee_email}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(referral.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    className={
                      referral.status === 'converted' 
                        ? 'bg-green-100 text-green-800'
                        : referral.status === 'signed_up'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }
                  >
                    {referral.status === 'converted' ? 'Converted' : 
                     referral.status === 'signed_up' ? 'Signed Up' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}