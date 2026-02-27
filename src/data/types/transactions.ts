import type { AnalyticsPeriod } from "./analytics";
import type { Currency } from "./currency";

export type OperationType = "cost" | "income" | "exchange";

export type Transaction = {
  id: number;
  operation: OperationType;
  name: string;
  icon: string;
  value: number;
  timestamp: string;
  currency: string;
  user: string;
};

// COST-related
export type CostCategory = {
  id: number;
  name: string;
};

export type CostCreateRequestBody = {
  name: string;
  value: number;
  timestamp: string;
  currencyId: number;
  categoryId: number;
};

export type CostPartialUpdateRequestBody = {
  name?: string;
  value?: number;
  timestamp?: string;
  currencyId?: number;
  categoryId?: number;
};

export type Cost = {
  id: number;
  name: string;
  value: number;
  timestamp: string;
  currency: Currency;
  category: CostCategory;
  user: string;
};

export type CostShortcutCreateRequestBody = {
  name: string;
  value: number | null;
  currencyId: number;
  categoryId: number;
};

export type CostShortcutUI = {
  positionIndex: number;
};

export type CostShortcut = {
  id: number;
  name: string;
  value: number | null;
  currency: Currency;
  category: CostCategory;
  ui: CostShortcutUI;
};

export type CostShortcutApplyRequestBody = {
  value: number | null;
  date_override?: string | null;
};

// INCOME-related
export type IncomeSource = "revenue" | "gift" | "debt" | "other";

export type IncomeCreateRequestBody = {
  name: string;
  value: number;
  source: IncomeSource;
  timestamp: string;
  currencyId: number;
};

export type IncomePartialUpdateRequestBody = {
  name?: string;
  value?: number;
  source?: IncomeSource;
  timestamp?: string;
  currencyId?: number;
};

export type Income = {
  id: number;
  name: string;
  value: number;
  source: IncomeSource;
  timestamp: string;
  currency: Currency;
  user: string;
};

// EXCHANGE-related types
export type ExchangeCreateRequestBody = {
  fromValue: number;
  toValue: number;
  fromCurrencyId: number;
  toCurrencyId: number;
  timestamp: string;
};

export type Exchange = {
  id: number;
  fromValue: number;
  toValue: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  timestamp: string;
  user: string;
};

// Transactions List Filters
export type Filters = {
  startDate?: string;
  endDate?: string;
  pattern?: string;
  period?: AnalyticsPeriod;
};
