import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import RezemaiLogo from "../components/Logo";
import { trackEvent } from "@/components/shared/Analytics";

export default function Signin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const user = await User.me();
        if (user) {
          navigate(createPageUrl("Dashboard"));
        }
      } catch (error) {
        // User not logged in, which is expected on this page.
      }
    };
    checkAuth();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      trackEvent('auth_attempt', { method: 'google' });
      // This is the direct and correct way to initiate the Google login flow.
      const redirectUrl = `${window.location.origin}${createPageUrl('Dashboard')}`;
      await User.loginWithRedirect(redirectUrl);
      // The user will be redirected to Google, and the code below will not execute.
    } catch (err) {
      // This will only catch errors if the redirect itself fails.
      setError('Google sign in failed. Please ensure pop-ups are not blocked and try again.');
      setIsLoading(false);
      console.error('Sign in error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1020] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <RezemaiLogo className="mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-white mb-2">Welcome to REZEMAI</h1>
          <p className="text-white/70">Sign in to continue your career journey</p>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-4 border-red-500/20 bg-red-500/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white text-slate-900 hover:bg-white/90 font-medium h-12"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </div>
              )}
            </Button>

            <p className="text-center text-xs text-white/60 mt-6">
              By signing in, you agree to our{' '}
              <Link to={createPageUrl("LegalTerms")} className="underline hover:text-white">Terms</Link> and{' '}
              <Link to={createPageUrl("LegalPrivacy")} className="underline hover:text-white">Privacy Policy</Link>.
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to={createPageUrl("Landing")} className="text-white/60 hover:text-white text-sm">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}