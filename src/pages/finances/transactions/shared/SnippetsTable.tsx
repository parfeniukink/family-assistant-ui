import { useState, useRef, useEffect } from "react";
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
  const ref = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const { isMobile } = useMobile();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "50px",
            right: 0,
            margin: 0,
            padding: TOKENS.SPACE_1,
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: TOKENS.SPACE_1,
            background: TOKENS.BG_LIGHTER,
            zIndex: 10,
            border: TOKENS.BORDER,
            boxShadow: TOKENS.SHADOW,
            borderRadius: TOKENS.RADIUS,
            maxWidth: isMobile ? "250px" : "500px",
            minHeight: "200px",
            maxHeight: "500px",
            overflow: "auto",
          }}
        >
          {items.map((item) => (
            <Button
              color="none"
              hoverBackground={TOKENS.BG_RED}
              overrideStyles={{
                border: `solid ${TOKENS.BLACK} 2px`,
                boxShadow: "none",
                padding: "5px 10px",
                minWidth: "100px",
                maxHeight: "75px",
                fontSize: "x-small",
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
      )}
      <Button
        overrideStyles={{
          boxShadow: "none",
        }}
        color="transparent"
        onClickCallback={() => setOpen((o) => !o)}
      >
        {name}
      </Button>
    </div>
  );
}
