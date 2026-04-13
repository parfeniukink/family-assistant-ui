import toast from "react-hot-toast";
import type {
  ErrorResult,
  ErrorResponse,
} from "src/infrastructure/generic";
import {
  getAccessToken,
  performTokenRefresh,
  clearTokens,
} from "./authService";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// In-memory cache for GET requests
const cache = new Map<string, { data: unknown; timestamp: number }>();

// In-flight GET request deduplication
const inFlight = new Map<string, Promise<unknown>>();

// Per-endpoint TTL configuration (first matching prefix wins)
const CACHE_TTL_CONFIG: ReadonlyArray<{ prefix: string; ttl: number }> = [
  // Rarely changing reference data: 10 minutes
  { prefix: "/transactions/costs/categories", ttl: 600_000 },
  { prefix: "/jobs/actions", ttl: 600_000 },
  // Moderately changing data: 5 minutes
  { prefix: "/identity/users", ttl: 300_000 },
  { prefix: "/transactions/costs/shortcuts", ttl: 300_000 },
  { prefix: "/news", ttl: 300_000 },
  { prefix: "/jobs", ttl: 300_000 },
  // Frequently changing data: 30 seconds
  { prefix: "/transactions", ttl: 30_000 },
  { prefix: "/analytics", ttl: 30_000 },
  { prefix: "/cash", ttl: 30_000 },
  { prefix: "/assets", ttl: 30_000 },
  { prefix: "/notifications", ttl: 30_000 },
];

const DEFAULT_CACHE_TTL = 60_000;

function getTtlForUrl(url: string): number {
  const path = url.split("?")[0];
  for (const entry of CACHE_TTL_CONFIG) {
    if (path.startsWith(entry.prefix)) {
      return entry.ttl;
    }
  }
  return DEFAULT_CACHE_TTL;
}

// Mutation-triggered cross-domain cache invalidation
const CROSS_INVALIDATION: Record<string, readonly string[]> = {
  "/transactions": ["/analytics/equity", "/analytics/transactions"],
  "/cash": ["/analytics/equity"],
  "/assets": ["/analytics/equity"],
};

function invalidateByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key === prefix || key.startsWith(prefix + "?") || key.startsWith(prefix + "/")) {
      cache.delete(key);
    }
  }
}

function invalidateCrossDomain(mutationUrl: string): void {
  const pathWithoutQuery = mutationUrl.split("?")[0];
  for (const [trigger, targets] of Object.entries(CROSS_INVALIDATION)) {
    if (pathWithoutQuery.startsWith(trigger)) {
      for (const target of targets) {
        invalidateByPrefix(target);
      }
      break;
    }
  }
}

/** Invalidate all cached entries whose URL starts with any of the given prefixes. */
export function invalidateCache(...prefixes: string[]): void {
  for (const prefix of prefixes) {
    invalidateByPrefix(prefix);
  }
}

// Flag to prevent redirect loops
let isRedirecting = false;

function redirectToLogin(): void {
  if (isRedirecting) return;
  isRedirecting = true;

  // Clear cache and tokens on auth failure
  cache.clear();
  clearTokens();

  // Use window.location for hard redirect to ensure clean state
  window.location.href = "/auth";
}

export function apiCall<T>(
  url: string,
  method: string = "GET",
  body?: Record<string, unknown>,
  skipAuth: boolean = false,
): Promise<T> {
  // Check cache and deduplicate in-flight GET requests
  if (method === "GET") {
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < getTtlForUrl(url)) {
      return Promise.resolve(cached.data as T);
    }

    const existing = inFlight.get(url);
    if (existing) {
      return existing as Promise<T>;
    }

    // Register this request as in-flight and clean up when done
    const request = executeApiCall<T>(url, method, body, skipAuth).finally(() => {
      inFlight.delete(url);
    });
    inFlight.set(url, request);
    return request;
  }

  return executeApiCall<T>(url, method, body, skipAuth);
}

