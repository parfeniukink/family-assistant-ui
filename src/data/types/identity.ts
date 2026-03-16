import type { Currency } from "./currency";
import type { CostCategory } from "./transactions";

export type Configuration = {
  showEquity: boolean;
  defaultCurrency: Currency | null;
  defaultCostCategory: CostCategory | null;
  costSnippets: string[];
  incomeSnippets: string[];
  notifyCostThreshold: number | null;
  monobankIntegration: boolean;
  newsFilterPrompt: string | null;
  newsPreferenceProfile: string | null;
  gcRetentionDays: number;
  analyzePreferences: boolean;
};

export type ConfigurationPartialUpdateRequestBody = {
  showEquity?: boolean;
  defaultCurrencyId?: number | null;
  defaultCostCategoryId?: number | null;
  costSnippets?: string[];
  incomeSnippets?: string[];
  notifyCostThreshold?: number | null;
  monobankApiKey?: string | null;
  newsFilterPrompt?: string | null;
  newsPreferenceProfile?: string | null;
  gcRetentionDays?: number;
  analyzePreferences?: boolean;
};

export type User = {
  id: number;
  name: string;
  configuration: Configuration;
};

export type TokensRequestBody = {
  username: string;
  password: string;
};

export type TokensResponse = {
  accessToken: string;
  refreshToken: string;
};
