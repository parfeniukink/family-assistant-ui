import { useState } from "react";
import { Button, Modal } from "src/components";
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

      {open && (
        <Modal
          onClose={() => setOpen(false)}
          blur
          style={{
            maxWidth: isMobile ? "100%" : "600px",
            width: "100%",
            maxHeight: "70vh",
            overflow: "auto",
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
            gap: TOKENS.SPACE_2,
            padding: isMobile ? "1rem" : TOKENS.SPACE_4,
          }}
        >
          {items.map((item) => (
            <Button
              key={item}
              color="none"
              hoverBackground={TOKENS.BG_RED}
              overrideStyles={{
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
        </Modal>
      )}
    </>
  );
}
