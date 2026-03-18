import toast from "react-hot-toast";
import type {
  Response,
  PaginatedResponse,
  ResponseMulti,
  ErrorResult,
  ErrorResponse,
} from "src/infrastructure/generic";
import type {
  Notification,
  CostCategory,
  CostCreateRequestBody,
  CostShortcutCreateRequestBody,
  Cost,
  Transaction,
  CostShortcut,
  IncomeCreateRequestBody,
  Income,
  ExchangeCreateRequestBody,
  Exchange,
  Equity,
  CostShortcutApplyRequestBody,
  CostPartialUpdateRequestBody,
  IncomePartialUpdateRequestBody,
  OperationType,
  AnalyticsPeriod,
  TransactionsBasicAnalyticsResponse,
  AnalyticsFiltersQueryParams,
  ConfigurationPartialUpdateRequestBody,
  User,
  TokensRequestBody,
  TokensResponse,
  NewsItem,
  NewsItemDetail,
  NewsGroup,
  NewsGroupItem,
  NewsGroupsResponse,
  JobTypeAction,
  Job,
  JobCreateRequestBody,
  JobUpdateRequestBody,
  AiAnalyticsResponse,
} from "../types";
import {
  getAccessToken,
  performTokenRefresh,
  clearTokens,
} from "./authService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// In-memory cache for GET requests
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds

// Flag to prevent redirect loops
let isRedirecting = false;

function redirectToLogin(): void {
  if (isRedirecting) return;
  isRedirecting = true;

  // Clear cache and tokens on auth failure
  cache.clear();
  clearTokens();

  // Use window.location for hard redirect to ensure clean state
  window.location.href = "/auth";
}

