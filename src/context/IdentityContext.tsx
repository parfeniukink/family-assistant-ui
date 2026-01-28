import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  User,
  ConfigurationPartialUpdateRequestBody,
} from "../data/types/identity";
import {
  configurationUpdate,
  getTokens as apiLogin,
  fetchCurrentUser,
} from "../data/api/client";
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

  async function updateConfig(
    update: ConfigurationPartialUpdateRequestBody,
  ): Promise<void> {
    if (!user) throw new Error("No user found.");
    const response = await configurationUpdate(update);
    setUser({
      ...user,
      configuration: response.result.configuration,
    });
  }

  async function signIn(username: string, password: string): Promise<boolean> {
    try {
      // Step 1: Login to get tokens
      const loginResponse = await apiLogin({ username, password });
      const { accessToken, refreshToken } = loginResponse.result;

      // Step 2: Store tokens
      setTokens(accessToken, refreshToken);

      // Step 3: Fetch user data
      const userResponse = await fetchCurrentUser();
      setUser(userResponse.result);

      toast.success("Signed in!");
      return true;
    } catch {
      setUser(null);
      clearTokens();
      // Error toast is shown by apiCall for specific errors
      return false;
    }
  }

  async function signOut(): Promise<void> {
    await logout();
    setUser(null);
    localStorage.removeItem("user");
  }

  return (
    <IdentityContext.Provider
      value={{
        user,
        isLoading,
        updateConfig,
        signIn,
        signOut,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error("useIdentity must be used within UserProvider");
  return ctx;
}
