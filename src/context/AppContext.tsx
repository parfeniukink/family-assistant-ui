import { UserProvider } from "./IdentityContext";
import { EquityProvider } from "./EquityContext";
import { CurrencyProvider } from "./CurrenciesContext";
import { CostCategoryProvider } from "./CostCategoriesContext";
import { CostShortcutsProvider } from "./CostShortcutsContext";
import { TransactionsProvider } from "./TransactionsContext";
import { MobileProvider } from "./MobileContext";

export function AppContext({ children }: { children: React.ReactNode }) {
  return (
    <MobileProvider>
      <UserProvider>
        <EquityProvider>
          <CurrencyProvider>
            <CostCategoryProvider>
              <CostShortcutsProvider>
                <TransactionsProvider>{children}</TransactionsProvider>
              </CostShortcutsProvider>
            </CostCategoryProvider>
          </CurrencyProvider>
        </EquityProvider>
      </UserProvider>
    </MobileProvider>
  );
}
