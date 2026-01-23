import React from "react";
import { Link } from "react-router-dom";
import { Card } from "src/components";
import { useMobile } from "src/context";
import type { Filters, TransactionsBasicAnalytics } from "src/data/types";
import { prettyMoney } from "src/domain/transactions";
import { TOKENS } from "src/styles/tokens";

// Style definitions moved outside component to avoid recreation on every render
const STYLES: { [key: string]: React.CSSProperties } = {
  flexBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  costs: {
    padding: "0.25rem 0.5rem",
    color: "#d68f97",
    borderRadius: TOKENS.RADIUS,
    marginBottom: "0.2rem",
  },
  incomes: {
    padding: "0.25rem 0.5rem",
    color: "#caf492",
    borderRadius: TOKENS.RADIUS,
    marginBottom: "0.2rem",
  },
  exchange: {
    padding: "0.25rem 0.5rem",
    color: "#9bdce8",
    borderRadius: TOKENS.RADIUS,
    marginBottom: "0.2rem",
  },
  flexBox: {
    padding: "0.25rem 0.5rem",
    marginBottom: "0.2rem",
    borderRadius: TOKENS.RADIUS,
  },
  ratioGood: {
    background: TOKENS.BG_GREEN,
    color: TOKENS.WHITE,
  },
  ratioBad: {
    background: TOKENS.BG_RED,
    color: TOKENS.WHITE,
  },
};

export default function Component({
  title,
  analytics,
  filters,
}: {
  title: string;
  analytics: TransactionsBasicAnalytics[];
  filters?: Filters;
}) {
  // State
  const { isMobile } = useMobile();

  // generates transaction page URLs for cost/income/exchange
  function detailCostsUrl(
    currency: { id: number } | null,
    costCategoryId?: number,
  ) {
    let url = `/finances/transactions?operation=cost`;
    if (currency) url += `&currencyId=${currency.id}`;
    if (costCategoryId) url += `&costCategoryId=${costCategoryId}`;
    if (filters) {
      if (filters.startDate) url += `&startDate=${filters.startDate}`;
      if (filters.endDate) url += `&endDate=${filters.endDate}`;
      if (filters.pattern) url += `&pattern=${filters.pattern}`;
      if (filters.period) url += `&period=${filters.period}`;
    }
    return url;
  }
  function detailIncomesUrl(currency: { id: number } | null) {
    let url = "/finances/transactions?operation=income";
    if (currency) url += `&currencyId=${currency.id}`;
    if (filters) {
      if (filters.startDate) url += `&startDate=${filters.startDate}`;
      if (filters.endDate) url += `&endDate=${filters.endDate}`;
      if (filters.pattern) url += `&pattern=${filters.pattern}`;
      if (filters.period) url += `&period=${filters.period}`;
    }
    return url;
  }
  function detailExchangeUrl() {
    let url = "/finances/transactions?operation=exchange";
    if (filters) {
      if (filters.startDate) url += `&startDate=${filters.startDate}`;
      if (filters.endDate) url += `&endDate=${filters.endDate}`;
      if (filters.period) url += `&period=${filters.period}`;
    }
    return url;
  }

  return (
    <Card
      style={
        isMobile
          ? {
              width: "100%",
              padding: "10px",
            }
          : {
              display: "flex",
              flexDirection: "column",
              minWidth: 400,
              maxWidth: 700,
              margin: 0,
              padding: TOKENS.SPACE_1,
            }
      }
    >
      <h3 style={{ margin: 0, fontSize: "large" }}>{title}</h3>
      {analytics.map((item) => (
        <React.Fragment key={item.currency.id}>
          <div
            style={{
              margin: 0,
            }}
          >
            <h1 style={{ margin: 0, fontSize: "medium" }}>
              [ {item.currency.name} ]
            </h1>
            <hr
              style={{
                borderTop: "1px solid",
                width: "100%",
                margin: "0 0 1rem 0",
              }}
            />
            <div style={{ fontSize: "x-small" }}>
              {/* Costs */}
              <Link
                key="costs"
                to={item.costs.total ? detailCostsUrl(item.currency) : ""}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    ...(item.costs.total ? STYLES.costs : STYLES.flexBox),
                  }}
                >
                  <p style={{ margin: 0, color: "#d68f97" }}>COSTS:</p>
                  <p style={{ margin: 0 }}>
                    {`${prettyMoney(item.costs.total)} ${item.currency.sign}`}
                  </p>
                </div>
              </Link>
              {/* Incomes */}
              <Link
                key="incomes"
                to={item.incomes.total ? detailIncomesUrl(item.currency) : "#"}
              >
                <div
                  style={{
                    ...STYLES.flexBetween,
                    ...(item.incomes.total ? STYLES.incomes : STYLES.flexBox),
                  }}
                >
                  <p style={{ margin: 0, color: "#caf492" }}>INCOMES:</p>
                  <p style={{ margin: 0 }}>
                    {`${prettyMoney(item.incomes.total)} ${item.currency.sign}`}
                  </p>
                </div>
              </Link>
              {/* Exchange */}
              <Link
                key="exchange"
                to={item.fromExchanges ? detailExchangeUrl() : ""}
              >
                <div
                  style={{
                    ...STYLES.flexBetween,
                    ...(item.fromExchanges ? STYLES.exchange : STYLES.flexBox),
                  }}
                >
                  <p style={{ margin: 0, color: "#9bdce8" }}>
                    CURRENCY EXCHANGE:
                  </p>
                  {item.fromExchanges > 0 ? (
                    <p style={{ margin: 0 }}>
                      {`+ ${prettyMoney(item.fromExchanges)} ${item.currency.sign}`}
                    </p>
                  ) : (
                    <p style={{ margin: 0 }}>
                      {`${prettyMoney(item.fromExchanges)} ${item.currency.sign}`}
                    </p>
                  )}
                </div>
              </Link>
              {/* Ratio */}
              <div
                style={{
                  ...STYLES.flexBetween,
                  ...STYLES.flexBox,
                  ...(item.totalRatio < 100
                    ? STYLES.ratioGood
                    : STYLES.ratioBad),
                }}
              >
                <p style={{ margin: 0 }}>TOTAL RATIO:</p>
                <p style={{ margin: 0 }}>{item.totalRatio} %</p>
              </div>
              {/* Cost Categories */}
              {item.costs.categories && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: TOKENS.SPACE_1,
                  }}
                >
                  {item.costs.categories.map((category) => (
                    <Link
                      key={category.id}
                      to={detailCostsUrl(item.currency, category.id)}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <p style={{ margin: 0, padding: 0 }}>
                          {category.name}
                          <span
                            style={{
                              color: TOKENS.GRAY,
                              fontSize: "x-small",
                              marginLeft: "5px",
                            }}
                          >
                            ({category.ratio}%)
                          </span>
                        </p>
                        <p style={{ margin: 0 }}>
                          {`${prettyMoney(category.total)} ${item.currency.sign}`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </React.Fragment>
      ))}
    </Card>
  );
}
