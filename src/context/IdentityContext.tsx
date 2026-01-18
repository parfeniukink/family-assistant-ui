import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  User,
  ConfigurationPartialUpdateRequestBody,
} from "../data/types/user";
import { configurationUpdate, auth } from "../data/api/client";
import toast from "react-hot-toast";

type IdentityContextType = {
  user: User | null;
  updateConfig: (
    requestBody: ConfigurationPartialUpdateRequestBody,
  ) => Promise<void>;
  signIn: (token: string) => Promise<boolean>;
  signOut: () => void;
  token: string | null;
};

const IdentityContext = createContext<IdentityContextType | undefined>(
  undefined,
);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  // Load user and token from localStorage
  useEffect(() => {
    const persistentUser = localStorage.getItem("user");
    const persistentToken = localStorage.getItem("token");
    if (persistentUser && persistentToken) {
      try {
        setUser(JSON.parse(persistentUser));
        setToken(persistentToken);
      } catch {
        debugger;
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } else if (persistentToken) {
      signIn(persistentToken);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  async function updateConfig(update: ConfigurationPartialUpdateRequestBody) {
    if (!user) throw new Error("No user found.");
    const response = await configurationUpdate(update);
    setUser({
      ...user,
      configuration: response.result.configuration,
    });
  }

  async function signIn(tokenValue: string): Promise<boolean> {
    try {
      const response = await auth({ token: tokenValue });
      setUser(response.result.user);
      setToken(tokenValue);
      toast.success("Signed in!");
      return true;
    } catch {
      setUser(null);
      setToken(null);
      toast.error("Invalid token");
      return false;
    }
  }

  function signOut() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  return (
    <IdentityContext.Provider
      value={{
        user: user,
        updateConfig: updateConfig,
        signIn: signIn,
        signOut: signOut,
        token: token,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
};

export function useIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error("useIdentity must be used within UserProvider");
  return ctx;
}
