import React, { createContext, useContext, useState, useEffect } from "react";
import { equityList } from "../data/api/client";
import type { Equity } from "../data/types";
import { useIdentity } from "./IdentityContext";

type EquityContextType = {
  equities: Equity[];
  refreshEquity: () => Promise<void>;
};

const EquityContext = createContext<EquityContextType | undefined>(undefined);

export function EquityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useIdentity();
  const [equities, setEquities] = useState<Equity[]>([]);

  const fetchEquities = async () => {
    if (!user) return;
    const response = await equityList();
    setEquities(response.result);
  };

  useEffect(() => {
    if (user) {
      fetchEquities();
    }
  }, [user]);

  return (
    <EquityContext.Provider
      value={{
        equities: equities,
        refreshEquity: fetchEquities,
      }}
    >
      {children}
    </EquityContext.Provider>
  );
}

export function useEquities() {
  const ctx = useContext(EquityContext);
  if (!ctx) throw new Error("useEquities must be used within EquityProvider");
  return ctx;
}
