import React, { useEffect } from "react";
import { SignIn } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useClerkAuth } from "@/api/clerkClient";
import Logo from "../components/Logo";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Signin() {
  const { isAuthenticated, isLoading } = useClerkAuth();
  const navigate = useNavigate();

  // Check if Clerk is configured
  const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  useEffect(() => {
    // Redirect if already signed in
    if (isAuthenticated && !isLoading) {
      navigate(createPageUrl("Dashboard"));
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B0F14]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-2 text-zinc-100">
            Welcome to SoshOps
          </h1>
          <p className="text-zinc-400">
            Manage your social media operations
          </p>
        </div>

        {!isClerkConfigured ? (
          <Card className="bg-red-950 border-red-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-100 mb-2">
                    Authentication Not Configured
                  </h3>
                  <p className="text-sm text-red-200 mb-3">
                    The Clerk authentication service is not set up. To enable sign-in:
                  </p>
                  <ol className="text-sm text-red-200 space-y-1 list-decimal list-inside">
                    <li>Create a <code className="bg-red-900 px-1 rounded">.env</code> file in the project root</li>
                    <li>Add <code className="bg-red-900 px-1 rounded">VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</code></li>
                    <li>Get your key from <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-100">dashboard.clerk.com</a></li>
                    <li>Restart the dev server</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex justify-center">
            <SignIn
              appearance={{
                baseTheme: "dark",
                elements: {
                  rootBox: "mx-auto",
                  card: "rounded-xl border",
                  cardBox: "shadow-xl"
                },
                variables: {
                  colorPrimary: "#3B82F6",
                  colorBackground: "#111827",
                  colorInputBackground: "#0B0F14",
                  colorText: "#FFFFFF",
                }
              }}
              redirectUrl={createPageUrl("Dashboard")}
            />
          </div>
        )}

        <div className="text-center mt-6">
          <Link
            to={createPageUrl("Landing")}
            className="text-sm text-zinc-400 hover:opacity-80 transition-opacity"
          >
            ← Back to homepage
          </Link>
        </div>

        <p className="text-center text-xs mt-8 text-zinc-400">
          By signing in, you agree to our{' '}
          <Link to={createPageUrl("LegalTerms")} className="underline hover:opacity-80">
            Terms
          </Link>{' '}
          and{' '}
          <Link to={createPageUrl("LegalPrivacy")} className="underline hover:opacity-80">
            Privacy Policy
          </Link>.
        </p>
      </div>
    </div>
  );
}
