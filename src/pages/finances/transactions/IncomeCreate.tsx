import { useEffect, useState } from "react";
import { incomeCreate } from "src/data/api/client";
import toast from "react-hot-toast";
import { type Response } from "src/infrastructure/generic";
import type { Income, IncomeSource } from "src/data/types";
import { prettyMoney } from "src/domain/transactions";
import {
  useCurrencies,
  useEquities,
  useIdentity,
  useMobile,
} from "src/context";
import { SnippetsTable, ActionButtons } from "./shared";
import {
  Container,
  Card,
  Datepicker,
  TextInput,
  DecimalInput,
  NoData,
  Dropdown,
} from "src/components";

const incomeSources: IncomeSource[] = ["revenue", "gift", "debt", "other"];

export default function IncomeCreate() {
  const { isMobile } = useMobile();
  const { user } = useIdentity();
  const { refreshEquity } = useEquities();
  const { currencies } = useCurrencies();
  const snippets: string[] = user?.configuration.incomeSnippets ?? [];

  const today = new Date().toISOString().slice(0, 10);
  const defaultCurrencyId = user?.configuration.defaultCurrency?.id ?? null;

  const [selectedDate, setDate] = useState<string>(today);
  const [selectedName, setName] = useState<string | null>(null);
  const [selectedValue, setValue] = useState<string | null>(null);
  const [selectedCurrencyId, setCurrencyId] = useState<number | null>(null);
  const [selectedSource, setSource] = useState<IncomeSource>("revenue");

  useEffect(() => {
    if (user) setCurrencyId(defaultCurrencyId);
  }, []);

  function handleReset() {
    setValue(null);
    setName(null);
    setSource("revenue");
  }

  async function handleSave() {
    if (
      !selectedValue ||
      !selectedName ||
      !selectedDate ||
      !selectedCurrencyId ||
      !selectedSource
    ) {
      toast.error("information not provided");
      return;
    }
    try {
      const response: Response<Income> = await incomeCreate({
        name: selectedName,
        value: makeNumber(selectedValue ?? "0"),
        source: selectedSource,
        timestamp: selectedDate,
        currencyId: selectedCurrencyId,
      });
      const income = response.result;
      handleReset();
      refreshEquity();
      toast.success(
        `saved ${income.name} ${prettyMoney(income.value)}${income.currency.sign}`,
      );
    } catch (error) {
      toast.error(`${error}`);
    }
  }

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

  if (!currencies || !user) {
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
                margin: "10% 0",
              }
            : {
                margin: "0 20%",
              }
        }
      >
        <h1 style={{ textAlign: "center" }}>Income</h1>
        <Datepicker date={selectedDate} setDateCallback={setDate} />
        <Dropdown
          value={selectedSource}
          onChangeCallback={(e) => setSource(e.target.value as IncomeSource)}
        >
          {incomeSources.map((src) => (
            <option value={src} key={src}>
              {src}
            </option>
          ))}
        </Dropdown>
        <div className="transaction__items_group">
          <TextInput
            value={selectedName || ""}
            placeholder="name"
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
            onChangeCallback={(e) => setValue(e.target.value)}
            value={selectedValue ?? ""}
          />
          <Dropdown
            value={String(selectedCurrencyId) ?? ""}
            onChangeCallback={(e) => setCurrencyId(Number(e.target.value))}
          >
            {currencies.map((item) => (
              <option value={item.id} key={item.id}>
                {item.sign}
              </option>
            ))}
          </Dropdown>
        </div>

        {/* Transaction Action Buttons*/}
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
