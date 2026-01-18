import { TOKENS } from "src/styles/tokens";
import { Navbar } from "./Navbar";
import { useMobile } from "src/context";

export function Container({ children }: { children: React.ReactNode }) {
  const { isMobile } = useMobile();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: isMobile ? "15px" : `${TOKENS.SPACE_1} 5%`,
        gap: TOKENS.SPACE_3,
      }}
    >
      <Navbar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: TOKENS.SPACE_2,
        }}
      >
        {children}
      </div>
    </div>
  );
}
