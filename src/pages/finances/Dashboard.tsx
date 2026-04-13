import { EquitySection } from "./EquitySection";
import { CostShortcutsSection } from "./CostShortcutsSection";
import { Container } from "src/components/Container";

export default function Page() {
  return (
    <Container>
      <EquitySection />
      <CostShortcutsSection />
    </Container>
  );
}
