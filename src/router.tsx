import * as React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "src/components";

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
  { path: "/auth", element: <Authentication /> },
  // ─────────────────────────────────────────────────────────
  // Protected routes
  // ─────────────────────────────────────────────────────────
  {
    path: "/",
    element: (
      <RequireAuth>
        <Navigate to="/finances" replace />
      </RequireAuth>
    ),
  },
  // Costs
  {
    path: "/finances",
    element: (
      <RequireAuth>
        <FinancesDashboard />
      </RequireAuth>
    ),
  },
  {
    path: "/finances/transactions",
    element: (
      <RequireAuth>
        <Transactions />
      </RequireAuth>
    ),
  },
  {
    path: "/finances/transactions/costs",
    element: (
      <RequireAuth>
        <CostCreate />
      </RequireAuth>
    ),
  },
  {
    path: "/finances/transactions/costs/:costId",
    element: (
      <RequireAuth>
        <Cost />
      </RequireAuth>
    ),
  },
  {
    path: "/finances/transactions/incomes",
    element: (
      <RequireAuth>
        <IncomeCreate />
      </RequireAuth>
    ),
  },
  {
    path: "/finances/transactions/incomes/:incomeId",
    element: (
      <RequireAuth>
        <Income />
      </RequireAuth>
    ),
  },
  {
    path: "/finances/transactions/exchange",
    element: (
      <RequireAuth>
        <ExchangeCreate />
      </RequireAuth>
    ),
  },
  {
    path: "/finances/transactions/exchange/:exchangeId",
    element: (
      <RequireAuth>
        <Exchange />
      </RequireAuth>
    ),
  },
  {
    path: "/finances/assets",
    element: (
      <RequireAuth>
        <Assets />
      </RequireAuth>
    ),
  },
  {
    path: "/finances/cash",
    element: (
      <RequireAuth>
        <Cash />
      </RequireAuth>
    ),
  },
  {
    path: "/insights",
    element: (
      <RequireAuth>
        <Insights />
      </RequireAuth>
    ),
  },
  {
    path: "/settings",
    element: (
      <RequireAuth>
        <Settings />
      </RequireAuth>
    ),
  },
  {
    path: "/news",
    element: (
      <RequireAuth>
        <News />
      </RequireAuth>
    ),
  },
]);
