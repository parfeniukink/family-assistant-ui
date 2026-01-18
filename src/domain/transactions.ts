// returns groups of transactions, sorted by datetime

import type { Transaction } from "../data/types";
import { formatDate } from "./datetime";

export function groupTransactionsByDate(
  items: Transaction[],
): Record<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();
  const years = new Set(
    items.map((item) => new Date(item.timestamp).getFullYear()),
  );
  // group annually if more than 1 year appears
  const includeYear = years.size > 1;

  for (const item of items) {
    const dateKey = formatDate(item.timestamp, includeYear);
    if (!grouped.has(dateKey)) grouped.set(dateKey, []);
    grouped.get(dateKey)!.push(item);
  }

  return Object.fromEntries(
    Array.from(grouped.entries()).sort(
      ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
    ),
  );
}

export function prettyMoney(value: number): string {
  if (value === null) throw new Error("no value provided");

  let formatted = value.toFixed(2);
  let [integerPart, decimalPart] = formatted.split(".");

  let formattedIntegetr = "";
  for (let i = 0; i < integerPart.length; i++) {
    if (i > 0 && (integerPart.length - i) % 3 === 0) {
      formattedIntegetr += " ";
    }
    formattedIntegetr += integerPart[i];
  }

  return `${formattedIntegetr}.${decimalPart}`;
}

export function operationSign(transaction: Transaction) {
  switch (transaction.operation) {
    case "cost":
      return "-";
    case "income":
      return "+";
    case "exchange":
      return "~";
    default:
      console.error(`Invalid operation ${transaction.operation}`);
  }
}
