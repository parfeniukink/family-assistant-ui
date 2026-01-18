import { Container, Card, RequireAuth } from "src/components";
import { TOKENS } from "src/styles/tokens";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function Page() {
  useEffect(() => {
    toast("page is not ready yet");
  });

  return (
    <RequireAuth>
      <Container>
        <Card style={{ opacity: 0.5 }}>
          <p style={{ color: TOKENS.ACCENT_RED, fontStyle: "italic" }}>
            work in progress
          </p>
        </Card>
      </Container>
    </RequireAuth>
  );
}
