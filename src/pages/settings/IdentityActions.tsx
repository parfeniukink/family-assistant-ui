import { Button, NoData } from "src/components";
import { useIdentity, useMobile } from "src/context";

export default function Component() {
  // Context
  const { user, signOut } = useIdentity();
  const { isMobile } = useMobile();

  return !user ? (
    <NoData />
  ) : (
    // Space between items once more action buttons are added
    <div
      style={
        isMobile
          ? {
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
              alignItems: "center",
            }
          : { display: "flex", justifyContent: "space-between" }
      }
    >
      <h2>Welcome, {user.name}</h2>
      <Button
        color="red"
        onClickCallback={signOut}
        overrideStyles={{
          height: "75px",
          width: "200px",
          fontSize: "large",
          fontWeight: "bold",
        }}
      >
        SIGN OUT
      </Button>
    </div>
  );
}
