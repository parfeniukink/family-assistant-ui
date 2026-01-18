import { Button } from "src/components";
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
    <div style={{ display: "flex", gap: TOKENS.SPACE_1 }}>
      <Button
        color="red"
        onClickCallback={redCallback}
        overrideStyles={{
          minHeight: "75px",
          fontSize: "large",
          fontWeight: "bold",
        }}
      >
        {redText}
      </Button>
      <Button
        color="green"
        onClickCallback={greenCallback}
        overrideStyles={{
          minHeight: "75px",
          fontSize: "large",
          fontWeight: "bold",
        }}
      >
        {greenText}
      </Button>
    </div>
  );
}