export async function apiCall<T>(
  url: string,
  method: string = "GET",
  body?: Record<string, unknown>,
  skipAuth: boolean = false,
): Promise<T> {
  // Check cache for GET requests
  if (method === "GET") {
    const cacheKey = url;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Get token from authService (in-memory)
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const fullUrl = `${BASE_URL}${url}`;

  const response = await fetch(fullUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle 401
  if (response.status === 401) {
    // For auth endpoints (skipAuth=true), just throw without refresh attempt
    if (skipAuth) {
      const jsonError = (await response.json()) as ErrorResult;
      toast.error(jsonError.message || "Invalid credentials");
      throw new Error("Authentication Error");
    }

    // For other endpoints, try refresh and retry
    const refreshed = await performTokenRefresh();

    if (refreshed) {
      // Retry the original request with new token
      const newToken = getAccessToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
      }

      const retryResponse = await fetch(fullUrl, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (retryResponse.ok || retryResponse.status === 204) {
        if (retryResponse.status === 204) return null as T;
        const jsonResponse = (await retryResponse.json()) as T;
        if (method === "GET") {
          cache.set(url, { data: jsonResponse, timestamp: Date.now() });
        }
        return jsonResponse;
      }

      // If retry also fails with 401, redirect to login
      if (retryResponse.status === 401) {
        redirectToLogin();
        throw new Error("Authentication Error");
      }

      // Handle other errors from retry
      return handleErrorResponse<T>(retryResponse);
    } else {
      // Refresh failed - redirect to login
      redirectToLogin();
      throw new Error("Authentication Error");
    }
  }

  // Handle 403 - no retry, forbidden
  if (response.status === 403) {
    const jsonError = (await response.json()) as ErrorResult;
    toast.error(jsonError.message || "Access forbidden");
    throw new Error("Authorization Error");
  }

  // Handle 429 Rate Limit
  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
    toast.error(`Too many requests. Please wait ${waitSeconds} seconds.`);
    throw new Error("Rate Limited");
  }

  // Handle Validation Errors
  if ([400, 422].includes(response.status)) {
    const jsonError = (await response.json()) as ErrorResponse;
    for (const error of jsonError.result) {
      toast.error(error.message);
    }
    throw new Error("Client Error");
  }

  // Handle Server Errors
  if (response.status === 500) {
    try {
      const rawResponse = await response.json();

      if (rawResponse["message"]) {
        const jsonError = rawResponse as ErrorResult;
        toast.error(jsonError.message);
      }
      if (rawResponse["result"]) {
        const jsonError = rawResponse as ErrorResponse;
        for (const error of jsonError.result) {
          toast.error(error.message);
        }
      }
    } catch {
      toast.error("Error parsing API Response");
    }
    throw new Error("Server Error");
  }

  // Invalidate GET cache after successful mutations
  if (method !== "GET") {
    const basePath = "/" + url.replace(/^\//, "").split("/")[0];
    cache.delete(url);
    if (basePath !== url) cache.delete(basePath);
  }

  // Success Cases
  if (response.status === 204) return null as T;

  const jsonResponse = (await response.json()) as T;

  // Cache GET requests
  if (method === "GET") {
    cache.set(url, { data: jsonResponse, timestamp: Date.now() });
  }

  return jsonResponse;
}

async function handleErrorResponse<T>(
  response: globalThis.Response,
): Promise<T> {
  if (response.status === 403) {
    const jsonError = (await response.json()) as ErrorResult;
    toast.error(jsonError.message || "Access forbidden");
    throw new Error("Authorization Error");
  }

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
    toast.error(`Too many requests. Please wait ${waitSeconds} seconds.`);
    throw new Error("Rate Limited");
  }

  if ([400, 422].includes(response.status)) {
    const jsonError = (await response.json()) as ErrorResponse;
    for (const error of jsonError.result) {
      toast.error(error.message);
    }
    throw new Error("Client Error");
  }

  if (response.status === 500) {
    try {
      const rawResponse = await response.json();
      if (rawResponse["message"]) {
        toast.error((rawResponse as ErrorResult).message);
      }
      if (rawResponse["result"]) {
        for (const error of (rawResponse as ErrorResponse).result) {
          toast.error(error.message);
        }
      }
    } catch {
      toast.error("Error parsing API Response");
    }
    throw new Error("Server Error");
  }

  throw new Error("Unknown Error");
}

// ─────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────
export async function getTokens(
  requestBody: TokensRequestBody,
): Promise<Response<TokensResponse>> {
  return await apiCall<Response<TokensResponse>>(
    "/identity/tokens",
    "POST",
    requestBody,
    true, // skipAuth - login doesn't need auth header
  );
}

// ─────────────────────────────────────────────────────────
// IDENTITY
// ─────────────────────────────────────────────────────────
export async function fetchCurrentUser(): Promise<Response<User>> {
  return await apiCall<Response<User>>("/identity/users");
}

// ─────────────────────────────────────────────────────────
// TRANSACTIONS
// ─────────────────────────────────────────────────────────
export async function transactionsList({
  onlyMine = false,
  operation = null,
  currencyId = null,
  costCategoryId = null,
  period = null,
  pattern = null,
  startDate = null,
  endDate = null,
  context = 0,
  limit = 15,
}: {
  onlyMine?: boolean;
  currencyId?: number | null;
  costCategoryId?: number | null;
  period?: AnalyticsPeriod | null;
  pattern?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  operation?: OperationType | null;
  context?: number;
  limit?: number;
}): Promise<PaginatedResponse<Transaction>> {
  let urlParticles: string[] = [
    `/transactions?context=${context}&limit=${limit}`,
  ];

  if (onlyMine === true) urlParticles.push(`&onlyMine=${onlyMine}`);
  if (operation != null) urlParticles.push(`&operation=${operation}`);
  if (currencyId != null) urlParticles.push(`&currencyId=${currencyId}`);
  if (costCategoryId != null)
    urlParticles.push(`&costCategoryId=${costCategoryId}`);
  if (period != null) urlParticles.push(`&period=${period}`);
  if (startDate != null) urlParticles.push(`&startDate=${startDate}`);
  if (endDate != null) urlParticles.push(`&endDate=${endDate}`);
  if (pattern != null) urlParticles.push(`&pattern=${pattern}`);

  const url = urlParticles.join("");

  const results: PaginatedResponse<Transaction> =
    await apiCall<PaginatedResponse<Transaction>>(url);

  const newContext = context + results.result.length;

  return {
    context: newContext,
    left: results.left,
    result: results.result,
  };
}

// COSTS
export async function costCategoriesList(): Promise<
  ResponseMulti<CostCategory>
> {
  return await apiCall<ResponseMulti<CostCategory>>(
    "/transactions/costs/categories",
  );
}

export async function costCreate(
  requestBody: CostCreateRequestBody,
): Promise<Response<Cost>> {
  return await apiCall<Response<Cost>>(
    "/transactions/costs",
    "POST",
    requestBody,
  );
}

export async function costRetrieve(costId: number): Promise<Response<Cost>> {
  return await apiCall<Response<Cost>>(`/transactions/costs/${costId}`);
}

export async function costUpdate(
  costId: number,
  requestBody: CostPartialUpdateRequestBody,
): Promise<Response<Cost>> {
  return await apiCall<Response<Cost>>(
    `/transactions/costs/${costId}`,
    "PATCH",
    requestBody,
  );
}

export async function costDelete(costId: number): Promise<void> {
  await apiCall<void>(`/transactions/costs/${costId}`, "DELETE");
}

// COST SHORTCUTS
export async function costShortcutCreate(
  requestBody: CostShortcutCreateRequestBody,
): Promise<Response<CostShortcut>> {
  return await apiCall<Response<CostShortcut>>(
    "/transactions/costs/shortcuts",
    "POST",
    requestBody,
  );
}

export async function costShortcutsList(): Promise<
  ResponseMulti<CostShortcut>
> {
  return await apiCall<ResponseMulti<CostShortcut>>(
    "/transactions/costs/shortcuts",
  );
}

export async function updateCostShortcutsOrder(
  reorderedItems: CostShortcut[],
): Promise<void> {
  const requestBody: Record<string, any> = reorderedItems.map((item) => ({
    id: item.id,
    uiPositionIndex: item.ui.positionIndex,
  }));

  await apiCall<void>(
    `/transactions/costs/shortcuts/positions`,
    "PUT",
    requestBody,
  );
}

export async function costShortcutDelete(
  costShortcutId: number,
): Promise<void> {
  await apiCall(
    `/transactions/costs/shortcuts/${String(costShortcutId)}`,
    "DELETE",
  );
}

export async function costShortcutApply(
  shortcutId: number,
  requestBody?: CostShortcutApplyRequestBody,
): Promise<Response<Cost>> {
  return await apiCall<Response<Cost>>(
    `/transactions/costs/shortcuts/${shortcutId}`,
    "POST",
    requestBody ?? undefined,
  );
}

// INCOMES
export async function incomeCreate(
  requestBody: IncomeCreateRequestBody,
): Promise<Response<Income>> {
  return await apiCall<Response<Income>>(
    `/transactions/incomes`,
    "POST",
    requestBody,
  );
}

export async function incomeRetrieve(
  incomeId: number,
): Promise<Response<Income>> {
  return await apiCall<Response<Income>>(`/transactions/incomes/${incomeId}`);
}

export async function incomeUpdate(
  incomeId: number,
  requestBody: IncomePartialUpdateRequestBody,
) {
  return await apiCall<Response<Income>>(
    `/transactions/incomes/${incomeId}`,
    "PATCH",
    requestBody,
  );
}

export async function incomeDelete(incomeId: number): Promise<void> {
  await apiCall(`/transactions/incomes/${incomeId}`, "DELETE");
}

// CURRENCY EXCHANGE
export async function exchangeCreate(
  requestBody: ExchangeCreateRequestBody,
): Promise<Response<Exchange>> {
  return await apiCall<Response<Exchange>>(
    `/transactions/exchange`,
    "POST",
    requestBody,
  );
}

export async function exchangeRetrieve(
  exchangeId: number,
): Promise<Response<Exchange>> {
  return await apiCall<Response<Exchange>>(
    `/transactions/exchange/${exchangeId}`,
  );
}

export async function exchangeDelete(exchangeId: number): Promise<void> {
  await apiCall(`/transactions/exchange/${exchangeId}`, "DELETE");
}

// ─────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────
export async function notificationsList(): Promise<Notification[]> {
  const response = await apiCall<ResponseMulti<Notification>>("/notifications");
  return response.result;
}

export async function notificationsCount(): Promise<number> {
  const response = await apiCall<Response<number>>("/notifications/count");
  return response.result;
}

export function invalidateNotificationsCache(): void {
  cache.delete("/notifications");
  cache.delete("/notifications/count");
}

// ─────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────
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

export async function configurationUpdate(
  requestBody: ConfigurationPartialUpdateRequestBody,
): Promise<Response<User>> {
  return await apiCall<Response<User>>(
    `/identity/users/configuration`,
    "PATCH",
    requestBody,
  );
}

// ─────────────────────────────────────────────────────────
// NEWS
// ─────────────────────────────────────────────────────────
export async function newsList({
  context = 0,
  limit = 10,
}: {
  context?: number;
  limit?: number;
}): Promise<PaginatedResponse<NewsItem>> {
  return await apiCall<PaginatedResponse<NewsItem>>(
    `/news?context=${context}&limit=${limit}`,
  );
}

export async function newsGroupsList({
  startDate,
  endDate,
  bookmarked,
  reaction,
  commented,
}: {
  startDate?: string;
  endDate?: string;
  bookmarked?: boolean;
  reaction?: string;
  commented?: boolean;
}): Promise<NewsGroupsResponse> {
  const params: string[] = [];
  if (startDate != null) params.push(`startDate=${startDate}`);
  if (endDate != null) params.push(`endDate=${endDate}`);
  if (bookmarked != null) params.push(`bookmarked=${bookmarked}`);
  if (reaction != null) params.push(`reaction=${encodeURIComponent(reaction)}`);
  if (commented != null) params.push(`commented=${commented}`);
  const qs = params.length > 0 ? `?${params.join("&")}` : "";
  return await apiCall<NewsGroupsResponse>(`/news/groups${qs}`);
}

export async function newsReactionOptions(): Promise<ResponseMulti<string>> {
  return await apiCall<ResponseMulti<string>>("/news/reactions");
}

export async function newsItemGet(itemId: number): Promise<NewsItemDetail> {
  return await apiCall<NewsItemDetail>(`/news/${itemId}`);
}

export async function newsItemDelete(itemId: number): Promise<void> {
  await apiCall<void>(`/news/${itemId}`, "DELETE");
}

export async function newsItemBookmark(
  itemId: number,
): Promise<NewsGroupItem> {
  return await apiCall<NewsGroupItem>(
    `/news/${itemId}/bookmark`,
    "POST",
  );
}

export async function newsItemReact(
  itemId: number,
  reaction: string | null,
): Promise<NewsGroupItem> {
  return await apiCall<NewsGroupItem>(
    `/news/${itemId}/react`,
    "POST",
    { reaction },
  );
}

export async function newsItemFeedback(
  itemId: number,
  humanFeedback: string | null,
): Promise<NewsItemDetail> {
  return await apiCall<NewsItemDetail>(
    `/news/${itemId}/feedback`,
    "PATCH",
    { humanFeedback },
  );
}

export async function newsItemExtend(
  itemId: number,
  mode: "microscope" | "telescope",
): Promise<void> {
  await apiCall<void>(
    `/news/${itemId}/extend/${mode}`,
    "POST",
  );
}

export async function addManualArticle(url: string): Promise<void> {
  await apiCall<void>("/news/manual", "POST", { url });
}

// ─────────────────────────────────────────────────────────
// JOBS
// ─────────────────────────────────────────────────────────
export async function jobActionsList(): Promise<ResponseMulti<JobTypeAction>> {
  return await apiCall<ResponseMulti<JobTypeAction>>("/jobs/actions");
}

export async function jobsList(): Promise<ResponseMulti<Job>> {
  return await apiCall<ResponseMulti<Job>>("/jobs");
}

export async function jobCreate(
  requestBody: JobCreateRequestBody,
): Promise<void> {
  await apiCall<void>("/jobs", "POST", requestBody);
}

export async function jobUpdate(
  jobId: number,
  requestBody: JobUpdateRequestBody,
): Promise<void> {
  await apiCall<void>(`/jobs/${jobId}`, "PATCH", requestBody);
}

export async function jobDelete(jobId: number): Promise<void> {
  await apiCall<void>(`/jobs/${jobId}`, "DELETE");
}

export async function jobRun(jobId: number): Promise<void> {
  await apiCall<void>(`/jobs/${jobId}/run`, "POST");
}

// ─────────────────────────────────────────────────────────
// AI ANALYTICS
// ─────────────────────────────────────────────────────────
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
