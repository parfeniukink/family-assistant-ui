import React, { createContext, useContext, useState, useEffect } from "react";
import {
  costShortcutCreate,
  costShortcutDelete,
  costShortcutsList,
  updateCostShortcutsOrder,
} from "../data/api/client";
import type {
  CostShortcut,
  CostShortcutCreateRequestBody,
} from "../data/types";
import type { ResponseMulti } from "src/infrastructure/generic";

type CostShortcutsContextType = {
  costShortcuts: CostShortcut[];
  createShortcut: (data: CostShortcutCreateRequestBody) => Promise<void>;
  updateShortcutsOrder: (shortcuts: CostShortcut[]) => Promise<void>;
  reloadShortcuts: () => Promise<void>;
  removeShortcut: (shortcutId: number) => Promise<void>;
};

const CostShortcutsContext = createContext<
  CostShortcutsContextType | undefined
>(undefined);

export const CostShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [costShortcuts, setCostShortcuts] = useState<CostShortcut[]>([]);

  const loadShortcuts = async () => {
    const response: ResponseMulti<CostShortcut> = await costShortcutsList();
    setCostShortcuts(response.result);
  };

  const createShortcut = async (data: CostShortcutCreateRequestBody) => {
    try {
      const response = await costShortcutCreate(data);
      // Optimistic update: add new shortcut to local state instead of refetching
      setCostShortcuts((prev) => [...prev, response.result]);
    } catch (error) {
      // On error, reload to ensure consistency
      await loadShortcuts();
      throw error;
    }
  };

  const removeShortcut = async (shortcutId: number) => {
    // Optimistic update: remove from local state immediately
    const previousShortcuts = costShortcuts;
    setCostShortcuts((prev) => prev.filter((s) => s.id !== shortcutId));

    try {
      await costShortcutDelete(shortcutId);
    } catch (error) {
      // On error, rollback to previous state
      setCostShortcuts(previousShortcuts);
      throw error;
    }
  };

  const updateShortcutsOrder = async (shortcuts: CostShortcut[]) => {
    try {
      await updateCostShortcutsOrder(shortcuts);
      setCostShortcuts(shortcuts);
    } catch (error) {
      loadShortcuts();
    }
  };

  useEffect(() => {
    loadShortcuts();
  }, []);

  return (
    <CostShortcutsContext.Provider
      value={{
        costShortcuts: costShortcuts,
        createShortcut,
        updateShortcutsOrder,
        reloadShortcuts: loadShortcuts,
        removeShortcut,
      }}
    >
      {children}
    </CostShortcutsContext.Provider>
  );
};

export function useCostShortcuts() {
  const ctx = useContext(CostShortcutsContext);
  if (!ctx)
    throw new Error(
      "useCostShortcuts must be used within CostShortcutsProvider",
    );
  return ctx;
}