async function executeApiCall<T>(
  url: string,
  method: string,
  body?: Record<string, unknown>,
  skipAuth: boolean = false,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Get token from authService (in-memory)
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const fullUrl = `${BASE_URL}${url}`;

  const response = await fetch(fullUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle 401
  if (response.status === 401) {
    // For auth endpoints (skipAuth=true), just throw without refresh attempt
    if (skipAuth) {
      const jsonError = (await response.json()) as ErrorResult;
      toast.error(jsonError.message || "Invalid credentials");
      throw new Error("Authentication Error");
    }

    // For other endpoints, try refresh and retry
    const refreshed = await performTokenRefresh();

    if (refreshed) {
      // Retry the original request with new token
      const newToken = getAccessToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
      }

      const retryResponse = await fetch(fullUrl, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (retryResponse.ok || retryResponse.status === 204) {
        if (retryResponse.status === 204) return null as T;
        const jsonResponse = (await retryResponse.json()) as T;
        if (method === "GET") {
          cache.set(url, { data: jsonResponse, timestamp: Date.now() });
        }
        return jsonResponse;
      }

      // If retry also fails with 401, redirect to login
      if (retryResponse.status === 401) {
        redirectToLogin();
        throw new Error("Authentication Error");
      }

      // Handle other errors from retry
      return handleErrorResponse<T>(retryResponse);
    } else {
      // Refresh failed - redirect to login
      redirectToLogin();
      throw new Error("Authentication Error");
    }
  }

  // Handle 403 - no retry, forbidden
  if (response.status === 403) {
    const jsonError = (await response.json()) as ErrorResult;
    toast.error(jsonError.message || "Access forbidden");
    throw new Error("Authorization Error");
  }

  // Handle 429 Rate Limit
  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
    toast.error(`Too many requests. Please wait ${waitSeconds} seconds.`);
    throw new Error("Rate Limited");
  }

  // Handle Validation Errors
  if ([400, 422].includes(response.status)) {
    const rawError = await response.json();
    if (rawError.result) {
      for (const error of (rawError as ErrorResponse).result) {
        toast.error(error.message);
      }
    } else if (rawError.message) {
      toast.error(rawError.message);
    }
    throw new Error("Client Error");
  }

  // Handle Server Errors
  if (response.status === 500) {
    try {
      const rawResponse = await response.json();

      if (rawResponse["message"]) {
        const jsonError = rawResponse as ErrorResult;
        toast.error(jsonError.message);
      }
      if (rawResponse["result"]) {
        const jsonError = rawResponse as ErrorResponse;
        for (const error of jsonError.result) {
          toast.error(error.message);
        }
      }
    } catch {
      toast.error("Error parsing API Response");
    }
    throw new Error("Server Error");
  }

  // Invalidate GET cache after successful mutations (prefix-based + cross-domain)
  if (method !== "GET") {
    const pathWithoutQuery = url.split("?")[0];
    invalidateByPrefix(pathWithoutQuery);
    const segments = pathWithoutQuery.replace(/^\//, "").split("/");
    if (segments.length > 1) {
      const parentPath = "/" + segments.slice(0, -1).join("/");
      invalidateByPrefix(parentPath);
    }
    invalidateCrossDomain(url);
  }

  // Success Cases
  if (response.status === 204) return null as T;

  const jsonResponse = (await response.json()) as T;

  // Cache GET requests
  if (method === "GET") {
    cache.set(url, { data: jsonResponse, timestamp: Date.now() });
  }

  return jsonResponse;
}

async function handleErrorResponse<T>(
  response: globalThis.Response,
): Promise<T> {
  if (response.status === 403) {
    const jsonError = (await response.json()) as ErrorResult;
    toast.error(jsonError.message || "Access forbidden");
    throw new Error("Authorization Error");
  }

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
    toast.error(`Too many requests. Please wait ${waitSeconds} seconds.`);
    throw new Error("Rate Limited");
  }

  if ([400, 422].includes(response.status)) {
    const rawError = await response.json();
    if (rawError.result) {
      for (const error of (rawError as ErrorResponse).result) {
        toast.error(error.message);
      }
    } else if (rawError.message) {
      toast.error(rawError.message);
    }
    throw new Error("Client Error");
  }

  if (response.status === 500) {
    try {
      const rawResponse = await response.json();
      if (rawResponse["message"]) {
        toast.error((rawResponse as ErrorResult).message);
      }
      if (rawResponse["result"]) {
        for (const error of (rawResponse as ErrorResponse).result) {
          toast.error(error.message);
        }
      }
    } catch {
      toast.error("Error parsing API Response");
    }
    throw new Error("Server Error");
  }

  throw new Error("Unknown Error");
}
