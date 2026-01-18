import { useNavigate } from "react-router-dom";
import { useMobile } from "src/context";
import { Card, Button } from "src/components";
import { TOKENS } from "src/styles/tokens";

export function ActionsSection() {
  const navigate = useNavigate();
  const { isMobile } = useMobile();

  const defaultButtonStyles: React.CSSProperties = {
    minHeight: "4rem",
    fontSize: "medium",
    fontWeight: 700,
    padding: `${TOKENS.SPACE_1} ${TOKENS.SPACE_2}`,
  };

  return (
    <Card
      style={
        isMobile
          ? {}
          : {
              flexDirection: "row",
              minWidth: "60%",
              gap: TOKENS.SPACE_1,
            }
      }
    >
      <Button
        color="green"
        overrideStyles={defaultButtonStyles}
        onClickCallback={() => {
          navigate("/finances/transactions/incomes/");
        }}
      >
        INCOME
      </Button>
      <Button
        color="red"
        overrideStyles={defaultButtonStyles}
        onClickCallback={() => {
          navigate("/finances/transactions/costs/");
        }}
      >
        COST
      </Button>
      <Button
        color="blue"
        overrideStyles={defaultButtonStyles}
        onClickCallback={() => {
          navigate("/finances/transactions/exchange/");
        }}
      >
        EXCHANGE
      </Button>
    </Card>
  );
}
