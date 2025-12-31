import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'

export const Route = createFileRoute('/check-access')({
  component: CheckAccessPage,
})

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function CheckAccessPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/check-domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.allowed) {
        setIsValid(true)
        // Store email for signup page
        sessionStorage.setItem('signupEmail', email)
        // Short delay to show success state
        setTimeout(() => {
          navigate({ to: '/signup' })
        }, 1000)
      } else {
        setError(
          data.message ||
            'This email domain is not authorized. Please contact us to get access.',
        )
      }
    } catch {
      setError('Unable to verify access. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2 tracking-tight">
            Labs<span className="text-accent">.</span>
          </h1>
          <p className="text-text-muted">Content Management System</p>
        </div>

        {/* Check Access Card */}
        <div className="bg-bg-surface border border-border-default shadow-lg rounded-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-accent-subtle mx-auto mb-4 flex items-center justify-center">
              <Mail className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Check Your Access
            </h2>
            <p className="text-text-muted text-sm">
              Enter your work email to verify your organization has access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-secondary mb-1.5"
              >
                Work Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                disabled={isLoading || isValid}
                className="
                  w-full bg-bg-input border border-border-default rounded-md px-4 py-3
                  text-text-primary placeholder:text-text-muted
                  focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-status-error-bg border border-status-error/20">
                <AlertCircle className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-status-error font-medium">
                    Access Denied
                  </p>
                  <p className="text-sm text-status-error/80 mt-1">{error}</p>
                  <a
                    href="mailto:support@sentra.com"
                    className="inline-block mt-2 text-sm text-accent hover:underline"
                  >
                    Contact us for access →
                  </a>
                </div>
              </div>
            )}

            {/* Success Message */}
            {isValid && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-status-live-bg border border-status-live/20">
                <CheckCircle2 className="w-5 h-5 text-status-live" />
                <div>
                  <p className="text-sm text-status-live font-medium">
                    Access Verified!
                  </p>
                  <p className="text-sm text-status-live/80">
                    Redirecting to sign up...
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isValid || !email}
              className="
                w-full flex items-center justify-center gap-2
                bg-accent hover:bg-accent-hover text-text-inverse
                font-semibold py-3 px-4 rounded-md
                transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking...
                </>
              ) : isValid ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Verified
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border-subtle text-center">
            <p className="text-sm text-text-muted">
              Already have an account?{' '}
              <a href="/login" className="text-accent hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-sm mt-8">
          Only authorized organizations can access this platform.
        </p>
      </div>
    </div>
  )
}
