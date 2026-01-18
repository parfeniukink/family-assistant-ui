import { useEffect, useState } from "react";
import {
  useCurrencies,
  useCostCategories,
  useIdentity,
  useMobile,
} from "src/context";
import { TOKENS } from "src/styles/tokens";
import ShortcutsReorderSection from "./ShortcutsReorderSection";
import { Dropdown } from "src/components";

export default function Component() {
  const { user, updateConfig } = useIdentity();
  const { currencies } = useCurrencies();
  const { categories } = useCostCategories();
  const { isMobile } = useMobile();

  const config = user?.configuration;

  const [showEquity, setShowEquity] = useState<boolean>(
    config?.showEquity ?? false,
  );
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | null>(
    config?.defaultCurrency?.id ?? null,
  );
  const [selectedCostCategoryId, setSelectedCostCategoryId] = useState<
    number | null
  >(config?.defaultCostCategory?.id ?? null);

  // For threshold, don't update config until blur or Enter
  const [costThreshold, setCostThreshold] = useState<string>(
    config?.notifyCostThreshold != null
      ? String(config.notifyCostThreshold)
      : "",
  );
  const [costThresholdEditing, setCostThresholdEditing] = useState<string>(
    config?.notifyCostThreshold != null
      ? String(config.notifyCostThreshold)
      : "",
  );

  // Snippet management
  const [costSnippets, setCostSnippets] = useState<string[]>(
    config?.costSnippets ?? [],
  );
  const [incomeSnippets, setIncomeSnippets] = useState<string[]>(
    config?.incomeSnippets ?? [],
  );
  const [costSnippetsEdit, setCostSnippetsEdit] = useState<string>(
    (config?.costSnippets ?? []).join("\n"),
  );
  const [incomeSnippetsEdit, setIncomeSnippetsEdit] = useState<string>(
    (config?.incomeSnippets ?? []).join("\n"),
  );

  useEffect(() => {
    if (!user) return;
    setShowEquity(config?.showEquity ?? false);
    setSelectedCurrencyId(config?.defaultCurrency?.id ?? null);
    setSelectedCostCategoryId(config?.defaultCostCategory?.id ?? null);

    const threshold =
      config?.notifyCostThreshold != null
        ? String(config.notifyCostThreshold)
        : "";
    setCostThreshold(threshold);
    setCostThresholdEditing(threshold);

    // Snippets management
    setCostSnippets(config?.costSnippets ?? []);
    setIncomeSnippets(config?.incomeSnippets ?? []);
    setCostSnippetsEdit((config?.costSnippets ?? []).join("\n"));
    setIncomeSnippetsEdit((config?.incomeSnippets ?? []).join("\n"));
  }, [user]);

  function handleThresholdChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCostThresholdEditing(e.target.value);
  }

  async function handleThresholdComplete(value: string) {
    setCostThreshold(value);
    // Accept '' to remove threshold
    if (value === "") {
      await updateConfig({ notifyCostThreshold: null });
    } else if (!isNaN(Number(value))) {
      await updateConfig({ notifyCostThreshold: Number(value) });
    }
  }

  function handleThresholdBlur() {
    if (costThresholdEditing !== costThreshold) {
      handleThresholdComplete(costThresholdEditing);
    }
  }

  function handleThresholdKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  }

  async function handleCostSnippetsBlurOrEnter(
    e?: React.KeyboardEvent | React.FocusEvent,
  ) {
    // Only save if changed
    const editedArr = costSnippetsEdit
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (JSON.stringify(editedArr) !== JSON.stringify(costSnippets)) {
      setCostSnippets(editedArr);
      await updateConfig({ costSnippets: editedArr });
    }
    // Optional: If triggered by Enter, prevent line break
    if (e && "key" in e && e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLTextAreaElement).blur();
    }
  }

  async function handleIncomeSnippetsBlurOrEnter(
    e?: React.KeyboardEvent | React.FocusEvent,
  ) {
    const editedArr = incomeSnippetsEdit
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (JSON.stringify(editedArr) !== JSON.stringify(incomeSnippets)) {
      setIncomeSnippets(editedArr);
      await updateConfig({ incomeSnippets: editedArr });
    }
    if (e && "key" in e && e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLTextAreaElement).blur();
    }
  }

  async function handleCurrencySelection(
    e: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const currencyId = Number(e.target.value);
    setSelectedCurrencyId(currencyId);
    await updateConfig({ defaultCurrencyId: currencyId });
  }

  async function handleCostCategorySelection(
    e: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const catId = Number(e.target.value);
    setSelectedCostCategoryId(catId);
    await updateConfig({ defaultCostCategoryId: catId });
  }

  async function handleShowEquityCheck(e: React.ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked;
    setShowEquity(checked);
    await updateConfig({ showEquity: checked });
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: TOKENS.SPACE_1,
        }}
      >
        {/* Default Currency */}
        <label className="label-items">
          <span>CURRENCY</span>
          <Dropdown
            value={String(selectedCurrencyId) ?? ""}
            onChangeCallback={handleCurrencySelection}
          >
            <option value="" disabled>
              Select Currency
            </option>
            {currencies.map((item) => (
              <option value={item.id} key={item.id}>
                {item.sign} {item.name}
              </option>
            ))}
          </Dropdown>
        </label>
        {/* Default Cost Category */}
        <label className="label-items">
          <span>COST CATEGORY</span>
          <Dropdown
            value={String(selectedCostCategoryId) ?? ""}
            onChangeCallback={handleCostCategorySelection}
          >
            <option value="" disabled>
              Select Category
            </option>
            {categories.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
              </option>
            ))}
          </Dropdown>
        </label>
        {/* Notify Cost Threshold */}
        <label className="label-items">
          <span>NOTIFICATION COST THRESHOLD</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={costThresholdEditing}
            onChange={handleThresholdChange}
            onBlur={handleThresholdBlur}
            onKeyDown={handleThresholdKeyDown}
            placeholder="Enter threshold (number)"
            style={{
              background: "transparent",
              maxWidth: "200px",
              height: "50px",
              fontSize: "medium",
            }}
          />
        </label>
        {/* Show Equity */}
        <label className="label-items">
          <span>SHOW EQUITY</span>
          <input
            type="checkbox"
            checked={showEquity}
            onChange={handleShowEquityCheck}
            className="checkbox"
          />
        </label>
      </div>

      <br />
      <br />

      <div
        style={
          isMobile
            ? {}
            : {
                display: "flex",
                justifyContent: "start",
                gap: TOKENS.SPACE_3,
              }
        }
      >
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: TOKENS.SPACE_1,
            margin: "0.5rem",
            fontWeight: "bold",
          }}
        >
          <span>COST SNIPPETS</span>
          <textarea
            value={costSnippetsEdit}
            onChange={(e) => setCostSnippetsEdit(e.target.value)}
            onBlur={handleCostSnippetsBlurOrEnter}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleCostSnippetsBlurOrEnter(e);
              }
            }}
            placeholder="Add snippets, one per line"
            rows={10}
          />
        </label>
        <label className="settings__label-items">
          <span>INCOME SNIPPETS</span>
          <textarea
            value={incomeSnippetsEdit}
            onChange={(e) => setIncomeSnippetsEdit(e.target.value)}
            onBlur={handleIncomeSnippetsBlurOrEnter}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleIncomeSnippetsBlurOrEnter(e);
              }
            }}
            placeholder="Add snippets, one per line"
            rows={10}
          />
        </label>
      </div>
      <ShortcutsReorderSection />
    </div>
  );
}
