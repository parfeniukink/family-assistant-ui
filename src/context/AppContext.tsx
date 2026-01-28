import { UserProvider } from "./IdentityContext";
import { EquityProvider } from "./EquityContext";
import { CurrencyProvider } from "./CurrenciesContext";
import { CostCategoryProvider } from "./CostCategoriesContext";
import { CostShortcutsProvider } from "./CostShortcutsContext";
import { TransactionsProvider } from "./TransactionsContext";
import { MobileProvider } from "./MobileContext";

// Core providers needed for all routes (authentication, viewport)
export function CoreProviders({ children }: { children: React.ReactNode }) {
  return (
    <MobileProvider>
      <UserProvider>{children}</UserProvider>
    </MobileProvider>
  );
}

// Data providers needed only for finance-related routes
export function DataProviders({ children }: { children: React.ReactNode }) {
  return (
    <CoreProviders>
      <EquityProvider>
        <CurrencyProvider>
          <CostCategoryProvider>
            <CostShortcutsProvider>
              <TransactionsProvider>{children}</TransactionsProvider>
            </CostShortcutsProvider>
          </CostCategoryProvider>
        </CurrencyProvider>
      </EquityProvider>
    </CoreProviders>
  );
}
