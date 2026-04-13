import type { Response } from "src/infrastructure/generic";
import type { User, ConfigurationPartialUpdateRequestBody } from "../types";
import { apiCall } from "./client";

export async function fetchCurrentUser(): Promise<Response<User>> {
  return await apiCall<Response<User>>("/identity/users");
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
