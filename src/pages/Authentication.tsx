import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Card, Button, Container } from "src/components";
import { useIdentity, useMobile } from "src/context";
import { TOKENS } from "src/styles/tokens";

export default function Authentication() {
  const { user, isLoading, signIn } = useIdentity();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isMobile } = useMobile();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  // Show loading state during initial auth check
  if (isLoading) {
    return (
      <Container>
        <Card
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <p>Loading...</p>
        </Card>
      </Container>
    );
  }

  async function handleSubmit(): Promise<void> {
    if (!username.trim()) {
      toast.error("Who are you?");
      return;
    }
    if (!password) {
      toast.error("Passphrase");
      return;
    }

    setIsSubmitting(true);

    const isAuthenticated = await signIn(username, password);

    setIsSubmitting(false);

    if (isAuthenticated) {
      navigate("/");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === "Enter" && !isSubmitting) {
      handleSubmit();
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: isMobile ? "0 5%" : "0 30%",
      }}
    >
    <Card
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        width: "100%",
        padding: TOKENS.SPACE_5,
      }}
    >
      <h2 style={{ margin: 0, fontSize: "2rem" }}>STOP!</h2>

      <input
        type="text"
        placeholder="Who?"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          fontFamily: "inherit",
          fontSize: "20px",
          width: "100%",
          padding: "1.5rem",
          borderRadius: "var(--radius)",
          border: "var(--border)",
          backgroundColor: "transparent",
          color: "var(--white)",
          minHeight: "60px",
        }}
      />

      <input
        type="password"
        placeholder="Passphrase..."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          fontFamily: "inherit",
          fontSize: "20px",
          width: "100%",
          padding: "1.5rem",
          borderRadius: "var(--radius)",
          border: "var(--border)",
          backgroundColor: "transparent",
          color: "var(--white)",
          minHeight: "60px",
        }}
      />

      <Button
        color="green"
        onClickCallback={handleSubmit}
        overrideStyles={{
          minHeight: "100px",
          opacity: isSubmitting ? 0.6 : 1,
          fontSize: "1.25rem",
        }}
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
    </Card>
    </div>
  );
}
