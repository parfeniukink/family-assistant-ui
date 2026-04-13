import type { Response, ResponseMulti } from "src/infrastructure/generic";
import type { Notification } from "../types";
import { apiCall } from "./client";

export async function notificationsList(): Promise<Notification[]> {
  const response = await apiCall<ResponseMulti<Notification>>("/notifications");
  return response.result;
}

export async function notificationsCount(): Promise<number> {
  const response = await apiCall<Response<number>>("/notifications/count");
  return response.result;
}
