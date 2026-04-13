import type { Response } from "src/infrastructure/generic";
import type { TokensRequestBody, TokensResponse } from "../types";
import { apiCall } from "./client";

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
