import { Button } from "src/components";
import { useIdentity, useMobile } from "src/context";

export default function Component() {
  // Context
  const { signOut } = useIdentity();
  const { isMobile } = useMobile();

  return (
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
          : { display: "flex", justifyContent: "end" }
      }
    >
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
