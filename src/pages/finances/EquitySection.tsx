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
    fontSize: "1.1rem",
    fontWeight: 800,
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
            ? { display: "flex", flexDirection: "column", gap: TOKENS.SPACE_1 }
            : { display: "flex", gap: TOKENS.SPACE_4, alignItems: "stretch" }
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
                alignItems: "baseline",
                padding: "0.4rem 0",
                borderBottom:
                  idx < equities.length - 1
                    ? "1px solid rgba(26, 18, 10, 0.2)"
                    : "none",
              }}
            >
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: TOKENS.INK_FADED,
                  letterSpacing: "0.05em",
                }}
              >
                {item.currency.name}
              </span>
              <span
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: "#0a0704",
                  fontFamily: "'IM Fell DW Pica SC', serif",
                }}
              >
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
              width: "2px",
              background: "rgba(26, 18, 10, 0.2)",
              alignSelf: "stretch",
              flexShrink: 0,
            }}
          />
        ) : (
          <hr
            style={{
              width: "100%",
              margin: "0.25rem 0",
              borderTop: "2px solid rgba(26, 18, 10, 0.15)",
            }}
          />
        )}

        {/* Recent transactions */}
        <div style={{ flex: 1, textAlign: "left" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "0.3rem",
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: TOKENS.INK_FADED,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Recent
            </span>
            <Link
              to="/finances/transactions"
              className="equity-link"
              style={{
                color: TOKENS.INK_FADED,
                fontSize: "0.85rem",
                fontWeight: 600,
                fontStyle: "italic",
              }}
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
                  alignItems: "baseline",
                  padding: "0.25rem 0",
                  borderBottom: "1px solid rgba(26, 18, 10, 0.08)",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color:
                      item.operation === "income"
                        ? TOKENS.ACCENT_GREEN
                        : item.operation === "exchange"
                          ? TOKENS.ACCENT_BLUE
                          : TOKENS.INK_LIGHT,
                  }}
                >
                  {operationSign(item)} {item.name}
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    marginLeft: "0.5rem",
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color:
                      item.operation === "income"
                        ? TOKENS.ACCENT_GREEN
                        : item.operation === "exchange"
                          ? TOKENS.ACCENT_BLUE
                          : TOKENS.INK,
                  }}
                >
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

      <div style={{ marginTop: TOKENS.SPACE_2 }} />

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

      <div style={{ marginTop: TOKENS.SPACE_1 }} />

      {/* Quick links */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: isMobile ? "1rem" : "2rem",
          fontSize: isMobile ? "1rem" : "1.15rem",
          fontWeight: 800,
          letterSpacing: "0.1em",
          alignItems: "center",
        }}
      >
        <Link
          to="/finances/assets"
          className="equity-link"
          style={{ color: TOKENS.INK }}
        >
          ASSETS
        </Link>
        <span style={{ color: "rgba(26, 18, 10, 0.3)", fontSize: "0.8em" }}>
          &#x2022;
        </span>
        <Link
          to="/finances/cash"
          className="equity-link"
          style={{ color: TOKENS.INK }}
        >
          CASH
        </Link>
        <span style={{ color: "rgba(26, 18, 10, 0.3)", fontSize: "0.8em" }}>
          &#x2022;
        </span>
        <Link
          to="#"
          className="equity-link"
          onClick={(e) => {
            e.preventDefault();
            openNotifications();
          }}
          style={{ color: TOKENS.INK }}
        >
          ALERTS
        </Link>
      </div>
    </Card>
  );
}
