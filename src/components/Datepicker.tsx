import type { ChangeEvent } from "react";
import { useMobile } from "src/context";
import { TOKENS } from "src/styles/tokens";
import { Button } from "./Button";

type DatepickerProps = {
  date?: string;
  setDateCallback: (date: string) => void;
  disabled?: boolean;
  showShortcuts?: boolean;
};

export function Datepicker({
  date,
  setDateCallback,
  disabled = false,
  showShortcuts = true,
}: DatepickerProps) {
  const { isMobile } = useMobile();

  const styles = {
    fontSize: "0.9rem",
    fontWeight: 300,
    padding: "0 16px",
    minHeight: "2.5rem",
    boxShadow: "none",
    cursor: "pointer",
    transform: "none",
    transition: "none",
  };

  // Shortcuts for dates selection
  function daysFromToday(daysAgo: number) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setDateCallback(d.toISOString().slice(0, 10));
  }

  // Call back the function with updated target
  function dateChanged(item: ChangeEvent<HTMLInputElement>) {
    setDateCallback(item.target.value);
  }

  return (
    <div
      style={
        isMobile
          ? {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "stretch",
              gap: TOKENS.SPACE_2,
              width: "100%",
              minWidth: 0,
              overflow: "hidden",
            }
          : {
              display: "flex",
              justifyContent: "center",
              alignItems: "stretch",
              gap: TOKENS.SPACE_2,
            }
      }
    >
      <input
        type="date"
        value={date}
        onChange={dateChanged}
        className="datepicker"
        disabled={disabled}
      />
      {showShortcuts && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <Button
            color="darkslategrey"
            overrideStyles={styles}
            onClickCallback={() => daysFromToday(0)}
          >
            today
          </Button>
          <Button
            color="darkslategrey"
            overrideStyles={styles}
            onClickCallback={() => daysFromToday(1)}
          >
            -1
          </Button>
          <Button
            color="darkslategrey"
            overrideStyles={styles}
            onClickCallback={() => daysFromToday(2)}
          >
            -2
          </Button>
          <Button
            color="darkslategrey"
            overrideStyles={styles}
            onClickCallback={() => daysFromToday(3)}
          >
            -3
          </Button>
        </div>
      )}
    </div>
  );
}
