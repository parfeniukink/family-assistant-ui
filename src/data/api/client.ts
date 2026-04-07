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
  NewsGroupItem,
  NewsGroupsResponse,
  JobTypeAction,
  Job,
  JobCreateRequestBody,
  JobUpdateRequestBody,
  AiAnalyticsResponse,
  CashBalance,
  CashCreateRequestBody,
  CashUpdateRequestBody,
  Asset,
  AssetCreateRequest,
  AssetUpdateRequest,
  AssetFieldCreateRequest,
  AssetFieldUpdateRequest,
} from "../types";
import {
  getAccessToken,
  performTokenRefresh,
  clearTokens,
} from "./authService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// In-memory cache for GET requests
const cache = new Map<string, { data: unknown; timestamp: number }>();

// In-flight GET request deduplication
const inFlight = new Map<string, Promise<unknown>>();

// Per-endpoint TTL configuration (first matching prefix wins)
const CACHE_TTL_CONFIG: ReadonlyArray<{ prefix: string; ttl: number }> = [
  // Rarely changing reference data: 10 minutes
  { prefix: "/transactions/costs/categories", ttl: 600_000 },
  { prefix: "/jobs/actions", ttl: 600_000 },
  // Moderately changing data: 5 minutes
  { prefix: "/identity/users", ttl: 300_000 },
  { prefix: "/transactions/costs/shortcuts", ttl: 300_000 },
  { prefix: "/news", ttl: 300_000 },
  { prefix: "/jobs", ttl: 300_000 },
  // Frequently changing data: 30 seconds
  { prefix: "/transactions", ttl: 30_000 },
  { prefix: "/analytics", ttl: 30_000 },
  { prefix: "/cash", ttl: 30_000 },
  { prefix: "/assets", ttl: 30_000 },
  { prefix: "/notifications", ttl: 30_000 },
];

const DEFAULT_CACHE_TTL = 60_000;

function getTtlForUrl(url: string): number {
  const path = url.split("?")[0];
  for (const entry of CACHE_TTL_CONFIG) {
    if (path.startsWith(entry.prefix)) {
      return entry.ttl;
    }
  }
  return DEFAULT_CACHE_TTL;
}

// Mutation-triggered cross-domain cache invalidation
const CROSS_INVALIDATION: Record<string, readonly string[]> = {
  "/transactions": ["/analytics/equity", "/analytics/transactions"],
  "/cash": ["/analytics/equity"],
  "/assets": ["/analytics/equity"],
};

function invalidateByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key === prefix || key.startsWith(prefix + "?") || key.startsWith(prefix + "/")) {
      cache.delete(key);
    }
  }
}

function invalidateCrossDomain(mutationUrl: string): void {
  const pathWithoutQuery = mutationUrl.split("?")[0];
  for (const [trigger, targets] of Object.entries(CROSS_INVALIDATION)) {
    if (pathWithoutQuery.startsWith(trigger)) {
      for (const target of targets) {
        invalidateByPrefix(target);
      }
      break;
    }
  }
}

/** Invalidate all cached entries whose URL starts with any of the given prefixes. */
export function invalidateCache(...prefixes: string[]): void {
  for (const prefix of prefixes) {
    invalidateByPrefix(prefix);
  }
}

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

export function apiCall<T>(
  url: string,
  method: string = "GET",
  body?: Record<string, unknown>,
  skipAuth: boolean = false,
): Promise<T> {
  // Check cache and deduplicate in-flight GET requests
  if (method === "GET") {
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < getTtlForUrl(url)) {
      return Promise.resolve(cached.data as T);
    }

    const existing = inFlight.get(url);
    if (existing) {
      return existing as Promise<T>;
    }

    // Register this request as in-flight and clean up when done
    const request = executeApiCall<T>(url, method, body, skipAuth).finally(() => {
      inFlight.delete(url);
    });
    inFlight.set(url, request);
    return request;
  }

  return executeApiCall<T>(url, method, body, skipAuth);
}

