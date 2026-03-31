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

  // Context
  const { isMobile } = useMobile();

  // Fetch transactions on mount and when search params change via Filter button
  // The form writes to URL search params; this effect reads them on initial load
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

  // Derived State
  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(transactions);
  }, [transactions]);

  // Pre-compute per-currency totals for each date group (eliminates O(n²) complexity)
  const groupedWithTotals = useMemo(() => {
    return Object.entries(groupedTransactions).map(([date, transactions]) => {
      // Single pass through transactions to compute totals per currency
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

  // returns the DETAIL URL, based on the TRANSACTION

  return (
    <Container>
      <TransactionsFiltersForm />
      {/* Outer grid similar to shortcuts-section */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: TOKENS.SPACE_2,
        }}
      >
        {groupedWithTotals.map(
          ({ date, transactions, incomeAndCostByCurrency }) => {
            return (
              <Card
                style={
                  isMobile
                    ? {
                        background: TOKENS.BG_LIGHTER,
                        padding: "10px",
                        width: "100%",
                      }
                    : {
                        background: TOKENS.BG_LIGHTER,
                        padding: "10px",
                      }
                }
              >
                <div
                  key={date}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    fontSize: "1rem",
                    gap: TOKENS.SPACE_1,
                    minWidth: "250px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {date}
                    {incomeAndCostByCurrency.map(
                      ({ currency, totalIncome, totalCost }) => (
                        <span
                          key={currency}
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            fontSize: "0.85rem",
                          }}
                        >
                          {totalIncome > 0 && (
                            <span style={{ color: "var(--accent-green)" }}>
                              ▲ {currency} {prettyMoney(totalIncome)}
                            </span>
                          )}
                          {totalCost > 0 && (
                            <span style={{ color: "var(--accent-red)" }}>
                              ▼ {currency} {prettyMoney(totalCost)}
                            </span>
                          )}
                        </span>
                      ),
                    )}
                  </h3>

                  <div
                    style={{
                      fontSize: "0.95rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: isMobile ? "7px" : "",
                    }}
                  >
                    {transactions.map((item) => (
                      <Link key={item.id} to={retrieveUrlFromTransaction(item)}>
                        <div
                          style={
                            item.operation !== "income"
                              ? {
                                  display: "flex",
                                  justifyContent: "space-between",
                                  color: item.operation === "exchange" ? "#1456b8" : "#1a120a",
                                }
                              : {
                                  display: "flex",
                                  justifyContent: "space-between",
                                  color: "#1a7a00",
                                  fontWeight: "bold",
                                }
                          }
                        >
                          <div style={{ marginRight: TOKENS.SPACE_3 }}>
                            {operationSign(item)} {item.name}
                          </div>
                          <div style={{ display: "flex", gap: TOKENS.SPACE_1 }}>
                            <div>
                              {item.currency} {prettyMoney(item.value)}
                            </div>
                            <div style={{ color: TOKENS.GRAY }}>
                              {item.user}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </Card>
            );
          },
        )}
      </div>
      {isMobile && <br />}
      {isMobile && <br />}
    </Container>
  );
}
