import type {
  Response,
  PaginatedResponse,
  ResponseMulti,
} from "src/infrastructure/generic";
import type {
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
  CostShortcutApplyRequestBody,
  CostPartialUpdateRequestBody,
  IncomePartialUpdateRequestBody,
  OperationType,
  AnalyticsPeriod,
} from "../types";
import { apiCall } from "./client";

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
