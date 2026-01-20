import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useCurrencies,
  useEquities,
  useIdentity,
  useMobile,
} from "src/context";
import {
  incomeRetrieve,
  incomeUpdate,
  incomeDelete,
} from "src/data/api/client";
import toast from "react-hot-toast";
import type { Income, IncomeSource } from "src/data/types";
import { SnippetsTable, ActionButtons } from "./shared";
import {
  Card,
  Container,
  Datepicker,
  TextInput,
  Dropdown,
  DecimalInput,
  NoData,
} from "src/components";

const incomeSources: IncomeSource[] = ["revenue", "gift", "debt", "other"];

export default function IncomeEdit() {
  const { incomeId } = useParams();
  const navigate = useNavigate();
  const { isMobile } = useMobile();
  const { refreshEquity } = useEquities();

  const { currencies } = useCurrencies();
  const { user } = useIdentity();
  const snippets: string[] = user?.configuration.incomeSnippets ?? [];

  const [income, setIncome] = useState<Income | null>(null);

  const [selectedDate, setDate] = useState<string>("");
  const [selectedName, setName] = useState<string | null>(null);
  const [selectedValue, setValue] = useState<string | null>(null);
  const [selectedSource, setSource] = useState<IncomeSource>("revenue");
  const [selectedCurrencyId, setCurrencyId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchIncome() {
      try {
        const res = await incomeRetrieve(Number(incomeId));
        const inc = res.result;

        setIncome(inc);
        setDate(inc.timestamp.slice(0, 10));
        setName(inc.name);
        setValue(String(inc.value));
        setSource(inc.source);
        setCurrencyId(inc.currency.id);
      } catch (err) {
        toast.error("failed to load income");
        navigate("/finances/transactions/incomes");
      } finally {
      }
    }
    if (incomeId) fetchIncome();
  }, [incomeId, navigate]);

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
      await incomeUpdate(Number(incomeId), {
        name: selectedName,
        value: makeNumber(selectedValue),
        source: selectedSource,
        currencyId: selectedCurrencyId,
        timestamp: selectedDate,
      });
      toast.success("income updated");
      refreshEquity();
      navigate("/finances/transactions/incomes");
    } catch (error) {
      toast.error(`saving failed: ${error}`);
    }
  }

  async function handleDelete() {
    try {
      await incomeDelete(Number(incomeId));
      toast.success("income deleted");
      refreshEquity();
      navigate("/finances/transactions/incomes");
    } catch (error) {
      toast.error(`deleting failed: ${error}`);
    }
  }

  function makeNumber(input: string): number {
    const result = input
      .replace(" ", "")
      .replace(/[^0-9.,]+/g, "")
      .replace(",", ".");
    const cleaned = Number(result);
    if (!cleaned) throw new Error("invalid value");
    return cleaned;
  }

  if (!income) {
    return (
      <Container>
        <NoData />
      </Container>
    );
  }
  if (!income) return null;

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
            value={selectedValue ?? ""}
            onChangeCallback={(e) => setValue(e.target.value)}
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

        <ActionButtons
          greenText="save"
          greenCallback={handleSave}
          redText="delete"
          redCallback={handleDelete}
        />
      </Card>
    </Container>
  );
}
