import IdentityActions from "./IdentityActions";
import FinancesSection from "./Finances";
import { Card, Container } from "src/components";

export default function Page() {
  return (
    <Container>
      <Card>
        <IdentityActions />
      </Card>
      <Card>
        <FinancesSection />
      </Card>
    </Container>
  );
}
