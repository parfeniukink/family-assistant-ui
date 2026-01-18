import React, { createContext, useContext, useState, useEffect } from "react";
import { equityList } from "../data/api/client";
import type { Equity } from "../data/types";

type EquityContextType = {
  equities: Equity[];
  refreshEquity: () => Promise<void>;
};

const EquityContext = createContext<EquityContextType | undefined>(undefined);

export const EquityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [equities, setEquities] = useState<Equity[]>([]);

  const fetchEquities = async () => {
    const response = await equityList();
    setEquities(response.result);
  };

  useEffect(() => {
    fetchEquities();
  }, []);

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
};

export function useEquities() {
  const ctx = useContext(EquityContext);
  if (!ctx) throw new Error("useEquities must be used within EquityProvider");
  return ctx;
}
