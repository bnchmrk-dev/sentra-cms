import { useQuery } from "@tanstack/react-query";
import { useApi } from "../lib/api";
import { authMeResponseSchema, type AuthMeResponse } from "../schemas";

const AUTH_KEY = ["auth", "me"];

export function useCurrentUser() {
  const api = useApi();

  return useQuery({
    queryKey: AUTH_KEY,
    queryFn: () => api.get<AuthMeResponse>("/api/auth/me", undefined, authMeResponseSchema),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

