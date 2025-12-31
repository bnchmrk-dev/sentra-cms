import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useApi } from "../lib/api";
import type { User } from "../schemas";

interface AuthContextType {
  dbUser: User | null;
  isLoading: boolean;
  error: string | null;
  roleError: string | null; // Separate error for role-based access denial
  isSuperadmin: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  requireSuperadmin?: boolean;
}

export function AuthProvider({ children, requireSuperadmin = false }: AuthProviderProps) {
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const api = useApi();
  
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrRegisterUser() {
      if (!clerkLoaded || !isSignedIn || !clerkUser) {
        setIsLoading(false);
        return;
      }

      try {
        // First, try to get the existing user
        const meResponse = await api.get<{ user: User }>("/api/auth/me").catch(() => null);

        if (meResponse?.user) {
          setDbUser(meResponse.user);
          setError(null);
        } else {
          // User not found in our DB, try to register them
          // This happens for any user with a valid domain - we create them first,
          // then check roles separately
          const email = clerkUser.primaryEmailAddress?.emailAddress;
          if (!email) {
            setError("No email address found");
            return;
          }

          const registerResponse = await api.post<{ user: User; message: string }>(
            "/api/auth/register",
            {
              email,
              firstName: clerkUser.firstName,
              lastName: clerkUser.lastName,
            }
          );

          if (registerResponse.user) {
            setDbUser(registerResponse.user);
            setError(null);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load user";
        
        // Check if it's a domain not authorized error
        if (message.includes("not authorized") || message.includes("DOMAIN_NOT_AUTHORIZED")) {
          setError("Your email domain is not authorized. Please contact us for access.");
        } else {
          setError(message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadOrRegisterUser();
  }, [clerkLoaded, isSignedIn, clerkUser, api]);

  const isSuperadmin = dbUser?.role === "superadmin";
  const isAdmin = dbUser?.role === "admin" || isSuperadmin;

  // Check superadmin requirement - this is separate from registration errors
  const hasRequiredRole = !requireSuperadmin || isSuperadmin;
  const roleError = dbUser && !hasRequiredRole 
    ? "You need Super Admin access to use the CMS. Contact an administrator to upgrade your role."
    : null;

  return (
    <AuthContext.Provider
      value={{
        dbUser,
        isLoading,
        error,
        roleError,
        isSuperadmin,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useDbAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useDbAuth must be used within an AuthProvider");
  }
  return context;
}

