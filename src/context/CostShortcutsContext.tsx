import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
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
import { useIdentity } from "./IdentityContext";

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

export function CostShortcutsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useIdentity();
  const [costShortcuts, setCostShortcuts] = useState<CostShortcut[]>([]);

  const loadShortcuts = useCallback(async () => {
    if (!user) return;
    const response: ResponseMulti<CostShortcut> = await costShortcutsList();
    const sorted = response.result
      .slice()
      .sort((a, b) => (a.ui?.positionIndex ?? 0) - (b.ui?.positionIndex ?? 0));
    setCostShortcuts(sorted);
  }, [user]);

  const createShortcut = useCallback(async (data: CostShortcutCreateRequestBody) => {
    try {
      const response = await costShortcutCreate(data);
      setCostShortcuts((prev) => [...prev, response.result]);
    } catch (error) {
      await loadShortcuts();
      throw error;
    }
  }, [loadShortcuts]);

  const removeShortcut = useCallback(async (shortcutId: number) => {
    setCostShortcuts((prev) => {
      const filtered = prev.filter((s) => s.id !== shortcutId);
      // Store previous state for rollback via closure over prev
      return filtered;
    });

    try {
      await costShortcutDelete(shortcutId);
    } catch (error) {
      // On error, reload from server to ensure consistency
      await loadShortcuts();
      throw error;
    }
  }, [loadShortcuts]);

  const updateShortcutsOrder = useCallback(async (shortcuts: CostShortcut[]) => {
    try {
      await updateCostShortcutsOrder(shortcuts);
      setCostShortcuts(shortcuts);
    } catch {
      loadShortcuts();
    }
  }, [loadShortcuts]);

  useEffect(() => {
    if (user) {
      loadShortcuts();
    }
  }, [user, loadShortcuts]);

  const value = useMemo(
    () => ({
      costShortcuts,
      createShortcut,
      updateShortcutsOrder,
      reloadShortcuts: loadShortcuts,
      removeShortcut,
    }),
    [costShortcuts, createShortcut, updateShortcutsOrder, loadShortcuts, removeShortcut],
  );

  return (
    <CostShortcutsContext.Provider value={value}>
      {children}
    </CostShortcutsContext.Provider>
  );
}

export function useCostShortcuts() {
  const ctx = useContext(CostShortcutsContext);
  if (!ctx)
    throw new Error(
      "useCostShortcuts must be used within CostShortcutsProvider",
    );
  return ctx;
}
