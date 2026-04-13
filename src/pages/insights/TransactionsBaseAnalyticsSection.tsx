import React from "react";
import { Link } from "react-router-dom";
import { Card } from "src/components/Card";
import { useMobile } from "src/context/MobileContext";
import type { Filters, TransactionsBasicAnalytics } from "src/data/types";
import { prettyMoney } from "src/domain/transactions";
import { TOKENS } from "src/styles/tokens";

const STYLES: { [key: string]: React.CSSProperties } = {
  flexBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  costs: {
    padding: "0.4rem 0.5rem",
    color: TOKENS.ACCENT_RED,
    fontWeight: 600,
    borderBottom: "1px solid rgba(26, 18, 10, 0.2)",
  },
  incomes: {
    padding: "0.4rem 0.5rem",
    color: TOKENS.ACCENT_GREEN,
    fontWeight: 600,
    borderBottom: "1px solid rgba(26, 18, 10, 0.2)",
  },
  exchange: {
    padding: "0.4rem 0.5rem",
    color: TOKENS.ACCENT_BLUE,
    fontWeight: 600,
    borderBottom: "1px solid rgba(26, 18, 10, 0.2)",
  },
  flexBox: {
    padding: "0.4rem 0.5rem",
    borderBottom: "1px solid rgba(26, 18, 10, 0.2)",
  },
  ratioGood: {
    background: TOKENS.BG_GREEN,
    borderLeft: `4px solid ${TOKENS.ACCENT_GREEN}`,
    color: TOKENS.INK,
    fontWeight: 700,
  },
  ratioBad: {
    background: TOKENS.BG_RED,
    borderLeft: `4px solid ${TOKENS.ACCENT_RED}`,
    color: TOKENS.INK,
    fontWeight: 700,
  },
};

export default function Component({
  title,
  analytics,
  totalRatio,
  filters,
}: {
  title: string;
  analytics: TransactionsBasicAnalytics[];
  totalRatio: number;
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
              width: "100%",
              margin: 0,
              padding: TOKENS.SPACE_2,
            }
      }
    >
      <h3 style={{ margin: 0, fontSize: "1.15rem" }}>{title}</h3>
      {/* Unified Total Ratio (cross-currency) */}
      <div
        style={{
          ...STYLES.flexBetween,
          ...STYLES.flexBox,
          ...(totalRatio < 100 ? STYLES.ratioGood : STYLES.ratioBad),
          marginTop: TOKENS.SPACE_2,
          marginBottom: TOKENS.SPACE_2,
        }}
      >
        <p style={{ margin: 0 }}>TOTAL RATIO:</p>
        <p style={{ margin: 0 }}>{totalRatio} %</p>
      </div>
      {analytics.map((item) => (
        <React.Fragment key={item.currency.id}>
          <div
            style={{
              margin: 0,
            }}
          >
            <h1 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
              [ {item.currency.name} ]
            </h1>
            <hr
              style={{
                borderTop: "1px solid",
                width: "100%",
                margin: "0 0 1rem 0",
              }}
            />
            <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
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
                  <p style={{ margin: 0, color: TOKENS.ACCENT_RED }}>COSTS:</p>
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
                  <p style={{ margin: 0, color: TOKENS.ACCENT_GREEN }}>INCOMES:</p>
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
                  <p style={{ margin: 0, color: TOKENS.ACCENT_BLUE }}>
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
              {/* Cost Categories */}
              {item.costs.categories && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: TOKENS.SPACE_2,
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
                          padding: "0.3rem 0",
                          borderBottom: "1px solid rgba(26, 18, 10, 0.2)",
                        }}
                      >
                        <p style={{ margin: 0, padding: 0 }}>
                          {category.name}
                          <span
                            style={{
                              color: TOKENS.INK,
                              fontSize: "1rem",
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
