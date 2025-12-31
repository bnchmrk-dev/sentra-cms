import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SignUp, useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/signup")({
  component: SignUpPage,
});

function SignUpPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate({ to: "/" });
      return;
    }

    // Check if email was verified through check-access
    const email = sessionStorage.getItem("signupEmail");
    if (email) {
      setVerifiedEmail(email);
      // Clear it so they can't refresh and reuse
      sessionStorage.removeItem("signupEmail");
    }
  }, [isLoaded, isSignedIn, navigate]);

  // If no verified email, redirect to check-access
  if (isLoaded && !isSignedIn && !verifiedEmail) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-status-warning-bg mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-status-warning" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            Verification Required
          </h2>
          <p className="text-text-muted mb-6">
            Please verify your email domain before signing up.
          </p>
          <a
            href="/check-access"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition-colors"
          >
            Verify Access
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2 tracking-tight">
            Labs<span className="text-accent">.</span>
          </h1>
          <p className="text-text-muted">Create your admin account</p>
        </div>

        {/* Verified Email Badge */}
        {verifiedEmail && (
          <div className="mb-6 p-4 rounded-lg bg-status-live-bg border border-status-live/20 text-center">
            <p className="text-sm text-status-live">
              ✓ Verified: <span className="font-medium">{verifiedEmail}</span>
            </p>
          </div>
        )}

        {/* Clerk SignUp Component */}
        <div className="flex justify-center">
          <SignUp
            initialValues={{
              emailAddress: verifiedEmail || undefined,
            }}
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-bg-surface border border-border-default shadow-lg rounded-xl",
                headerTitle: "text-text-primary",
                headerSubtitle: "text-text-muted",
                socialButtonsBlockButton:
                  "bg-bg-elevated border-border-default text-text-primary hover:bg-bg-hover",
                socialButtonsBlockButtonText: "text-text-primary font-medium",
                dividerLine: "bg-border-default",
                dividerText: "text-text-muted",
                formFieldLabel: "text-text-secondary",
                formFieldInput:
                  "bg-bg-input border-border-default text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-accent",
                formButtonPrimary:
                  "bg-accent hover:bg-accent-hover text-text-inverse font-semibold",
                footerActionLink: "text-accent hover:text-accent-hover",
                identityPreviewEditButton: "text-accent",
                formFieldAction: "text-accent",
                alert: "bg-status-error-bg border-status-error/20 text-status-error",
              },
            }}
            routing="hash"
            signInUrl="/login"
            forceRedirectUrl="/"
          />
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-sm mt-8">
          Secure authentication powered by Clerk
        </p>
      </div>
    </div>
  );
}
