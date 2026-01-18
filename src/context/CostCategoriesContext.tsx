import React, { createContext, useContext, useEffect, useState } from "react";
import type { CostCategory } from "../data/types";
import { costCategoriesList } from "../data/api/client";

type CostCategoryContextState = {
  categories: CostCategory[];
  categoriesLoading: boolean;
  refresh: () => Promise<void>;
};

const CostCategoryContext = createContext<CostCategoryContextState | undefined>(
  undefined,
);

export const CostCategoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [categories, setCategories] = useState<CostCategory[]>(() => {
    const stored = localStorage.getItem("costCategories");
    return stored ? JSON.parse(stored) : [];
  });
  const [categoriesLoading, setLoading] = useState(categories.length === 0);

  const fetchCategories = async () => {
    setLoading(true);
    const response = await costCategoriesList(); // Adjust to your API and response shape
    // Assume response.result is CostCategory[]
    const rawCategories: CostCategory[] = response.result;
    // Remove duplicates by id
    const uniqueCategories: CostCategory[] = Object.values(
      rawCategories.reduce(
        (acc, cat) => {
          acc[cat.id] = cat;
          return acc;
        },
        {} as Record<number, CostCategory>,
      ),
    );
    setCategories(uniqueCategories);
    localStorage.setItem("costCategories", JSON.stringify(uniqueCategories));
    setLoading(false);
  };

  useEffect(() => {
    if (categories.length === 0) fetchCategories();
  }, []);

  return (
    <CostCategoryContext.Provider
      value={{ categories, categoriesLoading, refresh: fetchCategories }}
    >
      {children}
    </CostCategoryContext.Provider>
  );
};

export function useCostCategories() {
  const ctx = useContext(CostCategoryContext);
  if (!ctx)
    throw new Error(
      "useCostCategories must be used within CostCategoryProvider",
    );
  return ctx;
}
