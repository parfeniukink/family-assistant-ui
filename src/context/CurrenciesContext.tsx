import React, { createContext, useContext, useMemo } from "react";
import type { Currency } from "../data/types/currency";
import { useEquities } from "./EquityContext";

type CurrencyContextState = {
  currencies: Currency[];
};

const CurrencyContext = createContext<CurrencyContextState | undefined>(
  undefined,
);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { equities } = useEquities();

  // Derive currencies from equities
  const currencies = useMemo(() => {
    const unique: Record<number, Currency> = {};
    equities.forEach((eq) => {
      unique[eq.currency.id] = eq.currency;
    });
    return Object.values(unique);
  }, [equities]);

  return (
    <CurrencyContext.Provider value={{ currencies: currencies }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export function useCurrencies() {
  const ctx = useContext(CurrencyContext);
  if (!ctx)
    throw new Error("useCurrencies must be used within CurrencyProvider");
  return ctx;
}
