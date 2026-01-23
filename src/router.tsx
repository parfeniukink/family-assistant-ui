import * as React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "src/components";
import { CoreProviders, DataProviders } from "src/context/AppContext";

const Authentication = React.lazy(() => import("./pages/Authentication"));

const FinancesDashboard = React.lazy(
  () => import("./pages/finances/Dashboard"),
);
const Assets = React.lazy(() => import("./pages/finances/Assets"));
const Cash = React.lazy(() => import("./pages/finances/Assets")); // TODO: Change to Cash
const Insights = React.lazy(() => import("./pages/insights/Page"));

const Transactions = React.lazy(
  () => import("./pages/finances/transactions/List"),
);
const CostCreate = React.lazy(
  () => import("./pages/finances/transactions/CostCreate"),
);
const Cost = React.lazy(() => import("./pages/finances/transactions/Cost"));

const IncomeCreate = React.lazy(
  () => import("./pages/finances/transactions/IncomeCreate"),
);
const Income = React.lazy(() => import("./pages/finances/transactions/Income"));

const Exchange = React.lazy(
  () => import("./pages/finances/transactions/Exchange"),
);
const ExchangeCreate = React.lazy(
  () => import("./pages/finances/transactions/ExchangeCreate"),
);

const Settings = React.lazy(() => import("./pages/settings/Page"));
const News = React.lazy(() => import("./pages/News"));

export const router = createBrowserRouter([
  // ─────────────────────────────────────────────────────────
  // Public route
  // ─────────────────────────────────────────────────────────
  {
    path: "/auth",
    element: (
      <CoreProviders>
        <Authentication />
      </CoreProviders>
    ),
  },
  // ─────────────────────────────────────────────────────────
  // Protected routes (with data providers for finance routes)
  // ─────────────────────────────────────────────────────────
  {
    path: "/",
    element: (
      <CoreProviders>
        <RequireAuth>
          <Navigate to="/finances" replace />
        </RequireAuth>
      </CoreProviders>
    ),
  },
  // Finance routes - require all data providers
  {
    path: "/finances",
    element: (
      <CoreProviders>
        <RequireAuth>
          <DataProviders>
            <FinancesDashboard />
          </DataProviders>
        </RequireAuth>
      </CoreProviders>
    ),
  },
  {
    path: "/finances/transactions",
    element: (
      <CoreProviders>
        <RequireAuth>
          <DataProviders>
            <Transactions />
          </DataProviders>
        </RequireAuth>
      </CoreProviders>
    ),
  },
  {
    path: "/finances/transactions/costs",
    element: (
      <CoreProviders>
        <RequireAuth>
          <DataProviders>
            <CostCreate />
          </DataProviders>
        </RequireAuth>
      </CoreProviders>
    ),
  },
  {
    path: "/finances/transactions/costs/:costId",
    element: (
      <CoreProviders>
        <RequireAuth>
          <DataProviders>
            <Cost />
          </DataProviders>
        </RequireAuth>
      </CoreProviders>
    ),
  },
  {
    path: "/finances/transactions/incomes",
    element: (
      <CoreProviders>
        <RequireAuth>
          <DataProviders>
            <IncomeCreate />
          </DataProviders>
        </RequireAuth>
      </CoreProviders>
    ),
  },
  {
    path: "/finances/transactions/incomes/:incomeId",
    element: (
      <CoreProviders>
        <RequireAuth>
          <DataProviders>
            <Income />
          </DataProviders>
        </RequireAuth>
      </CoreProviders>
    ),
  },
  {
    path: "/finances/transactions/exchange",
    element: (
      <CoreProviders>
        <RequireAuth>
          <DataProviders>
            <ExchangeCreate />
          </DataProviders>
        </RequireAuth>
      </CoreProviders>
    ),
  },
  {
    path: "/finances/transactions/exchange/:exchangeId",
    element: (
      <CoreProviders>
        <RequireAuth>
          <DataProviders>
            <Exchange />
          </DataProviders>
        </RequireAuth>
      </CoreProviders>
    ),
  },
  {
    path: "/finances/assets",
    element: (
      <CoreProviders>
        <RequireAuth>
          <DataProviders>
            <Assets />
          </DataProviders>
        </RequireAuth>
      </CoreProviders>
    ),
  },
  {
    path: "/finances/cash",
    element: (
      <CoreProviders>
        <RequireAuth>
          <DataProviders>
            <Cash />
          </DataProviders>
        </RequireAuth>
      </CoreProviders>
    ),
  },
  {
    path: "/insights",
    element: (
      <CoreProviders>
        <RequireAuth>
          <DataProviders>
            <Insights />
          </DataProviders>
        </RequireAuth>
      </CoreProviders>
    ),
  },
  // Settings and News - only need core providers (no data loading)
  {
    path: "/settings",
    element: (
      <CoreProviders>
        <RequireAuth>
          <Settings />
        </RequireAuth>
      </CoreProviders>
    ),
  },
  {
    path: "/news",
    element: (
      <CoreProviders>
        <RequireAuth>
          <News />
        </RequireAuth>
      </CoreProviders>
    ),
  },
]);
