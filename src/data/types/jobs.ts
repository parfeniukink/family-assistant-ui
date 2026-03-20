export type JobTypeAction = {
  jobType: string;
  label: string;
  name: string;
  description: string;
  parametersSchema: Record<string, unknown> | null;
  intervalRequired: boolean;
};

export type Job = {
  id: number;
  name: string;
  jobType: string;
  metadata: Record<string, unknown>;
  intervalMinutes: number | null;
  isActive: boolean;
  lastRunAt: string | null;
  nextRunAt: string;
  lastStatus: string | null;
  lastError: string | null;
  runCount: number;
  createdAt: string;
};

export type JobCreateRequestBody = {
  name?: string;
  jobType: string;
  metadata: Record<string, unknown>;
  intervalMinutes?: number | null;
};

export type JobUpdateRequestBody = {
  name?: string;
  isActive?: boolean;
};
