import { useState, useEffect, useMemo } from "react";
import { fetchAiAnalytics } from "src/data/api/analytics";
import type { PipelineCostSummary } from "src/data/types";
import { TOKENS } from "src/styles/tokens";

function defaultRange(): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().slice(0, 10);
  const start = new Date(now.getTime() - 30 * 86400000)
    .toISOString()
    .slice(0, 10);
  return { start, end };
}

const BAR_COLORS = [
  "#6b4c8a",
  "#2a5599",
  "#3a7a20",
  "#b33030",
  "#5a4020",
  "#352008",
  "#1a120a",
  "#7a6844",
];

export default function AiInsights() {
  const { start, end } = defaultRange();
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);
  const [pipelines, setPipelines] = useState<PipelineCostSummary[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetchAiAnalytics({ startDate, endDate });
      setPipelines(res.result);
    } catch {
      /* handled by apiCall */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [startDate, endDate]);

  const totalCost = useMemo(
    () => pipelines.reduce((sum, p) => sum + p.totalCost, 0),
    [pipelines],
  );

  const totalRuns = useMemo(
    () => pipelines.reduce((sum, p) => sum + p.totalRuns, 0),
    [pipelines],
  );

  const inputStyle = {
    padding: "0.4rem 0.6rem",
    fontFamily: "inherit",
    fontSize: "1.1rem",
    color: TOKENS.INK,
    background: "transparent",
    border: TOKENS.BORDER,
    borderRadius: TOKENS.RADIUS,
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
        <span style={{ color: TOKENS.INK, fontSize: "1.1rem" }}>—</span>
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

      {!loading && pipelines.length === 0 && (
        <p style={{ textAlign: "center", color: TOKENS.GRAY }}>
          No pipeline runs in this range.
        </p>
      )}

      {!loading && pipelines.length > 0 && (
        <>
          {/* Summary */}
          <div
            style={{
              display: "flex",
              gap: "2rem",
              justifyContent: "center",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              fontSize: "1.1rem",
              color: TOKENS.INK,
            }}
          >
            <span>
              Pipelines:{" "}
              <b style={{ color: TOKENS.INK }}>{pipelines.length}</b>
            </span>
            <span>
              Total runs: <b style={{ color: TOKENS.INK }}>{totalRuns}</b>
            </span>
            <span>
              Total cost:{" "}
              <b style={{ color: TOKENS.INK }}>${totalCost.toFixed(4)}</b>
            </span>
          </div>

          {/* Bar chart */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {pipelines.map((p, i) => (
              <div key={p.pipelineName}>
                {/* Label row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "0.25rem",
                    fontSize: "1.1rem",
                  }}
                >
                  <span style={{ color: TOKENS.INK, fontWeight: 600 }}>{p.pipelineName}</span>
                  <span style={{ color: TOKENS.INK }}>
                    ${p.totalCost.toFixed(4)} · {p.totalRuns} runs ·{" "}
                    {p.percentage.toFixed(1)}%
                  </span>
                </div>
                {/* Bar */}
                <div
                  style={{
                    width: "100%",
                    height: "1.25rem",
                    background: "rgba(26, 18, 10, 0.15)",
                    borderRadius: TOKENS.RADIUS,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(p.percentage, 1)}%`,
                      height: "100%",
                      background: BAR_COLORS[i % BAR_COLORS.length],
                      borderRadius: TOKENS.RADIUS,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
