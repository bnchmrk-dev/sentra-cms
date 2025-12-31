import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SignIn, useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate({ to: '/' })
    }
  }, [isLoaded, isSignedIn, navigate])

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center mt-[-200px]">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <img
            src="/Primary Logo Transparent Background.png"
            alt="Sentra"
            className="w-full mx-auto"
          />
          <p className="text-text-muted">Content Management System</p>
        </div>

        {/* Clerk SignIn Component */}
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-bg-surface border border-border-default shadow-lg rounded-xl',
                headerTitle: 'text-text-primary',
                headerSubtitle: 'text-text-muted',
                socialButtonsBlockButton:
                  'bg-bg-elevated border-border-default text-text-primary hover:bg-bg-hover',
                socialButtonsBlockButtonText: 'text-text-primary font-medium',
                dividerLine: 'bg-border-default',
                dividerText: 'text-text-muted',
                formFieldLabel: 'text-text-secondary',
                formFieldInput:
                  'bg-bg-input border-border-default text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-accent',
                formButtonPrimary:
                  'bg-accent hover:bg-accent-hover text-text-inverse font-semibold',
                footerActionLink: 'text-accent hover:text-accent-hover',
                identityPreviewEditButton: 'text-accent',
                formFieldAction: 'text-accent',
                alert:
                  'bg-status-error-bg border-status-error/20 text-status-error',
              },
            }}
            routing="hash"
            signUpUrl="/signup"
            forceRedirectUrl="/"
          />
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-sm mt-8">
          Secure authentication powered by Clerk
        </p>
      </div>
    </div>
  )
}
