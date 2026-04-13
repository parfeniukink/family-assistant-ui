import { Button } from "src/components/Button";
import { TOKENS } from "src/styles/tokens";

type ActionButtonsProps = {
  redCallback: () => void;
  redText: string;
  greenCallback: () => void;
  greenText: string;
};

export function ActionButtons({
  redCallback,
  redText,
  greenCallback,
  greenText,
}: ActionButtonsProps) {
  return (
    <div style={{ display: "flex", gap: TOKENS.SPACE_2 }}>
      <Button
        color="red"
        onClickCallback={redCallback}
        overrideStyles={{
          minHeight: "75px",
          fontSize: "1.15rem",
          fontWeight: 700,
        }}
      >
        {redText}
      </Button>
      <Button
        color="green"
        onClickCallback={greenCallback}
        overrideStyles={{
          minHeight: "75px",
          fontSize: "1.15rem",
          fontWeight: 700,
        }}
      >
        {greenText}
      </Button>
    </div>
  );
}
