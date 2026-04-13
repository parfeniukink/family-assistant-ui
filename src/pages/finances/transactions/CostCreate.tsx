import { useEffect, useState } from "react";
import { useCostCategories } from "src/context/CostCategoriesContext";
import { useCurrencies } from "src/context/CurrenciesContext";
import { useEquities } from "src/context/EquityContext";
import { useIdentity } from "src/context/IdentityContext";
import { useMobile } from "src/context/MobileContext";
import { costCreate } from "src/data/api/transactions";
import toast from "react-hot-toast";
import { type Response } from "src/infrastructure/generic";
import { makeNumber } from "src/domain/validation";
import type { Cost } from "src/data/types";
import { prettyMoney } from "src/domain/transactions";
import { TextInput } from "src/components/TextInput";
import { DecimalInput } from "src/components/DecimalInput";
import { Dropdown } from "src/components/Dropdown";
import { Datepicker } from "src/components/Datepicker";
import { Card } from "src/components/Card";
import { Container } from "src/components/Container";
import { NoData } from "src/components/NoData";
import { ActionButtons, SnippetsTable } from "./shared";

export default function Page() {
  const { isMobile } = useMobile();
  const { user } = useIdentity();
  const { categories } = useCostCategories();
  const { currencies } = useCurrencies();
  const { refreshEquity } = useEquities();

  const snippets: string[] = user?.configuration.costSnippets ?? [];

  const today = new Date().toISOString().slice(0, 10);
  const defaultCurrencyId: number | null = user?.configuration.defaultCurrency
    ? user?.configuration.defaultCurrency.id
    : null;
  const defaultCategoryId: number | null = user?.configuration
    .defaultCostCategory
    ? user?.configuration.defaultCostCategory.id
    : null;

  // UI State
  const [selectedDate, setDate] = useState<string>(today);
  const [selectedName, setName] = useState<string | null>(null);
  const [selectedValue, setValue] = useState<string | null>(null);
  const [selectedCurrencyId, setCurrencyId] = useState<number | null>(null);
  const [selectedCostCategoryId, setCostCategoryId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (user) {
      setCurrencyId(defaultCurrencyId);
      setCostCategoryId(defaultCategoryId);
    }
  }, []);

  // Action Buttons
  function handleReset() {
    setValue(null);
    setName(null);
    setCostCategoryId(defaultCategoryId);
  }

  async function handleSave() {
    if (
      !selectedValue ||
      !selectedName ||
      !selectedDate ||
      !selectedCurrencyId ||
      !selectedCostCategoryId
    ) {
      toast.error("Information not provided");
    } else {
      try {
        const response: Response<Cost> = await costCreate({
          name: selectedName,
          value: makeNumber(selectedValue ?? "0"),
          timestamp: selectedDate,
          currencyId: selectedCurrencyId,
          categoryId: selectedCostCategoryId,
        });
        const cost = response.result;
        handleReset();
        refreshEquity();
        toast.success(
          `Saved ${cost.name} ${prettyMoney(cost.value)}${cost.currency.sign}`,
        );
      } catch (error) {
        toast.error(`${error}`);
      }
    }
  }

  // HTML Representation
  if (!categories || !currencies) {
    return (
      <Container>
        <NoData />
      </Container>
    );
  }
  return (
    <Container>
      <Card
        style={
          isMobile
            ? {
                marginTop: "5%",
              }
            : {
                margin: "0 20%",
              }
        }
      >
        <h1 style={{ textAlign: "center" }}>Cost</h1>

        <Datepicker date={selectedDate} setDateCallback={setDate} />

        <Dropdown
          value={String(selectedCostCategoryId) ?? ""}
          onChangeCallback={(event) =>
            setCostCategoryId(Number(event.target.value))
          }
        >
          {categories.map((item) => (
            <option value={item.id} key={item.id}>
              {item.name}
            </option>
          ))}
        </Dropdown>

        <div className="transaction__items_group">
          <TextInput
            placeholder="Name"
            value={selectedName ?? ""}
            onChangeCallback={(e) => setName(e.target.value)}
          />
          <SnippetsTable
            name="Snippets"
            items={snippets}
            onClickCallback={(snippet) => setName(snippet)}
          />
        </div>

        <div className="transaction__items_group">
          <DecimalInput
            placeholder="Value"
            onChangeCallback={(event) => {
              setValue(event.target.value);
            }}
            value={selectedValue ?? ""}
          />
          <Dropdown
            value={String(selectedCurrencyId) ?? ""}
            onChangeCallback={(event) =>
              setCurrencyId(Number(event.target.value))
            }
          >
            {currencies.map((item) => (
              <option value={item.id} key={item.id}>
                {item.sign}
              </option>
            ))}
          </Dropdown>
        </div>

        <ActionButtons
          greenText="Save"
          greenCallback={handleSave}
          redText="Reset"
          redCallback={handleReset}
        />
      </Card>
    </Container>
  );
}
