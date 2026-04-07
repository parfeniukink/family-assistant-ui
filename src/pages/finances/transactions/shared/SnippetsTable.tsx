import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "src/components";
import { useMobile } from "src/context";
import { TOKENS } from "src/styles/tokens";

type ComponentProps = {
  name: string;
  items: string[];
  onClickCallback: (item: string) => void;
};

export function SnippetsTable({
  name,
  items,
  onClickCallback,
}: ComponentProps) {
  const [open, setOpen] = useState(false);
  const { isMobile } = useMobile();

  return (
    <>
      <Button
        overrideStyles={{
          boxShadow: "none",
          height: "auto",
        }}
        color="transparent"
        onClickCallback={() => setOpen(true)}
      >
        {name}
      </Button>

      {open &&
        createPortal(
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: isMobile ? "1rem" : "2rem",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundImage: "url('/textures/parchment.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: TOKENS.BORDER_HEAVY,
                borderRadius: TOKENS.RADIUS,
                boxShadow: "4px 4px 20px rgba(0, 0, 0, 0.4)",
                padding: TOKENS.SPACE_4,
                maxWidth: isMobile ? "100%" : "600px",
                width: "100%",
                maxHeight: "70vh",
                overflow: "auto",
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
                gap: TOKENS.SPACE_2,
              }}
            >
              {items.map((item) => (
                <Button
                  key={item}
                  color="none"
                  hoverBackground={TOKENS.BG_RED}
                  overrideStyles={{
                    border: TOKENS.BORDER,
                    boxShadow: "none",
                    padding: "8px 12px",
                    fontSize: TOKENS.FONT_SM,
                  }}
                  onClickCallback={() => {
                    onClickCallback(item);
                    setOpen(false);
                  }}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
