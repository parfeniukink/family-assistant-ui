import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type {
  User,
  ConfigurationPartialUpdateRequestBody,
} from "../data/types/identity";
import { getTokens as apiLogin } from "../data/api/auth";
import { fetchCurrentUser, configurationUpdate } from "../data/api/identity";
import {
  setTokens,
  clearTokens,
  logout,
  setAuthFailureCallback,
  loadPersistedRefreshToken,
  performTokenRefresh,
  getAccessToken,
} from "../data/api/authService";
import toast from "react-hot-toast";

type IdentityContextType = {
  user: User | null;
  isLoading: boolean;
  updateConfig: (
    requestBody: ConfigurationPartialUpdateRequestBody,
  ) => Promise<void>;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const IdentityContext = createContext<IdentityContextType | undefined>(
  undefined,
);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();

    // Set up callback for auth failures (token refresh fails)
    setAuthFailureCallback(() => {
      setUser(null);
      localStorage.removeItem("user");
    });
  }, []);

  async function initializeAuth(): Promise<void> {
    const storedRefreshToken = loadPersistedRefreshToken();

    // No refresh token means user needs to log in
    if (!storedRefreshToken) {
      localStorage.removeItem("user");
      setIsLoading(false);
      return;
    }

    // If we already have an access token in memory, skip refresh
    // (This happens when user just logged in and navigates to another route)
    const existingAccessToken = getAccessToken();
    if (existingAccessToken) {
      // Try to fetch user with existing token
      try {
        const response = await fetchCurrentUser();
        setUser(response.result);
        setIsLoading(false);
        return;
      } catch {
        // If fetch fails with existing token, fall through to refresh
      }
    }

    // Try to refresh tokens on app load
    const refreshed = await performTokenRefresh();

    if (!refreshed) {
      // Refresh failed - authService already cleared tokens
      localStorage.removeItem("user");
      setIsLoading(false);
      return;
    }

    // Tokens refreshed - now fetch current user
    try {
      const response = await fetchCurrentUser();
      setUser(response.result);
    } catch {
      // Failed to fetch user - use stored user as fallback
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // Invalid stored user - clear everything
          clearTokens();
          localStorage.removeItem("user");
        }
      }
    }

    setIsLoading(false);
  }

  // Persist user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  const updateConfig = useCallback(async (
    update: ConfigurationPartialUpdateRequestBody,
  ): Promise<void> => {
    const response = await configurationUpdate(update);
    setUser((prev) => {
      if (!prev) throw new Error("No user found.");
      return { ...prev, configuration: response.result.configuration };
    });
  }, []);

  const signIn = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      localStorage.clear();
      const loginResponse = await apiLogin({ username, password });
      const { accessToken, refreshToken } = loginResponse.result;
      setTokens(accessToken, refreshToken);
      const userResponse = await fetchCurrentUser();
      setUser(userResponse.result);
      toast.success("Signed in!");
      return true;
    } catch {
      setUser(null);
      clearTokens();
      return false;
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    await logout();
    setUser(null);
    localStorage.removeItem("user");
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, updateConfig, signIn, signOut }),
    [user, isLoading, updateConfig, signIn, signOut],
  );

  return (
    <IdentityContext.Provider value={value}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error("useIdentity must be used within UserProvider");
  return ctx;
}
