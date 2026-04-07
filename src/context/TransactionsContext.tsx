import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from "react";
import type { Transaction } from "../data/types/transactions";
import { transactionsList } from "src/data/api/client";

type TransactionsContextState = {
  transactions: Transaction[];
  fetchTransactions: (params?: Record<string, unknown>) => Promise<void>;
  fetchNextTransactions: () => Promise<void>;
  retrieveUrlFromTransaction: (transaction: Transaction) => string;
  transactionsLeft: number;
};

const TransactionsContext = createContext<TransactionsContextState | undefined>(
  undefined,
);

function retrieveUrlFromTransaction(transaction: Transaction): string {
  switch (transaction.operation) {
    case "cost":
      return `/finances/transactions/costs/${transaction.id}`;
    case "income":
      return `/finances/transactions/incomes/${transaction.id}`;
    case "exchange":
      return `/finances/transactions/exchange/${transaction.id}`;
    default:
      throw new Error(`Can't get URL from ${transaction}`);
  }
}

export function TransactionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLeft, setTransactionsLeft] = useState<number>(0);
  const contextRef = useRef<number>(0);
  const lastFetchParamsRef = useRef<Record<string, unknown>>({});

  const fetchTransactions = useCallback(async (params?: Record<string, unknown>) => {
    const defaults = { limit: 50 };
    const mergedParams = { ...defaults, ...(params || {}) };
    const response = await transactionsList(mergedParams);
    setTransactions(response.result);
    contextRef.current = response.context;
    setTransactionsLeft(response.left);
    lastFetchParamsRef.current = mergedParams;
  }, []);

  const fetchNextTransactions = useCallback(async () => {
    if (transactionsLeft <= 0) return;

    const nextParams = { ...lastFetchParamsRef.current, context: contextRef.current };
    const response = await transactionsList(nextParams);

    setTransactions((prev) => [...prev, ...response.result]);
    contextRef.current = response.context;
    setTransactionsLeft(response.left);
  }, [transactionsLeft]);

  const value = useMemo(
    () => ({
      transactions,
      fetchTransactions,
      fetchNextTransactions,
      retrieveUrlFromTransaction,
      transactionsLeft,
    }),
    [transactions, fetchTransactions, fetchNextTransactions, transactionsLeft],
  );

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx)
    throw new Error("useTransactions must be used within TransactionsProvider");
  return ctx;
}
