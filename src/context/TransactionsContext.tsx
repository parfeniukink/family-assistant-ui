import React, { createContext, useContext, useState } from "react";
import type { Transaction } from "../data/types/transactions";
import { transactionsList } from "src/data/api/client";

type TransactionsContextState = {
  transactions: Transaction[];
  fetchTransactions: (params?: Record<string, any>) => Promise<void>;
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
  const [contextValue, setContextValue] = useState<number>(0);
  const [transactionsLeft, setTransactionsLeft] = useState<number>(0);
  const [lastFetchParams, setLastFetchParams] = useState<Record<string, any>>(
    {},
  );

  async function fetchTransactions(params?: Record<string, any>) {
    // Get last N transactions
    const defaults = { limit: 50 };
    const mergedParams = { ...defaults, ...(params || {}) };
    const response = await transactionsList(mergedParams);
    setTransactions(response.result);
    setContextValue(response.context); // new backend context value
    setTransactionsLeft(response.left);
    setLastFetchParams(mergedParams);
  }

  async function fetchNextTransactions() {
    if (transactionsLeft <= 0) return;

    const nextParams = { ...lastFetchParams, context: contextValue };
    const response = await transactionsList(nextParams);

    setTransactions((prev) => [...prev, ...response.result]);
    setContextValue(response.context);
    setTransactionsLeft(response.left);
  }

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        fetchTransactions,
        fetchNextTransactions,
        retrieveUrlFromTransaction,
        transactionsLeft,
      }}
    >
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
