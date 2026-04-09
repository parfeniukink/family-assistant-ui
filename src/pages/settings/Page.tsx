import { useState } from "react";
import IdentityActions from "./IdentityActions";
import FinancesSection from "./Finances";
import NewsSection from "./News";
import JobsSection from "./Jobs";
import { Card, Container } from "src/components";
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
    fontSize: "0.9rem",
    background: activeTab === tab ? "rgba(26, 18, 10, 0.12)" : "transparent",
    color: activeTab === tab ? TOKENS.INK : TOKENS.INK_FADED,
    fontWeight: activeTab === tab ? 700 : 400,
  });

  return (
    <>
      <Container>
        <div className="settings-content" style={{ fontSize: "1.1rem" }}>
          <IdentityActions />

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
              className="tab-btn"
              style={tabStyle("resources")}
              onClick={() => handleTabChange("resources")}
              type="button"
            >
              RESOURCES
            </button>
            <button
              className="tab-btn"
              style={tabStyle("news")}
              onClick={() => handleTabChange("news")}
              type="button"
            >
              NEWS
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
      <div style={{ height: "100px" }} />
    </>
  );
}
