import { useState } from "react";
import { Container } from "src/components";
import { TOKENS } from "src/styles/tokens";
import FinancesInsights from "./Finances";
import AiInsights from "./AiInsights";

type Tab = "finances" | "ai";

export default function Page() {
  const [tab, setTab] = useState<Tab>(
    () => (sessionStorage.getItem("insights-tab") as Tab) || "finances",
  );

  function handleTabChange(t: Tab) {
    setTab(t);
    sessionStorage.setItem("insights-tab", t);
  }

  const tabStyle = (t: Tab) => ({
    padding: "0.5rem 1.5rem",
    cursor: "pointer" as const,
    fontFamily: "inherit",
    fontSize: "0.9rem",
    letterSpacing: "0.08em",
    background: tab === t ? "rgba(26, 18, 10, 0.12)" : "transparent",
    color: tab === t ? TOKENS.INK : TOKENS.INK_FADED,
    fontWeight: tab === t ? 700 : 400,
    border: tab === t ? TOKENS.BORDER_HEAVY : TOKENS.BORDER,
    borderRadius: TOKENS.RADIUS,
  });

  return (
    <Container>
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        <button style={tabStyle("finances")} onClick={() => handleTabChange("finances")}>
          RESOURCES
        </button>
        <button style={tabStyle("ai")} onClick={() => handleTabChange("ai")}>
          AI
        </button>
      </div>

      {tab === "finances" && <FinancesInsights />}
      {tab === "ai" && <AiInsights />}
      <br />
      <br />
    </Container>
  );
}
