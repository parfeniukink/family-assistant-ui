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
    background: tab === t ? TOKENS.BLACK : "transparent",
    color: tab === t ? TOKENS.WHITE : TOKENS.GRAY,
    border: TOKENS.BORDER,
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
          FINANCES
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
