import type { Currency } from "./currency";

export type Equity = {
  currency: Currency;
  amount: number;
};

export type CostsByCategory = {
  id: number;
  name: string;
  total: number; // total money spent for the category
  ratio: number; // ``category total / all categories total``
};

export type CostsBasicAnalytics = {
  total: number;
  categories: CostsByCategory[];
};

export type IncomesBySource = {
  total: number;
  source: string;
};

export type IncomesBasicAnalytics = {
  total: number;
  sources: IncomesBySource[];
};

export type TransactionsBasicAnalytics = {
  currency: Currency;
  costs: CostsBasicAnalytics;
  incomes: IncomesBasicAnalytics;
  fromExchanges: number; // how much came from currency exchange
};

// Response wrapper with unified totalRatio (cross-currency, USD-converted)
export type TransactionsBasicAnalyticsResponse = {
  result: TransactionsBasicAnalytics[];
  totalRatio: number; // unified ratio across all currencies (converted to USD)
};

export type AnalyticsFiltersQueryParams = {
  startDate?: string | null;
  endDate?: string | null;
  pattern?: string | null;
};

export type AnalyticsPeriod = "current-month" | "previous-month" | string;
