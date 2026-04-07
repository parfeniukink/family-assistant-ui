import { Link, useNavigate } from "react-router-dom";
import { prettyMoney, operationSign } from "src/domain/transactions";
import {
  useIdentity,
  useEquities,
  useNotifications,
  useTransactions,
  useMobile,
} from "src/context";
import { NoData, Card, Button } from "src/components";
import { TOKENS } from "src/styles/tokens";
import { useEffect } from "react";

export function EquitySection() {
  const { equities } = useEquities();
  const { user } = useIdentity();
  const { openNotifications } = useNotifications();
  const { transactions, fetchTransactions, retrieveUrlFromTransaction } =
    useTransactions();
  const { isMobile } = useMobile();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions({ limit: 5 });
  }, []);

  const recent = transactions.slice(0, 5);

  const defaultButtonStyles: React.CSSProperties = {
    minHeight: "3.5rem",
    fontSize: "1rem",
    fontWeight: 700,
    padding: `${TOKENS.SPACE_2} ${TOKENS.SPACE_4}`,
  };

  if (!user || !equities) {
    return <NoData />;
  }

  return (
    <Card style={{ width: "100%", border: "none" }}>
      {/* Desktop: equity left, recent right. Mobile: stacked */}
      <div
        style={
          isMobile
            ? { display: "flex", flexDirection: "column", gap: TOKENS.SPACE_2 }
            : { display: "flex", gap: TOKENS.SPACE_4, alignItems: "center" }
        }
      >
        {/* Equity rows */}
        <div style={{ flex: 1 }}>
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
                    ? "1px solid rgba(26, 18, 10, 0.15)"
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
        </div>

        {/* Vertical divider (desktop) / horizontal (mobile) */}
        {!isMobile ? (
          <div
            style={{
              width: "1px",
              background: "rgba(26, 18, 10, 0.15)",
              alignSelf: "stretch",
              flexShrink: 0,
            }}
          />
        ) : (
          <hr
            style={{
              width: "100%",
              margin: 0,
              borderTop: "1px solid rgba(26, 18, 10, 0.15)",
            }}
          />
        )}

        {/* Recent transactions */}
        <div style={{ flex: 1, textAlign: "left" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: TOKENS.SPACE_1,
            }}
          >
            <span
              style={{
                fontSize: TOKENS.FONT_SM,
                fontWeight: 700,
                color: TOKENS.INK_GHOST,
                letterSpacing: "0.08em",
              }}
            >
              RECENT
            </span>
            <Link
              to="/finances/transactions"
              className="equity-link"
              style={{ color: TOKENS.INK_FADED, fontSize: TOKENS.FONT_SM, fontWeight: 600 }}
            >
              view all
            </Link>
          </div>
          {recent.map((item) => (
            <Link
              key={item.id}
              to={retrieveUrlFromTransaction(item)}
              style={{ display: "block" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.3rem 0",
                  fontSize: TOKENS.FONT_SM,
                  color:
                    item.operation === "income"
                      ? TOKENS.ACCENT_GREEN
                      : item.operation === "exchange"
                        ? TOKENS.ACCENT_BLUE
                        : TOKENS.INK_FADED,
                  fontWeight: item.operation === "income" ? 700 : 600,
                }}
              >
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {operationSign(item)} {item.name}
                </span>
                <span style={{ flexShrink: 0, marginLeft: "0.5rem" }}>
                  {item.currency} {prettyMoney(item.value)}
                </span>
              </div>
            </Link>
          ))}
          {recent.length === 0 && (
            <span
              style={{
                color: TOKENS.INK_GHOST,
                fontStyle: "italic",
                fontSize: TOKENS.FONT_SM,
              }}
            >
              No transactions yet
            </span>
          )}
        </div>
      </div>

      <div style={{ marginTop: TOKENS.SPACE_3 }} />

      {/* Action buttons — full width row */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: TOKENS.SPACE_2,
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

      <div style={{ marginTop: TOKENS.SPACE_2 }} />

      {/* Quick links */}
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
        <Link
          to="/finances/assets"
          className="equity-link"
          style={{
            color: TOKENS.INK_LIGHT,
            padding: isMobile ? "0 0.75rem" : `0 ${TOKENS.SPACE_4}`,
          }}
        >
          ASSETS
        </Link>
        <span style={{ color: "rgba(26, 18, 10, 0.25)" }}>|</span>
        <Link
          to="/finances/cash"
          className="equity-link"
          style={{
            color: TOKENS.INK_LIGHT,
            padding: isMobile ? "0 0.75rem" : `0 ${TOKENS.SPACE_4}`,
          }}
        >
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
          style={{
            color: TOKENS.INK_LIGHT,
            padding: isMobile ? "0 0.75rem" : `0 ${TOKENS.SPACE_4}`,
          }}
        >
          ALERTS
        </Link>
      </div>
    </Card>
  );
}
