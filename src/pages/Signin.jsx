import React, { useEffect } from "react";
import { SignIn } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useClerkAuth } from "@/api/clerkClient";
import RezemaiLogo from "../components/Logo";
import { theme } from "@/styles/rezemai.tokens";

export default function Signin() {
  const { isAuthenticated, isLoading } = useClerkAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already signed in
    if (isAuthenticated && !isLoading) {
      navigate(createPageUrl("Dashboard"));
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: theme.colors.bg }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <RezemaiLogo className="mx-auto mb-4" />
          <h1
            className="text-2xl font-semibold mb-2"
            style={{ color: theme.colors.textPrimary }}
          >
            Welcome to Rezemai
          </h1>
          <p style={{ color: theme.colors.textSecondary }}>
            Build resumes and practice interviews
          </p>
        </div>

        <div className="flex justify-center">
          <SignIn
            appearance={{
              baseTheme: "dark",
              elements: {
                rootBox: "mx-auto",
                card: `${theme.radius.card} border`,
                cardBox: "shadow-xl"
              },
              variables: {
                colorPrimary: theme.colors.accent,
                colorBackground: theme.colors.panel,
                colorInputBackground: theme.colors.bg,
                colorText: theme.colors.textPrimary,
              }
            }}
            redirectUrl={createPageUrl("Dashboard")}
          />
        </div>

        <div className="text-center mt-6">
          <Link
            to={createPageUrl("Landing")}
            className="text-sm hover:opacity-80 transition-opacity"
            style={{ color: theme.colors.textSecondary }}
          >
            ← Back to homepage
          </Link>
        </div>

        <p
          className="text-center text-xs mt-8"
          style={{ color: theme.colors.textSecondary }}
        >
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