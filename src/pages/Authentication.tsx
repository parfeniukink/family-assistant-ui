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
      toast.error("Enter username");
      return;
    }
    if (!password) {
      toast.error("Enter password");
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
    <Card
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        margin: isMobile ? "30% 5% 0 5%" : "10% 30% 0 30%",
        padding: isMobile ? TOKENS.SPACE_2 : TOKENS.SPACE_3,
      }}
    >
      <h2 style={{ margin: 0, fontSize: "2rem" }}>Sign In</h2>

      <input
        type="text"
        placeholder="Username"
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
        placeholder="Password"
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
  );
}
