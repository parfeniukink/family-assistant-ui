import { useState } from "react";
import IdentityActions from "./IdentityActions";
import FinancesSection from "./Finances";
import NewsSection from "./News";
import JobsSection from "./Jobs";
import { Card, Container, SketchBorder } from "src/components";
import { TOKENS } from "src/styles/tokens";
import { useMobile } from "src/context";

type SettingsTab = "resources" | "news";

export default function Page() {
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    () =>
      (sessionStorage.getItem("settings-tab") as SettingsTab) || "resources",
  );

  function handleTabChange(tab: SettingsTab) {
    setActiveTab(tab);
    sessionStorage.setItem("settings-tab", tab);
  }
  const { isMobile } = useMobile();

  const tabStyle = (tab: SettingsTab): React.CSSProperties => ({
    position: "relative",
    padding: "0.5rem 1.5rem",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.9rem",
    letterSpacing: "0.08em",
    background: activeTab === tab ? "rgba(26, 18, 10, 0.12)" : "transparent",
    color: activeTab === tab ? TOKENS.INK : TOKENS.INK_FADED,
    fontWeight: activeTab === tab ? 700 : 400,
    border: "none",
    borderRadius: TOKENS.RADIUS,
  });

  return (
    <>
      <Container>
        <div className="settings-content" style={{ fontSize: "1.1rem" }}>
          <IdentityActions />

          <br></br>

          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "0.5rem",
              justifyContent: "center",
              marginBottom: "1.5rem",
            }}
          >
            <button
              style={tabStyle("resources")}
              onClick={() => handleTabChange("resources")}
              type="button"
            >
              <SketchBorder
                stroke={
                  activeTab === "resources"
                    ? "rgba(26, 18, 10, 0.7)"
                    : "rgba(26, 18, 10, 0.5)"
                }
              />
              <span style={{ position: "relative" }}>RESOURCES</span>
            </button>
            <button
              style={tabStyle("news")}
              onClick={() => handleTabChange("news")}
              type="button"
            >
              <SketchBorder
                stroke={
                  activeTab === "news"
                    ? "rgba(26, 18, 10, 0.7)"
                    : "rgba(26, 18, 10, 0.5)"
                }
              />
              <span style={{ position: "relative" }}>NEWS</span>
            </button>
          </div>

          {activeTab === "resources" &&
            (isMobile ? (
              <div>
                <FinancesSection />
              </div>
            ) : (
              <Card style={{ border: "none" }}>
                <FinancesSection />
              </Card>
            ))}
          {activeTab === "news" && (
            <>
              {isMobile ? (
                <div>
                  <NewsSection />
                </div>
              ) : (
                <Card style={{ border: "none" }}>
                  <NewsSection />
                </Card>
              )}
              <div style={{ marginTop: "3rem" }}>
                <h3 style={{ marginBottom: "1rem" }}>JOBS</h3>
                {isMobile ? (
                  <div>
                    <JobsSection />
                  </div>
                ) : (
                  <Card style={{ border: "none" }}>
                    <JobsSection />
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </Container>
      <div>
        <br />
        <br />
        <br />
        <br />
      </div>
    </>
  );
}
