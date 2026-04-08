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

  const tabStyle = (t: Tab): React.CSSProperties => ({
    fontSize: "1.1rem",
    background: tab === t ? "rgba(26, 18, 10, 0.12)" : "transparent",
    color: tab === t ? TOKENS.INK_FADED : TOKENS.INK_GHOST,
    fontWeight: tab === t ? 700 : 500,
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
        <button
          className="tab-btn"
          style={tabStyle("finances")}
          onClick={() => handleTabChange("finances")}
        >
          RESOURCES
        </button>
        <button
          className="tab-btn"
          style={tabStyle("ai")}
          onClick={() => handleTabChange("ai")}
        >
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