async function executeApiCall<T>(
  url: string,
  method: string,
  body?: Record<string, unknown>,
  skipAuth: boolean = false,
): Promise<T> {
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
    const rawError = await response.json();
    if (rawError.result) {
      for (const error of (rawError as ErrorResponse).result) {
        toast.error(error.message);
      }
    } else if (rawError.message) {
      toast.error(rawError.message);
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

  // Invalidate GET cache after successful mutations (prefix-based + cross-domain)
  if (method !== "GET") {
    const pathWithoutQuery = url.split("?")[0];
    invalidateByPrefix(pathWithoutQuery);
    const segments = pathWithoutQuery.replace(/^\//, "").split("/");
    if (segments.length > 1) {
      const parentPath = "/" + segments.slice(0, -1).join("/");
      invalidateByPrefix(parentPath);
    }
    invalidateCrossDomain(url);
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
    const rawError = await response.json();
    if (rawError.result) {
      for (const error of (rawError as ErrorResponse).result) {
        toast.error(error.message);
      }
    } else if (rawError.message) {
      toast.error(rawError.message);
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
  minValue = null,
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
  minValue?: number | null;
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
  if (minValue != null) urlParticles.push(`&minValue=${minValue}`);

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

/** @deprecated Use invalidateCache("/notifications") instead */
export function invalidateNotificationsCache(): void {
  invalidateCache("/notifications");
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

// ─────────────────────────────────────────────────────────
// CASH
// ─────────────────────────────────────────────────────────
export async function cashList(): Promise<ResponseMulti<CashBalance>> {
  return await apiCall<ResponseMulti<CashBalance>>("/cash");
}

export async function cashCreate(
  requestBody: CashCreateRequestBody,
): Promise<Response<CashBalance>> {
  return await apiCall<Response<CashBalance>>(
    "/cash",
    "POST",
    requestBody as unknown as Record<string, unknown>,
  );
}

export async function cashUpdate(
  id: number,
  requestBody: CashUpdateRequestBody,
): Promise<Response<CashBalance>> {
  return await apiCall<Response<CashBalance>>(
    `/cash/${id}`,
    "PATCH",
    requestBody as unknown as Record<string, unknown>,
  );
}

export async function cashDelete(id: number): Promise<void> {
  await apiCall<void>(`/cash/${id}`, "DELETE");
}

// ─────────────────────────────────────────────────────────
// ASSETS
// ─────────────────────────────────────────────────────────
export async function assetsList(): Promise<ResponseMulti<Asset>> {
  return await apiCall<ResponseMulti<Asset>>("/assets");
}

export async function assetsCreate(
  requestBody: AssetCreateRequest,
): Promise<Response<Asset>> {
  return await apiCall<Response<Asset>>(
    "/assets",
    "POST",
    requestBody as unknown as Record<string, unknown>,
  );
}

export async function assetsUpdate(
  id: number,
  requestBody: AssetUpdateRequest,
): Promise<Response<Asset>> {
  return await apiCall<Response<Asset>>(
    `/assets/${id}`,
    "PATCH",
    requestBody as unknown as Record<string, unknown>,
  );
}

export async function assetsDelete(id: number): Promise<void> {
  await apiCall<void>(`/assets/${id}`, "DELETE");
}

export async function assetFieldCreate(
  assetId: number,
  requestBody: AssetFieldCreateRequest,
): Promise<Response<Asset>> {
  return await apiCall<Response<Asset>>(
    `/assets/${assetId}/fields`,
    "POST",
    requestBody as unknown as Record<string, unknown>,
  );
}

export async function assetFieldUpdate(
  assetId: number,
  fieldId: number,
  requestBody: AssetFieldUpdateRequest,
): Promise<Response<Asset>> {
  return await apiCall<Response<Asset>>(
    `/assets/${assetId}/fields/${fieldId}`,
    "PATCH",
    requestBody as unknown as Record<string, unknown>,
  );
}

export async function assetFieldDelete(
  assetId: number,
  fieldId: number,
): Promise<void> {
  await apiCall<void>(
    `/assets/${assetId}/fields/${fieldId}`,
    "DELETE",
  );
}

export async function assetDocumentDownload(
  assetId: number,
  docId: number,
  filename: string,
): Promise<void> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/assets/${assetId}/documents/${docId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to download document");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function assetDocumentUpload(
  assetId: number,
  file: File,
): Promise<Response<Asset>> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/assets/${assetId}/documents`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.message) {
        toast.error(errorJson.message);
      }
    } catch {
      toast.error("Failed to upload document");
    }
    throw new Error("Upload failed");
  }

  // Invalidate assets cache after upload
  cache.delete("/assets");

  return (await response.json()) as Response<Asset>;
}

export async function assetDocumentDelete(
  assetId: number,
  docId: number,
): Promise<void> {
  await apiCall<void>(
    `/assets/${assetId}/documents/${docId}`,
    "DELETE",
  );
}
