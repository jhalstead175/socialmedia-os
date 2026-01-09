import React, { useState, useEffect } from 'react';
import { User, Building2, CreditCard, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/hooks/useUserSafe';
import { useClerk } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Profile() {
  const { user: clerkUser, isLoaded } = useUser();
  const clerk = useClerk();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [orgData, setOrgData] = useState(null);

  useEffect(() => {
    if (isLoaded && clerkUser) {
      loadAccountData();
    } else if (isLoaded && !clerkUser) {
      setLoading(false);
    }
  }, [isLoaded, clerkUser]);

  const loadAccountData = async () => {
    try {
      // Load user and organization data from Supabase
      const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          email,
          organization_id,
          organizations (
            id,
            name
          )
        `)
        .eq('clerk_user_id', clerkUser.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (user not in DB yet)
        console.error('Failed to load user data:', userError);
      }

      if (user) {
        setUserData(user);
        setOrgData(user.organizations);
      }
    } catch (err) {
      console.error('Error loading account data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (clerk?.signOut) {
        await clerk.signOut();
      }
      window.location.href = '/';
    } catch (err) {
      console.error('Sign out error:', err);
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="container-7xl py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-24 w-full" style={{ background: 'var(--surf-2)' }} />
          <Skeleton className="h-48 w-full" style={{ background: 'var(--surf-2)' }} />
          <Skeleton className="h-48 w-full" style={{ background: 'var(--surf-2)' }} />
        </div>
      </div>
    );
  }

  // If no Clerk user, show message
  if (!clerkUser) {
    return (
      <div className="container-7xl py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="card">
            <CardContent style={{ padding: 'var(--s-6)' }}>
              <p className="text-center" style={{ color: 'var(--text-60)' }}>
                Please sign in to view your profile.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container-7xl py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="h1" style={{ color: 'var(--text-100)' }}>
              Profile
            </h1>
            <p className="lead mt-2">
              Manage your account, organization, and plan.
            </p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="gap-2"
            style={{
              background: '#ef4444',
              color: 'white',
              padding: '10px 16px',
              borderRadius: 'var(--r-lg)',
              fontWeight: '600'
            }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Section 1: Profile */}
        <Card className="card">
          <CardHeader style={{ borderBottom: '1px solid var(--bd-weak)', padding: 'var(--s-6)' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'var(--surf-3)' }}
              >
                <User className="w-5 h-5" style={{ color: 'var(--text-80)' }} />
              </div>
              <div>
                <CardTitle className="h3" style={{ color: 'var(--text-100)' }}>
                  Profile
                </CardTitle>
                <CardDescription style={{ color: 'var(--text-60)', fontSize: 'var(--fs-sm)' }}>
                  Your basic account information.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent style={{ padding: 'var(--s-6)' }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm mb-2 block" style={{ color: 'var(--text-70)' }}>
                  Full Name
                </Label>
                <Input
                  value={clerkUser.fullName || clerkUser.firstName || 'Not set'}
                  disabled
                  className="input"
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block" style={{ color: 'var(--text-70)' }}>
                  Email
                </Label>
                <Input
                  value={clerkUser.primaryEmailAddress?.emailAddress || 'Not set'}
                  disabled
                  className="input"
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Organization */}
        <Card className="card">
          <CardHeader style={{ borderBottom: '1px solid var(--bd-weak)', padding: 'var(--s-6)' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'var(--surf-3)' }}
              >
                <Building2 className="w-5 h-5" style={{ color: 'var(--text-80)' }} />
              </div>
              <div>
                <CardTitle className="h3" style={{ color: 'var(--text-100)' }}>
                  Organization
                </CardTitle>
                <CardDescription style={{ color: 'var(--text-60)', fontSize: 'var(--fs-sm)' }}>
                  Your workspace and billing entity.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent style={{ padding: 'var(--s-6)' }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm mb-2 block" style={{ color: 'var(--text-70)' }}>
                  Organization Name
                </Label>
                <Input
                  value={orgData?.name || 'Not set'}
                  disabled
                  className="input"
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block" style={{ color: 'var(--text-70)' }}>
                  Role
                </Label>
                <Input
                  value="Owner"
                  disabled
                  className="input"
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Plan & Billing */}
        <Card className="card">
          <CardHeader style={{ borderBottom: '1px solid var(--bd-weak)', padding: 'var(--s-6)' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'var(--surf-3)' }}
              >
                <CreditCard className="w-5 h-5" style={{ color: 'var(--text-80)' }} />
              </div>
              <div>
                <CardTitle className="h3" style={{ color: 'var(--text-100)' }}>
                  Plan
                </CardTitle>
                <CardDescription style={{ color: 'var(--text-60)', fontSize: 'var(--fs-sm)' }}>
                  Subscription and limits.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent style={{ padding: 'var(--s-6)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-lg" style={{ color: 'var(--text-100)' }}>
                  Free Plan
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-60)' }}>
                  1 account, 10 posts/month
                </p>
              </div>
              <Button
                variant="outline"
                className="btn-outline"
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                Manage Billing
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Security */}
        <Card className="card">
          <CardHeader style={{ borderBottom: '1px solid var(--bd-weak)', padding: 'var(--s-6)' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'var(--surf-3)' }}
              >
                <Shield className="w-5 h-5" style={{ color: 'var(--text-80)' }} />
              </div>
              <div>
                <CardTitle className="h3" style={{ color: 'var(--text-100)' }}>
                  Security
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent style={{ padding: 'var(--s-6)' }}>
            <p className="text-sm" style={{ color: 'var(--text-60)' }}>
              Authentication is managed securely via your login provider.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
