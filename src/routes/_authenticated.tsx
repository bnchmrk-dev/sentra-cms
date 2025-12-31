import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { ShieldX, LogOut, ShieldAlert, UserCheck } from "lucide-react";
import { Sidebar } from "../components/layout/Sidebar";
import { AuthProvider, useDbAuth } from "../providers/AuthProvider";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading state while Clerk initializes
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isSignedIn) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  return (
    <AuthProvider requireSuperadmin>
      <AuthenticatedContent />
    </AuthProvider>
  );
}

function AuthenticatedContent() {
  const { isLoading, error, roleError, dbUser } = useDbAuth();
  const { signOut } = useClerk();

  // Show loading state while checking DB user
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-text-muted">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show error state if domain is not authorized (user couldn't be created)
  if (error || !dbUser) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-status-error-bg mx-auto mb-6 flex items-center justify-center">
            <ShieldX className="w-10 h-10 text-status-error" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-3">
            Access Denied
          </h1>
          <p className="text-text-muted mb-6">
            {error || "Unable to verify your account. Please try again."}
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="mailto:support@sentra.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition-colors"
            >
              Contact Support
            </a>
            <button
              onClick={() => signOut({ redirectUrl: "/login" })}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-bg-elevated hover:bg-bg-hover text-text-secondary font-medium rounded-lg border border-border-default transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show role error - user exists but doesn't have superadmin access
  if (roleError) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-status-warning-bg mx-auto mb-6 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-status-warning" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-3">
            Insufficient Permissions
          </h1>
          
          {/* Show that their account was created */}
          <div className="mb-6 p-4 rounded-lg bg-status-live-bg border border-status-live/20">
            <div className="flex items-center justify-center gap-2 text-status-live mb-1">
              <UserCheck className="w-4 h-4" />
              <span className="font-medium">Account Created</span>
            </div>
            <p className="text-sm text-status-live/80">
              {dbUser.email}
            </p>
          </div>

          <p className="text-text-muted mb-6">
            {roleError}
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="mailto:support@sentra.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition-colors"
            >
              Request Admin Access
            </a>
            <button
              onClick={() => signOut({ redirectUrl: "/login" })}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-bg-elevated hover:bg-bg-hover text-text-secondary font-medium rounded-lg border border-border-default transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="pl-60 min-h-screen transition-all duration-300">
        {/* Top Bar */}
        <header className="h-16 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="h-full px-6 flex items-center justify-end">
            {/* Reserved for future use */}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
