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
    () => (sessionStorage.getItem("settings-tab") as SettingsTab) || "resources",
  );

  function handleTabChange(tab: SettingsTab) {
    setActiveTab(tab);
    sessionStorage.setItem("settings-tab", tab);
  }
  const { isMobile } = useMobile();

  const tabStyle = (tab: SettingsTab): React.CSSProperties => ({
    padding: "0.5rem 1.5rem",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.9rem",
    letterSpacing: "0.08em",
    background: activeTab === tab ? "rgba(26, 18, 10, 0.12)" : "transparent",
    color: activeTab === tab ? TOKENS.INK : TOKENS.INK_FADED,
    fontWeight: activeTab === tab ? 700 : 400,
    border: activeTab === tab ? TOKENS.BORDER_HEAVY : TOKENS.BORDER,
    borderRadius: TOKENS.RADIUS,
  });

  return (
    <>
      <Container>
        {isMobile ? (
          <div>
            <IdentityActions />
          </div>
        ) : (
          <Card>
            <IdentityActions />
          </Card>
        )}

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
            RESOURCES
          </button>
          <button
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
            <Card>
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
              <Card>
                <NewsSection />
              </Card>
            )}
            <div style={{ marginTop: "1.5rem" }}>
              {isMobile ? (
                <div>
                  <JobsSection />
                </div>
              ) : (
                <Card>
                  <JobsSection />
                </Card>
              )}
            </div>
          </>
        )}
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
