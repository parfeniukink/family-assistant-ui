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
      <DataProviders>
        <RequireAuth>
          <Navigate to="/finances" replace />
        </RequireAuth>
      </DataProviders>
    ),
  },
  // Finance routes - require all data providers
  {
    path: "/finances",
    element: (
      <DataProviders>
        <RequireAuth>
          <FinancesDashboard />
        </RequireAuth>
      </DataProviders>
    ),
  },
  {
    path: "/finances/transactions",
    element: (
      <DataProviders>
        <RequireAuth>
          <Transactions />
        </RequireAuth>
      </DataProviders>
    ),
  },
  {
    path: "/finances/transactions/costs",
    element: (
      <DataProviders>
        <RequireAuth>
          <CostCreate />
        </RequireAuth>
      </DataProviders>
    ),
  },
  {
    path: "/finances/transactions/costs/:costId",
    element: (
      <DataProviders>
        <RequireAuth>
          <Cost />
        </RequireAuth>
      </DataProviders>
    ),
  },
  {
    path: "/finances/transactions/incomes",
    element: (
      <DataProviders>
        <RequireAuth>
          <IncomeCreate />
        </RequireAuth>
      </DataProviders>
    ),
  },
  {
    path: "/finances/transactions/incomes/:incomeId",
    element: (
      <DataProviders>
        <RequireAuth>
          <Income />
        </RequireAuth>
      </DataProviders>
    ),
  },
  {
    path: "/finances/transactions/exchange",
    element: (
      <DataProviders>
        <RequireAuth>
          <ExchangeCreate />
        </RequireAuth>
      </DataProviders>
    ),
  },
  {
    path: "/finances/transactions/exchange/:exchangeId",
    element: (
      <DataProviders>
        <RequireAuth>
          <Exchange />
        </RequireAuth>
      </DataProviders>
    ),
  },
  {
    path: "/finances/assets",
    element: (
      <DataProviders>
        <RequireAuth>
          <Assets />
        </RequireAuth>
      </DataProviders>
    ),
  },
  {
    path: "/finances/cash",
    element: (
      <DataProviders>
        <RequireAuth>
          <Cash />
        </RequireAuth>
      </DataProviders>
    ),
  },
  {
    path: "/insights",
    element: (
      <DataProviders>
        <RequireAuth>
          <Insights />
        </RequireAuth>
      </DataProviders>
    ),
  },
  // Settings and News - only need core providers (no data loading)
  {
    path: "/settings",
    element: (
      <DataProviders>
        <RequireAuth>
          <Settings />
        </RequireAuth>
      </DataProviders>
    ),
  },
  {
    path: "/news",
    element: (
      <DataProviders>
        <RequireAuth>
          <News />
        </RequireAuth>
      </DataProviders>
    ),
  },
]);
