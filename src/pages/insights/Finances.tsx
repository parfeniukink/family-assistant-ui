import React, { useCallback, useEffect, useState } from "react";
import {
  fetchBasicAnalyticsByPeriod,
  fetchBasicAnalyticsFiltered,
} from "src/data/api/client";
import type { TransactionsBasicAnalyticsResponse } from "src/data/types/analytics";
import { Button } from "src/components";
import TransactionsBaseAnalyticsSection from "./TransactionsBaseAnalyticsSection";
import { TOKENS } from "src/styles/tokens";
import toast from "react-hot-toast";
import { type Filters } from "src/data/types/transactions";
import { useMobile } from "src/context";

// Types
function AnalyticsFilters({
  filters,
  setFilters,
  onCustomSearch,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onCustomSearch: () => void;
}) {
  const { isMobile } = useMobile();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        justifyContent: "end",
        gap: TOKENS.SPACE_2,
        border: TOKENS.BORDER,
        boxShadow: TOKENS.SHADOW,
        borderRadius: TOKENS.RADIUS,
        marginRight: isMobile ? "" : TOKENS.SPACE_2,
        width: "100%",
        padding: "20px",
      }}
    >
      <h4 style={{ margin: 0 }}>DATES ... RANGE</h4>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <input
          type="date"
          value={filters.startDate || ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              startDate: e.target.value ? e.target.value : "",
            }))
          }
        />
        <p>...</p>
        <input
          type="date"
          value={filters.endDate ?? ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              endDate: e.target.value,
            }))
          }
        />
      </div>
      <div className="">
        <h4 style={{ margin: 0, textAlign: "center" }}>PATTERN</h4>
        <input
          style={{ fontSize: "16px", width: "100%" }}
          type="text"
          value={filters.pattern || ""}
          placeholder="search pattern"
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              pattern: e.target.value ? e.target.value : "",
            }))
          }
        />
      </div>
      <Button
        onClickCallback={onCustomSearch}
        overrideStyles={{ minHeight: "50px", fontSize: "1rem" }}
      >
        search
      </Button>
    </div>
  );
}

// By default the Component provide 2 types of analytics:
// 1. For the current month
// 2. For the last month (previous month)
export default function Component() {
  // Context
  const { isMobile } = useMobile();

  // State
  const [currentMonthAnalytics, setCurrentMonthAnalytics] =
    useState<TransactionsBasicAnalyticsResponse | null>(null);
  const [previousMonthAnalytics, setPreviousMonthAnalytics] =
    useState<TransactionsBasicAnalyticsResponse | null>(null);
  // title, [response, Filters]
  const [customRangeAnalytics, setCustomRangeAnalytics] = useState<
    Record<string, [TransactionsBasicAnalyticsResponse, Filters]>
  >({});
  const [filters, setFilters] = useState<Filters>({
    endDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    Promise.all([
      fetchBasicAnalyticsByPeriod("current-month"),
      fetchBasicAnalyticsByPeriod("previous-month"),
    ])
      .then(([currentMonth, previousMonth]) => {
        if (currentMonth) setCurrentMonthAnalytics(currentMonth);
        if (previousMonth) setPreviousMonthAnalytics(previousMonth);

        if (!previousMonth?.result && !currentMonth?.result)
          throw new Error("no basic analytics");
      })
      .catch((error) => {
        toast.error(`${error}`);
      });
  }, []);

  const handleCustomRange = useCallback(() => {
    if (!filters.startDate || !filters.endDate) {
      toast.error("start date & end date must be specified");
      return;
    }
    fetchBasicAnalyticsFiltered(filters)
      .then((response) => {
        const title = filters.pattern
          ? `${filters.startDate} - ${filters.endDate}, ${filters.pattern}`
          : `${filters.startDate} - ${filters.endDate}`;

        // Persist custom analytics on 'Search' action
        setCustomRangeAnalytics((map) => ({
          ...map,
          [title]: [response, filters],
        }));
      })
      .catch(() => {
        toast.error("Failed to fetch custom analytics");
      });
  }, [filters]);

  // Layout is flex if desktop, col otherwise; naive check
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "center" : "flex-start",
        gap: TOKENS.SPACE_2,
      }}
    >
      {/* Current month */}
      {currentMonthAnalytics && (
        <TransactionsBaseAnalyticsSection
          title="📅 CURRENT MONTH"
          analytics={currentMonthAnalytics.result}
          totalRatio={currentMonthAnalytics.totalRatio}
          filters={{ period: "current-month" }}
        />
      )}
      {/* Previous Month */}
      {previousMonthAnalytics && (
        <TransactionsBaseAnalyticsSection
          title="📅 PREVIOUS MONTH"
          analytics={previousMonthAnalytics.result}
          totalRatio={previousMonthAnalytics.totalRatio}
          filters={{ period: "previous-month" }}
        />
      )}

      {/* Custom Analytics */}
      {Object.entries(customRangeAnalytics).map(
        ([timestamp, [response, filters]]) => (
          <TransactionsBaseAnalyticsSection
            key={timestamp}
            title={`📅 ${timestamp}`}
            analytics={response.result}
            totalRatio={response.totalRatio}
            filters={filters}
          />
        ),
      )}

      <AnalyticsFilters
        filters={filters}
        setFilters={setFilters}
        onCustomSearch={handleCustomRange}
      />
    </div>
  );
}
