import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCostCategories } from "src/context/CostCategoriesContext";
import { useCurrencies } from "src/context/CurrenciesContext";
import { useEquities } from "src/context/EquityContext";
import { useIdentity } from "src/context/IdentityContext";
import { useMobile } from "src/context/MobileContext";
import { costRetrieve, costUpdate, costDelete } from "src/data/api/transactions";
import toast from "react-hot-toast";
import { makeNumber } from "src/domain/validation";
import type { Cost } from "src/data/types";
import { ActionButtons, SnippetsTable } from "./shared";
import { Card } from "src/components/Card";
import { Dropdown } from "src/components/Dropdown";
import { TextInput } from "src/components/TextInput";
import { Datepicker } from "src/components/Datepicker";
import { DecimalInput } from "src/components/DecimalInput";
import { Container } from "src/components/Container";
import { NoData } from "src/components/NoData";

export default function CostEdit() {
  const navigate = useNavigate();

  // URL Params
  const { costId } = useParams();

  // Context
  const { isMobile } = useMobile();
  const { refreshEquity } = useEquities();
  const { currencies } = useCurrencies();
  const { categories } = useCostCategories();
  const { user } = useIdentity();
  const snippets: string[] = user?.configuration.costSnippets ?? [];

  // State
  const [cost, setCost] = useState<Cost | null>(null);
  const [selectedDate, setDate] = useState<string>("");
  const [selectedName, setName] = useState<string | null>(null);
  const [selectedValue, setValue] = useState<string | null>(null);
  const [selectedCurrencyId, setCurrencyId] = useState<number | null>(null);
  const [selectedCategoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCost() {
      try {
        const res = await costRetrieve(Number(costId));
        const ct = res.result;

        setCost(ct);
        setDate(ct.timestamp.slice(0, 10));
        setName(ct.name);
        setValue(String(ct.value));
        setCurrencyId(ct.currency.id);
        setCategoryId(ct.category.id);
      } catch (err) {
        toast.error("Failed to load cost.");
        navigate("/finances/transactions/costs");
      }
    }
    if (costId) fetchCost();
  }, [costId, navigate]);

  async function handleSave() {
    if (
      !selectedValue ||
      !selectedName ||
      !selectedDate ||
      !selectedCurrencyId ||
      !selectedCategoryId
    ) {
      toast.error("Information not provided");
      return;
    }
    await costUpdate(Number(costId), {
      name: selectedName,
      value: makeNumber(selectedValue),
      currencyId: selectedCurrencyId,
      categoryId: selectedCategoryId,
      timestamp: selectedDate,
    });
    refreshEquity();
    toast.success(`Saved ${selectedName}`);
  }

  async function handleDelete() {
    try {
      await costDelete(Number(costId));
      toast.success(`Removed ${selectedName}`);
      navigate(`/finances/transactions?currencyId=${selectedCurrencyId}`);
      refreshEquity();
    } catch (error) {
      toast.error(`${error}`);
    }
  }

  if (!cost) {
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
        <h1 style={{ textAlign: "center" }}>Cost</h1>
        <Datepicker date={selectedDate} setDateCallback={setDate} />
        <Dropdown
          value={String(selectedCategoryId) ?? ""}
          onChangeCallback={(e) => setCategoryId(Number(e.target.value))}
        >
          {categories.map((category) => (
            <option value={category.id} key={category.id}>
              {category.name}
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
            value={String(selectedValue) ?? ""}
            onChangeCallback={(e) => setValue(e.target.value)}
          />
          <Dropdown
            value={String(selectedCurrencyId) ?? ""}
            onChangeCallback={(e) => setCurrencyId(Number(e.target.value))}
          >
            {currencies.map((cur) => (
              <option value={cur.id} key={cur.id}>
                {cur.sign}
              </option>
            ))}
          </Dropdown>
        </div>
        <ActionButtons
          greenText="Save"
          greenCallback={handleSave}
          redText="Delete"
          redCallback={handleDelete}
        />
      </Card>
    </Container>
  );
}
