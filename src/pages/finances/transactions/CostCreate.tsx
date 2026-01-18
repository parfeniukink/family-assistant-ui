import { useEffect, useState } from "react";
import {
  useCostCategories,
  useCurrencies,
  useEquities,
  useIdentity,
  useMobile,
} from "src/context";
import { costCreate } from "src/data/api/client";
import toast from "react-hot-toast";
import { type Response } from "src/infrastructure/generic";
import type { Cost } from "src/data/types";
import { prettyMoney } from "src/domain/transactions";
import {
  TextInput,
  DecimalInput,
  Dropdown,
  Datepicker,
  Card,
  Container,
  NoData,
} from "src/components";
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

  // Utils
  function makeNumber(input: string): number {
    const result = input
      .replace(" ", "")
      .replace(/[^0-9.,]+/g, "")
      .replace(",", ".");

    const cleaned = Number(result);

    if (!cleaned) {
      setValue(null);
      throw new Error("Invalid Value. Please try again");
    } else {
      return cleaned;
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
            placeholder="name"
            value={selectedName ?? ""}
            onChangeCallback={(e) => setName(e.target.value)}
          />
          <SnippetsTable
            name="snippets"
            items={snippets}
            onClickCallback={(snippet) => setName(snippet)}
          />
        </div>

        <div className="transaction__items_group">
          <DecimalInput
            placeholder="value"
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
          greenText="save"
          greenCallback={handleSave}
          redText="reset"
          redCallback={handleReset}
        />
      </Card>
    </Container>
  );
}
