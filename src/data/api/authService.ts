import type { TokensResponse } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// In-memory token storage (NOT localStorage for access token)
type TokenState = {
  accessToken: string | null;
  refreshToken: string | null;
};

let tokenState: TokenState = {
  accessToken: null,
  refreshToken: null,
};

// Refresh timer reference
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

// Callback for when tokens are cleared (auth failure)
let onAuthFailure: (() => void) | null = null;

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Flag to indicate auth has permanently failed (user needs to re-login)
let authFailed = false;

export function setAuthFailureCallback(callback: () => void): void {
  onAuthFailure = callback;
}

export function getAccessToken(): string | null {
  return tokenState.accessToken;
}

export function getRefreshToken(): string | null {
  return tokenState.refreshToken;
}

export function setTokens(accessToken: string, refreshToken: string): void {
  tokenState = {
    accessToken,
    refreshToken,
  };

  // Reset auth failed flag on successful token set
  authFailed = false;

  // Persist refresh token only (access token stays in memory)
  localStorage.setItem("refreshToken", refreshToken);
}

export function clearTokens(): void {
  tokenState = {
    accessToken: null,
    refreshToken: null,
  };

  localStorage.removeItem("refreshToken");

  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  // Mark auth as failed to prevent further refresh attempts
  authFailed = true;
}

export function loadPersistedRefreshToken(): string | null {
  return localStorage.getItem("refreshToken");
}

export async function performTokenRefresh(): Promise<boolean> {
  // Don't attempt refresh if auth has already failed
  if (authFailed) {
    return false;
  }

  // Prevent multiple simultaneous refreshes
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const currentRefreshToken =
    tokenState.refreshToken ?? loadPersistedRefreshToken();

  if (!currentRefreshToken) {
    clearTokens();
    onAuthFailure?.();
    return false;
  }

  isRefreshing = true;
  refreshPromise = doRefresh(currentRefreshToken);

  const result = await refreshPromise;
  isRefreshing = false;
  refreshPromise = null;

  return result;
}

async function doRefresh(refreshToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/identity/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.status === 401 || response.status === 403) {
      // Refresh token invalid/expired - user needs to re-login
      clearTokens();
      onAuthFailure?.();
      return false;
    }

    if (!response.ok) {
      // Transient server error (5xx) - don't retry automatically
      // User can retry by refreshing the page
      return false;
    }

    const data = (await response.json()) as { result: TokensResponse };
    setTokens(data.result.accessToken, data.result.refreshToken);

    return true;
  } catch {
    // Network error - don't retry automatically
    // User can retry by refreshing the page
    return false;
  }
}

export async function logout(): Promise<void> {
  const refreshToken = tokenState.refreshToken ?? loadPersistedRefreshToken();

  if (refreshToken) {
    try {
      await fetch(`${BASE_URL}/identity/revoke-refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignore logout errors - clear local state regardless
    }
  }

  clearTokens();
}

// Clean up old auth format on module load
if (localStorage.getItem("token")) {
  localStorage.removeItem("token");
}
