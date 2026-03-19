import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button, TextInput, Dropdown } from "src/components";
import { useMobile } from "src/context";
import { TOKENS } from "src/styles/tokens";
import {
  jobActionsList,
  jobsList,
  jobCreate,
  jobUpdate,
  jobDelete,
  jobRun,
} from "src/data/api/client";
import type {
  Job,
  JobTypeAction,
} from "src/data/types";

function formatInterval(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (rem === 0) return hours === 1 ? "1 hour" : `${hours} hours`;
  return `${hours}h ${rem}m`;
}

function statusColor(status: string | null): string {
  if (status === "success") return TOKENS.ACCENT_GREEN;
  if (status === "error") return TOKENS.ACCENT_RED;
  if (status === "running") return TOKENS.ACCENT_BLUE;
  return TOKENS.GRAY;
}

// ── Schema-driven parameter form ──

type JsonSchemaProperty = {
  type?: string;
  title?: string;
  default?: unknown;
  enum?: unknown[];
};

type JsonSchema = {
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
};

function SchemaForm({
  schema,
  values,
  onChange,
}: {
  schema: Record<string, unknown>;
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}) {
  const s = schema as JsonSchema;
  const properties = s.properties ?? {};

  return (
    <>
      {Object.entries(properties).map(([key, prop]) => {
        const label = prop.title ?? key;

        if (prop.type === "string" && prop.enum) {
          return (
            <Dropdown
              key={key}
              value={values[key] ?? (prop.default as string) ?? ""}
              onChangeCallback={(e) =>
                onChange({ ...values, [key]: e.target.value })
              }
            >
              <option value="">{label}</option>
              {prop.enum.map((v) => (
                <option key={String(v)} value={String(v)}>
                  {String(v)}
                </option>
              ))}
            </Dropdown>
          );
        }

        if (prop.type === "boolean") {
          return (
            <Dropdown
              key={key}
              value={values[key] ?? ""}
              onChangeCallback={(e) =>
                onChange({ ...values, [key]: e.target.value })
              }
            >
              <option value="">{label}</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Dropdown>
          );
        }

        return (
          <TextInput
            key={key}
            value={values[key] ?? ""}
            placeholder={label}
            onChangeCallback={(e) =>
              onChange({ ...values, [key]: e.target.value })
            }
          />
        );
      })}
    </>
  );
}

function coerceParams(
  schema: Record<string, unknown>,
  values: Record<string, string>,
): Record<string, unknown> {
  const s = schema as JsonSchema;
  const properties = s.properties ?? {};
  const result: Record<string, unknown> = {};

  for (const [key, raw] of Object.entries(values)) {
    if (raw === "") continue;
    const prop = properties[key];
    if (!prop) {
      result[key] = raw;
      continue;
    }
    if (prop.type === "integer") {
      result[key] = parseInt(raw, 10);
    } else if (prop.type === "number") {
      result[key] = parseFloat(raw);
    } else if (prop.type === "boolean") {
      result[key] = raw === "true";
    } else {
      result[key] = raw;
    }
  }

  return result;
}

// ── Main Jobs section ──

