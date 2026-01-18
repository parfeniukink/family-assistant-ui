import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import type { OperationType, Transaction } from "src/data/types";
import {
  prettyMoney,
  groupTransactionsByDate,
  operationSign,
} from "src/domain/transactions";
import { useMobile, useTransactions } from "src/context";
import TransactionsFiltersForm from "./TransactionsFiltersForm";
import { Container, Card } from "src/components";
import { TOKENS } from "src/styles/tokens";

// TODO: Get transactions from `useTransactions()`
export default function Page() {
  // URL Params
  const { transactions, fetchTransactions, retrieveUrlFromTransaction } =
    useTransactions();
  const [searchParams] = useSearchParams();

  const operation = searchParams.get("operation");
  const currencyId = searchParams.get("currencyId");
  const costCategoryId = searchParams.get("costCategoryId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const period = searchParams.get("period");
  const pattern = searchParams.get("pattern");

  // Context
  const { isMobile } = useMobile();

  // State
  const [onlyMine, _] = useState<boolean>(false);

  useEffect(() => {
    fetchTransactions({
      onlyMine: onlyMine,
      operation: operation ? (operation as OperationType) : null,
      currencyId: currencyId ? Number(currencyId) : null,
      costCategoryId: costCategoryId ? Number(costCategoryId) : null,
      startDate: startDate,
      endDate: endDate,
      period: period,
      pattern: pattern,
    });
  }, []);

  // Derived State
  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(transactions);
  }, [transactions]);

  // returns the DETAIL URL, based on the TRANSACTION

  return (
    <Container>
      <TransactionsFiltersForm currencyId={Number(currencyId) || 0} />
      {/* Outer grid similar to shortcuts-section */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: TOKENS.SPACE_1,
        }}
      >
        {(Object.entries(groupedTransactions) as [string, Transaction[]][]).map(
          ([date, transactions]) => {
            // Step 1: Get unique currencies for this group
            const currencies = Array.from(
              new Set(transactions.map((tx) => tx.currency)),
            );

            // Step 2: Prepare per-currency totals (for each currency, sum income and cost)
            const incomeAndCostByCurrency = currencies.map((currency) => {
              const currencyTxs = transactions.filter(
                (tx) => tx.currency === currency,
              );
              const totalIncome = currencyTxs
                .filter((tx) => tx.operation === "income")
                .reduce((sum, tx) => sum + tx.value, 0);

              const totalCost = currencyTxs
                .filter((tx) => tx.operation === "cost")
                .reduce((sum, tx) => sum + tx.value, 0);

              return { currency, totalIncome, totalCost };
            });

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
                    fontSize: "medium",
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
                            fontSize: "x-small",
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
                      fontSize: "x-small",
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
                                }
                              : {
                                  display: "flex",
                                  justifyContent: "space-between",
                                  color: TOKENS.ACCENT_GREEN,
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
    </Container>
  );
}
