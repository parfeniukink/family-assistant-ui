import * as React from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { RequireAuth } from "src/components/RequireAuth";
import { CoreProviders, DataProviders } from "src/context/AppContext";

const Authentication = React.lazy(() => import("./pages/Authentication"));

const FinancesDashboard = React.lazy(
  () => import("./pages/finances/Dashboard"),
);
const Assets = React.lazy(() => import("./pages/finances/Assets"));
const Cash = React.lazy(() => import("./pages/finances/Cash"));
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

// Layout for public routes (auth page)
function PublicLayout() {
  return (
    <CoreProviders>
      <Outlet />
    </CoreProviders>
  );
}

// Layout for all authenticated routes — mounted ONCE, persists across navigation
function AuthenticatedLayout() {
  return (
    <DataProviders>
      <RequireAuth>
        <React.Suspense
          fallback={<div className="page-loading">Loading...</div>}
        >
          <Outlet />
        </React.Suspense>
      </RequireAuth>
    </DataProviders>
  );
}

export const router = createBrowserRouter([
  // ─────────────────────────────────────────────────────────
  // Public routes
  // ─────────────────────────────────────────────────────────
  {
    element: <PublicLayout />,
    children: [{ path: "/auth", element: <Authentication /> }],
  },
  // ─────────────────────────────────────────────────────────
  // Protected routes — DataProviders mounted once via layout
  // ─────────────────────────────────────────────────────────
  {
    element: <AuthenticatedLayout />,
    children: [
      { index: true, element: <Navigate to="/finances" replace /> },
      { path: "finances", element: <FinancesDashboard /> },
      { path: "finances/transactions", element: <Transactions /> },
      { path: "finances/transactions/costs", element: <CostCreate /> },
      { path: "finances/transactions/costs/:costId", element: <Cost /> },
      { path: "finances/transactions/incomes", element: <IncomeCreate /> },
      {
        path: "finances/transactions/incomes/:incomeId",
        element: <Income />,
      },
      { path: "finances/transactions/exchange", element: <ExchangeCreate /> },
      {
        path: "finances/transactions/exchange/:exchangeId",
        element: <Exchange />,
      },
      { path: "finances/assets", element: <Assets /> },
      { path: "finances/cash", element: <Cash /> },
      { path: "analytics", element: <Insights /> },
      { path: "settings", element: <Settings /> },
      { path: "news", element: <News /> },
    ],
  },
]);
