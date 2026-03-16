import { useState, useEffect, useMemo } from "react";
import { fetchAiAnalytics } from "src/data/api/client";
import type { AiPipelineRun } from "src/data/types";
import { TOKENS } from "src/styles/tokens";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hours}:${mins}`;
}

function defaultRange(): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().slice(0, 10);
  const start = new Date(now.getTime() - 30 * 86400000)
    .toISOString()
    .slice(0, 10);
  return { start, end };
}

function agentSummary(run: AiPipelineRun): string {
  return run.agentStats.map((s) => `${s.agent}:${s.calls}`).join(", ");
}

const PAGE_SIZE = 100;

export default function AiInsights() {
  const { start, end } = defaultRange();
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);
  const [runs, setRuns] = useState<AiPipelineRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const res = await fetchAiAnalytics({ startDate, endDate });
      setRuns(res.result);
      setPage(0);
    } catch {
      /* handled by apiCall */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(runs.length / PAGE_SIZE));
  const pageRuns = runs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const totals = useMemo(() => {
    let calls = 0;
    let errors = 0;
    let cost = 0;
    for (const r of runs) {
      calls += r.totalCalls;
      errors += r.totalErrors;
      cost += r.estimatedCost;
    }
    return { calls, errors, cost };
  }, [runs]);

  const inputStyle = {
    padding: "0.4rem 0.6rem",
    fontFamily: "inherit",
    fontSize: "0.85rem",
    color: TOKENS.WHITE,
    background: "transparent",
    border: TOKENS.BORDER,
    borderRadius: TOKENS.RADIUS,
  };

  const thStyle: React.CSSProperties = {
    padding: "0.5rem 0.75rem",
    textAlign: "left",
    fontSize: "0.75rem",
    color: TOKENS.GRAY,
    borderBottom: TOKENS.BORDER,
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = {
    padding: "0.45rem 0.75rem",
    fontSize: "0.8rem",
    color: TOKENS.WHITE,
    borderBottom: `1px solid ${TOKENS.BLACK}`,
    whiteSpace: "nowrap",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          justifyContent: "flex-end",
          marginBottom: "1rem",
        }}
      >
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={inputStyle}
        />
        <span style={{ color: TOKENS.GRAY, fontSize: "0.8rem" }}>—</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={inputStyle}
        />
      </div>

      {loading && (
        <p style={{ textAlign: "center", color: TOKENS.GRAY }}>Loading...</p>
      )}

      {!loading && runs.length === 0 && (
        <p style={{ textAlign: "center", color: TOKENS.GRAY }}>
          No pipeline runs in this range.
        </p>
      )}

      {!loading && runs.length > 0 && (
        <>
          {/* Summary row */}
          <div
            style={{
              display: "flex",
              gap: "2rem",
              justifyContent: "center",
              marginBottom: "1rem",
              flexWrap: "wrap",
              fontSize: "0.85rem",
              color: TOKENS.GRAY,
            }}
          >
            <span>
              Runs: <b style={{ color: TOKENS.WHITE }}>{runs.length}</b>
            </span>
            <span>
              Calls: <b style={{ color: TOKENS.WHITE }}>{totals.calls}</b>
            </span>
            {totals.errors > 0 && (
              <span>
                Errors:{" "}
                <b style={{ color: TOKENS.ACCENT_RED }}>{totals.errors}</b>
              </span>
            )}
            <span>
              Cost:{" "}
              <b style={{ color: TOKENS.WHITE }}>
                ${totals.cost.toFixed(4)}
              </b>
            </span>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: TOKENS.BORDER,
                borderRadius: TOKENS.RADIUS,
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Pipeline</th>
                  <th style={thStyle}>Trace</th>
                  <th style={thStyle}>Agents</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Calls</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Errors</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Wall (s)</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Cost ($)</th>
                </tr>
              </thead>
              <tbody>
                {pageRuns.map((run) => (
                  <tr key={run.id}>
                    <td style={tdStyle}>{formatDate(run.createdAt)}</td>
                    <td style={tdStyle}>{run.pipelineName}</td>
                    <td
                      style={{
                        ...tdStyle,
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                        color: TOKENS.GRAY,
                      }}
                    >
                      {run.traceId}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        fontSize: "0.7rem",
                        color: TOKENS.GRAY,
                      }}
                    >
                      {agentSummary(run)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {run.totalCalls}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "right",
                        color:
                          run.totalErrors > 0
                            ? TOKENS.ACCENT_RED
                            : TOKENS.WHITE,
                      }}
                    >
                      {run.totalErrors}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {run.wallTimeS.toFixed(1)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {run.estimatedCost.toFixed(5)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                marginTop: "1rem",
                fontSize: "0.85rem",
                color: TOKENS.GRAY,
              }}
            >
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                style={{
                  background: "transparent",
                  border: TOKENS.BORDER,
                  borderRadius: TOKENS.RADIUS,
                  color: page === 0 ? TOKENS.GRAY : TOKENS.WHITE,
                  padding: "0.3rem 0.75rem",
                  cursor: page === 0 ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  fontSize: "0.8rem",
                  opacity: page === 0 ? 0.4 : 1,
                }}
              >
                Prev
              </button>
              <span>
                {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  background: "transparent",
                  border: TOKENS.BORDER,
                  borderRadius: TOKENS.RADIUS,
                  color: page >= totalPages - 1 ? TOKENS.GRAY : TOKENS.WHITE,
                  padding: "0.3rem 0.75rem",
                  cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  fontSize: "0.8rem",
                  opacity: page >= totalPages - 1 ? 0.4 : 1,
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