export default function JobsSection() {
  const { isMobile } = useMobile();
  const [actions, setActions] = useState<JobTypeAction[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  // Form state
  const [selectedType, setSelectedType] = useState("");
  const [name, setName] = useState("");
  const [intervalMinutes, setIntervalMinutes] = useState("");
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  useEffect(() => {
    jobActionsList().then((res) => setActions(res.result));
    jobsList().then((res) => setJobs(res.result));
  }, []);

  const selected = actions.find((a) => a.jobType === selectedType);

  function handleTypeChange(jobType: string) {
    setSelectedType(jobType);
    setParamValues({});
    setName("");
    setIntervalMinutes("");
  }

  async function handleAdd() {
    if (!selected) {
      toast.error("Type is required");
      return;
    }

    const isSystem = selected.label === "system";

    if (!isSystem && !name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (
      !isSystem &&
      jobs.some(
        (j) => j.name.toLowerCase() === name.trim().toLowerCase(),
      )
    ) {
      toast.error("A job with this name already exists");
      return;
    }

    const metadata: Record<string, unknown> = selected.parametersSchema
      ? coerceParams(selected.parametersSchema, paramValues)
      : {};

    const parsedInterval = intervalMinutes.trim()
      ? parseInt(intervalMinutes.trim(), 10)
      : null;

    try {
      await jobCreate({
        name: isSystem ? undefined : name,
        jobType: selected.jobType,
        metadata,
        intervalMinutes: parsedInterval,
      });
      const res = await jobsList();
      setJobs(res.result);
      setName("");
      setParamValues({});
      setSelectedType("");
      setIntervalMinutes("");
      toast.success("Job created");
    } catch {
      // errors handled by apiCall
    }
  }

  async function handleToggle(job: Job) {
    try {
      await jobUpdate(job.id, { isActive: !job.isActive });
      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id ? { ...j, isActive: !j.isActive } : j,
        ),
      );
    } catch {
      // errors handled by apiCall
    }
  }

  async function handleRun(jobId: number) {
    try {
      await jobRun(jobId);
      toast.success("Job triggered");
      const res = await jobsList();
      setJobs(res.result);
    } catch {
      // errors handled by apiCall
    }
  }

  async function handleDelete(id: number) {
    try {
      await jobDelete(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      toast.success("Job deleted");
    } catch {
      // errors handled by apiCall
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: TOKENS.SPACE_1,
      }}
    >
      {jobs.map((job) => (
          <div
            key={job.id}
            className="job-card"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
              padding: "0.5rem",
              border: TOKENS.BORDER,
              borderRadius: TOKENS.RADIUS,
              opacity: job.isActive ? 1 : 0.5,
            }}
          >
            {/* Name — visible only on mobile at the top */}
            <div
              className="job-card-name-mobile"
              style={{
                display: "none",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <strong>{job.name}</strong>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.15rem 0.4rem",
                    borderRadius: "4px",
                    background: TOKENS.BG_BLUE,
                    color: TOKENS.WHITE,
                  }}
                >
                  {actions.find((a) => a.jobType === job.jobType)?.label ?? job.jobType}
                </span>
                {job.lastStatus && (
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: statusColor(job.lastStatus),
                      display: "inline-block",
                    }}
                  />
                )}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Name row — desktop only */}
              <div
                className="job-card-name-desktop"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <strong>{job.name}</strong>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.15rem 0.4rem",
                    borderRadius: "4px",
                    background: TOKENS.BG_BLUE,
                    color: TOKENS.WHITE,
                  }}
                >
                  {actions.find((a) => a.jobType === job.jobType)?.label ?? job.jobType}
                </span>
                {job.lastStatus && (
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: statusColor(job.lastStatus),
                      display: "inline-block",
                    }}
                  />
                )}
              </div>
              <div
                className="job-card-stats"
                style={{
                  fontSize: "0.8rem",
                  color: TOKENS.GRAY,
                  marginTop: "0.25rem",
                  textAlign: "left",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                runs: {job.runCount}
                {typeof job.intervalMinutes === "number" &&
                  ` · every ${formatInterval(job.intervalMinutes)}`}
                {job.lastRunAt &&
                  ` · ${new Date(job.lastRunAt).toLocaleString()}`}
                {job.lastError && (
                  <span
                    style={{
                      color: TOKENS.ACCENT_RED,
                      display: "inline",
                    }}
                  >
                    {" "}
                    · {job.lastError.length > 80
                      ? job.lastError.slice(0, 80) + "…"
                      : job.lastError}
                  </span>
                )}
              </div>
            </div>
            <div
              style={
                job.isActive
                  ? {
                      display: "flex",
                      gap: "1rem",
                      flexShrink: 0,
                    }
                  : {
                      display: "flex",
                      flexDirection: "row-reverse",
                      gap: "1rem",
                      flexShrink: 0,
                    }
              }
            >
              <div style={{ width: "70px", height: "36px" }}>
                <Button
                  color={job.isActive ? "#9c6700" : "green"}
                  onClickCallback={() => handleToggle(job)}
                  overrideStyles={{
                    fontSize: "0.8rem",
                    padding: "0.25rem",
                  }}
                >
                  {job.isActive ? "PAUSE" : "START"}
                </Button>
              </div>
              <div style={{ width: "60px", height: "36px" }}>
                <Button
                  hidden={!job.isActive}
                  color="green"
                  onClickCallback={() => handleRun(job.id)}
                  overrideStyles={{
                    fontSize: "0.8rem",
                    padding: "0.25rem",
                  }}
                >
                  RUN
                </Button>
              </div>
              <div style={{ width: "70px", height: "36px" }}>
                <Button
                  hidden={!job.isActive}
                  color="transparent"
                  onClickCallback={() => handleDelete(job.id)}
                  overrideStyles={{
                    fontSize: "0.8rem",
                    padding: "0.25rem",
                  }}
                >
                  🗑️
                </Button>
              </div>
            </div>
          </div>
      ))}

      <style>{`
        @media (max-width: 600px) {
          .job-card {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.5rem !important;
          }
          .job-card-name-mobile {
            display: block !important;
          }
          .job-card-name-desktop {
            display: none !important;
          }
          .job-card-stats {
            white-space: normal !important;
            overflow: visible !important;
            font-size: 0.7rem !important;
          }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", flexDirection: isMobile ? "column" : "row" }}>
          {(!selected || selected.label !== "system") && (
            <TextInput
              value={name}
              placeholder="Job name"
              disabled={false}
              onChangeCallback={(e) => setName(e.target.value)}
            />
          )}
          <Dropdown
            value={selectedType}
            onChangeCallback={(e) => handleTypeChange(e.target.value)}
          >
            <option value="">Select type...</option>
            {actions.map((a) => (
              <option key={a.jobType} value={a.jobType}>
                {a.name}
              </option>
            ))}
          </Dropdown>
        </div>

        {selected?.parametersSchema && (
          <SchemaForm
            schema={selected.parametersSchema}
            values={paramValues}
            onChange={setParamValues}
          />
        )}

        {selected && selected.intervalRequired && (
          <TextInput
            value={intervalMinutes}
            placeholder="Interval (minutes)"
            onChangeCallback={(e) => setIntervalMinutes(e.target.value)}
          />
        )}

        <div style={{ height: "40px", width: "100%", maxWidth: "340px", alignSelf: "center" }}>
          <Button onClickCallback={handleAdd}>ADD JOB</Button>
        </div>

        {selected && (
          <div
            style={{
              fontSize: "0.8rem",
              color: TOKENS.GRAY,
              lineHeight: 1.5,
            }}
          >
            {selected.description
              .split(".")
              .map((s) => s.trim())
              .filter(Boolean)
              .join(". ")}
          </div>
        )}
      </div>
    </div>
  );
}
