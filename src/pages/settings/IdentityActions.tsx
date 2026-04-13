import { NoData } from "src/components/NoData";
import { useIdentity } from "src/context/IdentityContext";
import { useMobile } from "src/context/MobileContext";

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
          marginLeft: "0.5rem"
        }}
        className="equity-link"
      >
        Sign out?
      </span>
    </p>
  );
}
