import { NoData } from "src/components";
import { useIdentity } from "src/context";
import { TOKENS } from "src/styles/tokens";

export default function Component() {
  const { user, signOut } = useIdentity();

  return !user ? (
    <NoData />
  ) : (
    <p style={{ margin: "2rem", fontSize: "1.15rem" }}>
      Welcome, <strong>{user.name}</strong>.{" "}
      <span
        onClick={signOut}
        style={{
          color: TOKENS.ACCENT_RED,
          cursor: "pointer",
          fontWeight: 600,
        }}
        className="equity-link"
      >
        Sign out
      </span>
    </p>
  );
}
