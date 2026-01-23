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
    const sorted = response.result
      .slice()
      .sort((a, b) => (a.ui?.positionIndex ?? 0) - (b.ui?.positionIndex ?? 0));
    setCostShortcuts(sorted);
  };

  const createShortcut = async (data: CostShortcutCreateRequestBody) => {
    try {
      await costShortcutCreate(data);
      await loadShortcuts();
    } finally {
    }
  };

  const removeShortcut = async (shortcutId: number) => {
    try {
      await costShortcutDelete(shortcutId);
    } finally {
      await loadShortcuts();
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
