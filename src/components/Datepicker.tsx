import type { ChangeEvent } from "react";
import { useMobile } from "src/context";
import { TOKENS } from "src/styles/tokens";
import { Button } from "./Button";

type DatepickerProps = {
  date?: string;
  setDateCallback: CallableFunction;
  disabled?: boolean;
};

export function Datepicker({
  date,
  setDateCallback,
  disabled = false,
}: DatepickerProps) {
  const { isMobile } = useMobile();

  const styles = {
    fontSize: "small",
    fontWeight: 300,
    padding: "5px 20px",
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
              alignItems: "center",
              gap: TOKENS.SPACE_1,
            }
          : {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: TOKENS.SPACE_1,
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
      <div
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <Button
          color="blue"
          overrideStyles={styles}
          onClickCallback={() => daysFromToday(0)}
        >
          today
        </Button>
        <Button
          color="blue"
          overrideStyles={styles}
          onClickCallback={() => daysFromToday(1)}
        >
          -1
        </Button>
        <Button
          color="blue"
          overrideStyles={styles}
          onClickCallback={() => daysFromToday(2)}
        >
          -2
        </Button>
        <Button
          color="blue"
          overrideStyles={styles}
          onClickCallback={() => daysFromToday(3)}
        >
          -3
        </Button>
      </div>
    </div>
  );
}
