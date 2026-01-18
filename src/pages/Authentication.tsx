import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Card, Button, TextInput } from "src/components";
import { useIdentity, useMobile } from "src/context";

export default function Authentication() {
  const { user, signIn, signOut } = useIdentity();
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const { isMobile } = useMobile();

  useEffect(() => {
    if (user) navigate("/");
    else {
      signOut();
    }
  }, [user]);

  return (
    <Card
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: isMobile ? "40% 5% 0 5%" : "10% 30% 0 30%",
      }}
    >
      <h2>Sign In</h2>
      <TextInput
        placeholder="access token"
        value={token}
        onChangeCallback={(e) => setToken(e.target.value)}
      />
      <Button
        color="green"
        onClickCallback={() => {
          if (!token) {
            toast.error("Enter Access Token");
            return;
          }

          signIn(token).then((isAuthenticated) => {
            if (isAuthenticated) {
              navigate("/");
            }
          });
        }}
        overrideStyles={{
          minHeight: "100px",
        }}
      >
        Sign In
      </Button>
    </Card>
  );
}
