import { ActionsSection } from "./ActionsSection";
import { EquitySection } from "./EquitySection";
import { CostShortcutsSection } from "./CostShortcutsSection";
import { Container } from "src/components";
import { useMobile } from "src/context";
import { TOKENS } from "src/styles/tokens";

export default function Page() {
  const { isMobile } = useMobile();
  return (
    <Container>
      <div
        style={
          isMobile
            ? {
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: TOKENS.SPACE_1,
              }
            : {
                display: "flex",
                justifyContent: "space-between",
              }
        }
      >
        <EquitySection />
        <ActionsSection />
      </div>
      <CostShortcutsSection />
    </Container>
  );
}
