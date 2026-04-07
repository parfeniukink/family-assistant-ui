import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import type { CostCategory } from "../data/types";
import { costCategoriesList } from "../data/api/client";
import { useIdentity } from "./IdentityContext";

type CostCategoryContextState = {
  categories: CostCategory[];
  categoriesLoading: boolean;
  refresh: () => Promise<void>;
};

const CostCategoryContext = createContext<CostCategoryContextState | undefined>(
  undefined
);

export function CostCategoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useIdentity();
  const [categories, setCategories] = useState<CostCategory[]>(() => {
    const stored = localStorage.getItem("costCategories");
    return stored ? JSON.parse(stored) : [];
  });
  const [categoriesLoading, setLoading] = useState(categories.length === 0);

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const response = await costCategoriesList();
    const rawCategories: CostCategory[] = response.result;
    const uniqueCategories: CostCategory[] = Object.values(
      rawCategories.reduce(
        (acc, cat) => {
          acc[cat.id] = cat;
          return acc;
        },
        {} as Record<number, CostCategory>
      )
    );
    setCategories(uniqueCategories);
    localStorage.setItem("costCategories", JSON.stringify(uniqueCategories));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCategories();
    } else {
      setCategories([]);
    }
  }, [user, fetchCategories]);

  const value = useMemo(
    () => ({ categories, categoriesLoading, refresh: fetchCategories }),
    [categories, categoriesLoading, fetchCategories],
  );

  return (
    <CostCategoryContext.Provider value={value}>
      {children}
    </CostCategoryContext.Provider>
  );
}

export function useCostCategories() {
  const ctx = useContext(CostCategoryContext);
  if (!ctx)
    throw new Error(
      "useCostCategories must be used within CostCategoryProvider",
    );
  return ctx;
}
