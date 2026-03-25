import type { Currency } from "./currency";

export type CashBalance = {
  id: number;
  currency: Currency;
  balance: number;
  step: number;
};

export type CashCreateRequestBody = {
  currency_id: number;
  step: number;
};

export type CashUpdateRequestBody = {
  balance?: number;
  step?: number;
};
