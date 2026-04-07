import { NoData } from "src/components";
import { useIdentity, useMobile } from "src/context";

import { TOKENS } from "src/styles/tokens";

export default function Component() {
  const { user, signOut } = useIdentity();
  const { isMobile } = useMobile();

  return !user ? (
    <NoData />
  ) : (
    <p style={{ margin: "2rem", fontSize: "1.75rem", fontWeight: 500 }}>
      Welcome, <strong>{user.name}</strong>.{isMobile ? <br></br> : ""}
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
