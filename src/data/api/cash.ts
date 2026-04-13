import type { Response, ResponseMulti } from "src/infrastructure/generic";
import type {
  CashBalance,
  CashCreateRequestBody,
  CashUpdateRequestBody,
} from "../types";
import { apiCall } from "./client";

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
