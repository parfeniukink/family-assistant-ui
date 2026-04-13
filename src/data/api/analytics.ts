import type { ResponseMulti } from "src/infrastructure/generic";
import type {
  Equity,
  AnalyticsPeriod,
  TransactionsBasicAnalyticsResponse,
  AnalyticsFiltersQueryParams,
  AiAnalyticsResponse,
} from "../types";
import { apiCall } from "./client";

export async function equityList(): Promise<ResponseMulti<Equity>> {
  return await apiCall<ResponseMulti<Equity>>("/analytics/equity");
}

export async function fetchBasicAnalyticsByPeriod(
  period: AnalyticsPeriod,
): Promise<TransactionsBasicAnalyticsResponse> {
  return await apiCall<TransactionsBasicAnalyticsResponse>(
    `/analytics/transactions/basic?period=${period}`,
    "GET",
  );
}

export async function fetchBasicAnalyticsFiltered(
  filters: AnalyticsFiltersQueryParams,
): Promise<TransactionsBasicAnalyticsResponse> {
  let url = `/analytics/transactions/basic`;
  if (filters.startDate && filters.endDate) {
    url = `${url}?startDate=${filters.startDate}&endDate=${filters.endDate}`;
  }

  if (filters.pattern) {
    url = `${url}&pattern=${filters.pattern}`;
  }
  return await apiCall<TransactionsBasicAnalyticsResponse>(url, "GET");
}

export async function fetchAiAnalytics({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}): Promise<AiAnalyticsResponse> {
  const params: string[] = [];
  if (startDate != null) params.push(`startDate=${startDate}`);
  if (endDate != null) params.push(`endDate=${endDate}`);
  const qs = params.length > 0 ? `?${params.join("&")}` : "";
  return await apiCall<AiAnalyticsResponse>(`/analytics/ai${qs}`);
}
