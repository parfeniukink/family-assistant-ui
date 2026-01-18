import type {
  Currency,
  CostCategory,
  CostShortcut,
  Income,
  IncomeSource,
  Exchange,
  Transaction,
  OperationType,
  Cost,
  Equity,
} from "src/data/types";

// Currencies
export const currencies: Currency[] = [
  { id: 1, name: "Ukrainian Hryvnia", sign: "₴" }, // UAH
  { id: 2, name: "US Dollar", sign: "$" }, // USD
];

// Categories
export const categories: CostCategory[] = [
  { id: 1, name: "Food" },
  { id: 2, name: "Transport" },
  { id: 3, name: "Bills" },
  { id: 4, name: "Entertainment" },
  { id: 5, name: "Health" },
];

// Example users
const users = ["alice", "bob"];

// 20 Cost Shortcuts
export const costShortcuts: CostShortcut[] = Array.from(
  { length: 20 },
  (_, i) => ({
    id: i + 1,
    name: `Shortcut ${i + 1}`,
    value: Math.random() > 0.1 ? Math.floor(Math.random() * 1000) : null,
    currency: currencies[i % 2],
    category: categories[i % categories.length],
    ui: { positionIndex: i },
  }),
);

// 10 Incomes (last two months)
const sampleSources: IncomeSource[] = ["revenue", "gift", "debt", "other"];
export const incomes: Income[] = Array.from({ length: 10 }, (_, i) => {
  const now = new Date();
  now.setMonth(now.getMonth() - Math.floor(i / 5));
  now.setDate(now.getDate() - i);
  return {
    id: i + 1,
    name: `Income ${i + 1}`,
    value: Math.round(1000 + Math.random() * 5000),
    source: sampleSources[i % sampleSources.length],
    timestamp: now.toISOString(),
    currency: currencies[i % 2],
    user: users[i % users.length],
  };
});

// 200 Costs (spread over this and previous month)
export const costs: Cost[] = Array.from({ length: 200 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (i % 60));
  d.setMonth(d.getMonth() - Math.floor(i / 100));
  return {
    id: i + 1,
    name: `Cost ${i + 1}`,
    value: Math.round(10 + Math.random() * 395),
    timestamp: d.toISOString(),
    currency: currencies[i % 2],
    category: categories[i % categories.length],
    user: users[i % users.length],
  };
});

// Example Equities
export const equities: Equity[] = [
  { currency: currencies[0], amount: 50000 },
  { currency: currencies[1], amount: 3000 },
];

// Example Transactions
export const transactions: Transaction[] = Array.from(
  { length: 8 },
  (_, i) => ({
    id: i + 1,
    operation: (["cost", "income", "exchange"] as OperationType[])[i % 3],
    name: `Operation #${i + 1}`,
    icon: "💸",
    value: Math.round(100 + Math.random() * 400),
    timestamp: new Date(Date.now() - 86400000 * i).toISOString(),
    currency: currencies[i % 2].name,
    user: users[i % users.length],
  }),
);

// Example Exchange
export const exchanges: Exchange[] = [
  {
    id: 1,
    fromValue: 1000,
    toValue: 27,
    fromCurrency: currencies[0],
    toCurrency: currencies[1],
    timestamp: new Date().toISOString(),
    user: "alice",
  },
  {
    id: 2,
    fromValue: 20,
    toValue: 740,
    fromCurrency: currencies[1],
    toCurrency: currencies[0],
    timestamp: new Date(Date.now() - 86400000 * 10).toISOString(),
    user: "bob",
  },
];
