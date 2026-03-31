import { Link, useNavigate } from "react-router-dom";
import { prettyMoney } from "src/domain/transactions";
import { useIdentity, useEquities, useNotifications, useMobile } from "src/context";
import { NoData, Card, Button } from "src/components";
import { TOKENS } from "src/styles/tokens";

export function EquitySection() {
  const { equities } = useEquities();
  const { user } = useIdentity();
  const { openNotifications } = useNotifications();
  const { isMobile } = useMobile();
  const navigate = useNavigate();

  const defaultButtonStyles: React.CSSProperties = {
    minHeight: "3.5rem",
    fontSize: "1rem",
    fontWeight: 700,
    padding: `${TOKENS.SPACE_1} ${TOKENS.SPACE_2}`,
  };

  if (!user || !equities) {
    return <NoData />;
  }

  return (
    <Card style={{ width: "100%" }}>
      {/* Equity rows */}
      {equities.map((item, idx) => (
        <Link
          key={item.currency.id}
          to={`/finances/transactions?currencyId=${item.currency.id}`}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.5rem 0",
            borderBottom:
              idx < equities.length - 1
                ? "1px dotted rgba(26, 18, 10, 0.25)"
                : "none",
            fontSize: "1.3rem",
            fontWeight: 700,
            color: TOKENS.INK,
          }}
        >
          <span>{item.currency.name}</span>
          <span>
            {user.configuration.showEquity
              ? `${prettyMoney(item.amount)} ${item.currency.sign}`
              : `x x x ${item.currency.sign}`}
          </span>
        </Link>
      ))}

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: TOKENS.SPACE_1,
          paddingTop: "0.5rem",
        }}
      >
        <Button
          color="green"
          overrideStyles={defaultButtonStyles}
          onClickCallback={() => navigate("/finances/transactions/incomes/")}
        >
          INCOME
        </Button>
        <Button
          color="red"
          overrideStyles={defaultButtonStyles}
          onClickCallback={() => navigate("/finances/transactions/costs/")}
        >
          COST
        </Button>
        <Button
          color="blue"
          overrideStyles={defaultButtonStyles}
          onClickCallback={() => navigate("/finances/transactions/exchange/")}
        >
          EXCHANGE
        </Button>
      </div>

      {/* Divider */}
      <hr
        style={{
          width: "100%",
          margin: "0.5rem 0",
          borderTop: "1px dotted rgba(26, 18, 10, 0.25)",
        }}
      />

      {/* Quick links — centered below buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "0",
          fontSize: isMobile ? "1rem" : "1.2rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          alignItems: "center",
        }}
      >
        <Link to="/finances/assets" className="equity-link" style={{ color: TOKENS.INK_LIGHT, padding: isMobile ? "0 0.75rem" : `0 ${TOKENS.SPACE_2}` }}>
          ASSETS
        </Link>
        <span style={{ color: "rgba(26, 18, 10, 0.25)" }}>|</span>
        <Link to="/finances/cash" className="equity-link" style={{ color: TOKENS.INK_LIGHT, padding: isMobile ? "0 0.75rem" : `0 ${TOKENS.SPACE_2}` }}>
          CASH
        </Link>
        <span style={{ color: "rgba(26, 18, 10, 0.25)" }}>|</span>
        <Link
          to="#"
          className="equity-link"
          onClick={(e) => {
            e.preventDefault();
            openNotifications();
          }}
          style={{ color: TOKENS.INK_LIGHT, padding: isMobile ? "0 0.75rem" : `0 ${TOKENS.SPACE_2}` }}
        >
          ALERTS
        </Link>
        <style>{`.equity-link:hover { text-decoration: underline !important; }`}</style>
      </div>
    </Card>
  );
}
