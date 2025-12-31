import { useAuth } from "@clerk/clerk-react";
import { useMemo } from "react";
import { z } from "zod";
import { apiErrorSchema } from "../schemas";

const API_BASE_URL = import.meta.env.API_URL || "http://localhost:3001";

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

/**
 * Custom API error class with structured error data
 */
export class ApiError extends Error {
  code?: string;
  details?: Array<{ field: string; message: string }>;

  constructor(message: string, code?: string, details?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

/**
 * Create an API client with auth token and Zod validation
 */
function createApiClient(getToken: () => Promise<string | null>) {
  async function request<T>(
    endpoint: string,
    options: FetchOptions = {},
    schema?: z.ZodType<T>
  ): Promise<T> {
    const { body, headers: customHeaders, ...rest } = options;

    const token = await getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...rest,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({ error: "Failed to parse response" }));

    if (!response.ok) {
      // Try to parse as API error
      const parsed = apiErrorSchema.safeParse(data);
      if (parsed.success) {
        throw new ApiError(parsed.data.error, parsed.data.code, parsed.data.details);
      }
      throw new ApiError(data.error || `API Error: ${response.status}`);
    }

    // Validate response with Zod schema if provided
    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        console.error("API Response validation failed:", result.error.issues);
        // In development, you might want to throw; in production, just log
        if (import.meta.env.DEV) {
          console.warn("Response data:", data);
        }
      }
      return result.success ? result.data : data;
    }

    return data as T;
  }

  /**
   * Upload a file directly (streaming body)
   * This bypasses the standard JSON body handling for file uploads
   */
  async function uploadFile<T>(
    endpoint: string,
    file: File,
    schema?: z.ZodType<T>
  ): Promise<T> {
    const token = await getToken();

    const headers: HeadersInit = {
      "Content-Type": file.type || "application/octet-stream",
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: file,
    });

    const data = await response.json().catch(() => ({ error: "Failed to parse response" }));

    if (!response.ok) {
      const parsed = apiErrorSchema.safeParse(data);
      if (parsed.success) {
        throw new ApiError(parsed.data.error, parsed.data.code, parsed.data.details);
      }
      throw new ApiError(data.error || `API Error: ${response.status}`);
    }

    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        console.error("API Response validation failed:", result.error.issues);
        if (import.meta.env.DEV) {
          console.warn("Response data:", data);
        }
      }
      return result.success ? result.data : data;
    }

    return data as T;
  }

  /**
   * Upload a file with PUT method (for replacements)
   */
  async function putFile<T>(
    endpoint: string,
    file: File,
    schema?: z.ZodType<T>
  ): Promise<T> {
    const token = await getToken();

    const headers: HeadersInit = {
      "Content-Type": file.type || "application/octet-stream",
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: file,
    });

    const data = await response.json().catch(() => ({ error: "Failed to parse response" }));

    if (!response.ok) {
      const parsed = apiErrorSchema.safeParse(data);
      if (parsed.success) {
        throw new ApiError(parsed.data.error, parsed.data.code, parsed.data.details);
      }
      throw new ApiError(data.error || `API Error: ${response.status}`);
    }

    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        console.error("API Response validation failed:", result.error.issues);
        if (import.meta.env.DEV) {
          console.warn("Response data:", data);
        }
      }
      return result.success ? result.data : data;
    }

    return data as T;
  }

  return {
    get: <T>(endpoint: string, options?: FetchOptions, schema?: z.ZodType<T>) =>
      request<T>(endpoint, { ...options, method: "GET" }, schema),

    post: <T>(endpoint: string, body?: unknown, options?: FetchOptions, schema?: z.ZodType<T>) =>
      request<T>(endpoint, { ...options, method: "POST", body }, schema),

    put: <T>(endpoint: string, body?: unknown, options?: FetchOptions, schema?: z.ZodType<T>) =>
      request<T>(endpoint, { ...options, method: "PUT", body }, schema),

    patch: <T>(endpoint: string, body?: unknown, options?: FetchOptions, schema?: z.ZodType<T>) =>
      request<T>(endpoint, { ...options, method: "PATCH", body }, schema),

    delete: <T>(endpoint: string, options?: FetchOptions, schema?: z.ZodType<T>) =>
      request<T>(endpoint, { ...options, method: "DELETE" }, schema),

    uploadFile,
    putFile,
  };
}

/**
 * Hook to get an authenticated API client
 * Use this in components to make authenticated API calls
 *
 * @example
 * const api = useApi();
 *
 * // With TanStack Query and Zod validation
 * const { data } = useQuery({
 *   queryKey: ['users'],
 *   queryFn: () => api.get('/api/users', undefined, usersResponseSchema)
 * });
 */
export function useApi() {
  const { getToken } = useAuth();

  const api = useMemo(
    () => createApiClient(() => getToken()),
    [getToken]
  );

  return api;
}

// Export type for the API client
export type ApiClient = ReturnType<typeof createApiClient>;
