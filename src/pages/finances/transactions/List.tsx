import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import type { OperationType } from "src/data/types";
import {
  prettyMoney,
  groupTransactionsByDate,
  operationSign,
} from "src/domain/transactions";
import { useMobile, useTransactions } from "src/context";
import TransactionsFiltersForm from "./TransactionsFiltersForm";
import { Container, Card } from "src/components";
import { TOKENS } from "src/styles/tokens";

export default function Page() {
  const { transactions, fetchTransactions, retrieveUrlFromTransaction } =
    useTransactions();
  const [searchParams] = useSearchParams();
  const { isMobile } = useMobile();

  useEffect(() => {
    const operation = searchParams.get("operation");
    const currencyId = searchParams.get("currencyId");
    const costCategoryId = searchParams.get("costCategoryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const period = searchParams.get("period");
    const pattern = searchParams.get("pattern");
    const onlyMine = searchParams.get("onlyMine");
    const minValue = searchParams.get("minValue");

    fetchTransactions({
      onlyMine: onlyMine === "true",
      operation: operation ? (operation as OperationType) : null,
      currencyId: currencyId ? Number(currencyId) : null,
      costCategoryId: costCategoryId ? Number(costCategoryId) : null,
      startDate: startDate,
      endDate: endDate,
      period: period,
      pattern: pattern,
      minValue: minValue ? Number(minValue) : null,
    });
  }, []);

  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(transactions);
  }, [transactions]);

  const groupedWithTotals = useMemo(() => {
    return Object.entries(groupedTransactions).map(([date, transactions]) => {
      const totals = new Map<
        string,
        { totalIncome: number; totalCost: number }
      >();

      transactions.forEach((tx) => {
        if (!totals.has(tx.currency)) {
          totals.set(tx.currency, { totalIncome: 0, totalCost: 0 });
        }
        const currencyTotals = totals.get(tx.currency)!;
        if (tx.operation === "income") {
          currencyTotals.totalIncome += tx.value;
        } else if (tx.operation === "cost") {
          currencyTotals.totalCost += tx.value;
        }
      });

      const incomeAndCostByCurrency = Array.from(totals.entries()).map(
        ([currency, { totalIncome, totalCost }]) => ({
          currency,
          totalIncome,
          totalCost,
        }),
      );

      return { date, transactions, incomeAndCostByCurrency };
    });
  }, [groupedTransactions]);

  return (
    <Container>
      <TransactionsFiltersForm />

      <div
        style={
          isMobile
            ? { display: "flex", flexDirection: "column", gap: TOKENS.SPACE_2 }
            : {
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: TOKENS.SPACE_2,
                alignItems: "start",
              }
        }
      >
        {groupedWithTotals.map(
          ({ date, transactions, incomeAndCostByCurrency }) => (
            <Card
              key={date}
              style={{
                width: "100%",
                padding: isMobile ? "10px" : TOKENS.SPACE_2,
                gap: TOKENS.SPACE_1,
                textAlign: "left",
              }}
            >
              {/* Date header with daily totals */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: TOKENS.INK,
                  }}
                >
                  {date}
                </h3>
                <div style={{ display: "flex" }}>
                  {incomeAndCostByCurrency.map(
                    ({ currency, totalIncome, totalCost }) => (
                      <span
                        key={currency}
                        style={{
                          display: "flex",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}
                      >
                        {totalIncome > 0 && (
                          <span style={{ color: TOKENS.ACCENT_GREEN }}>
                            &#x25B2; {currency} {prettyMoney(totalIncome)}
                          </span>
                        )}
                        {totalCost > 0 && (
                          <span style={{ color: TOKENS.ACCENT_RED }}>
                            &#x25BC; {currency} {prettyMoney(totalCost)}
                          </span>
                        )}
                      </span>
                    ),
                  )}
                </div>
              </div>

              {/* Transaction rows */}
              {transactions.map((item) => (
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
                      padding: "0.4rem 0",
                      borderBottom: "1px solid rgba(26, 18, 10, 0.15)",
                      fontSize: "0.8rem",
                      color:
                        item.operation === "income"
                          ? TOKENS.ACCENT_GREEN
                          : item.operation === "exchange"
                            ? TOKENS.ACCENT_BLUE
                            : TOKENS.INK,
                      fontWeight: item.operation === "income" ? 700 : 400,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {operationSign(item)} {item.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        flexShrink: 0,
                        alignItems: "center",
                      }}
                    >
                      <span>
                        {item.currency} {prettyMoney(item.value)}
                      </span>
                      <span
                        style={{
                          color: TOKENS.INK_FADED,
                          fontSize: "0.9rem",
                          minWidth: "2rem",
                          textAlign: "right",
                        }}
                      >
                        {item.user}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </Card>
          ),
        )}
      </div>

      {groupedWithTotals.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: TOKENS.SPACE_4,
            color: TOKENS.INK_FADED,
            fontStyle: "italic",
          }}
        >
          ~ No transactions ~
        </div>
      )}

      {isMobile && <br />}
      {isMobile && <br />}
    </Container>
  );
}
