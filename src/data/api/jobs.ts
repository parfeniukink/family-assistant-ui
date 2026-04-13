import type { ResponseMulti } from "src/infrastructure/generic";
import type {
  JobTypeAction,
  Job,
  JobCreateRequestBody,
  JobUpdateRequestBody,
} from "../types";
import { apiCall } from "./client";

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
