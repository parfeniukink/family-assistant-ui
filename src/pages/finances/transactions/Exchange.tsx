import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Datepicker,
  NoData,
  Card,
  DecimalInput,
  Dropdown,
} from "src/components";
import { ActionButtons } from "./shared";
import { useCurrencies, useEquities, useMobile } from "src/context";
import { exchangeRetrieve, exchangeDelete } from "src/data/api/client";
import toast from "react-hot-toast";
import type { Exchange } from "src/data/types";

export default function ExchangeEdit() {
  const navigate = useNavigate();
  // URL Params
  const { exchangeId } = useParams();

  // Context
  const { isMobile } = useMobile();
  const { refreshEquity } = useEquities();
  const { currencies } = useCurrencies();

  // State
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [selectedDate, setDate] = useState<string>("");
  const [fromValue, setFromValue] = useState<string | null>(null);
  const [toValue, setToValue] = useState<string | null>(null);
  const [fromCurrencyId, setFromCurrencyId] = useState<number | null>(null);
  const [toCurrencyId, setToCurrencyId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await exchangeRetrieve(Number(exchangeId));
        const ex = res.result;
        setExchange(ex);
        setDate(ex.timestamp.slice(0, 10));
        setFromValue(String(ex.fromValue));
        setToValue(String(ex.toValue));
        setFromCurrencyId(ex.fromCurrency.id);
        setToCurrencyId(ex.toCurrency.id);
      } catch (err) {
        toast.error("failed to load exchange.");
        navigate("/finances/transactions/exchanges");
      }
    }
    if (exchangeId) load();
  }, [exchangeId, navigate]);

  async function handleSave() {
    if (!selectedDate) {
      toast.error("information not provided");
      return;
    }
    try {
      toast("Updating is not available now. Remove and add another");
      navigate("/finances");
    } catch (error) {
      toast.error(`${error}`);
    }
  }

  async function handleDelete() {
    try {
      await exchangeDelete(Number(exchangeId));
      toast.success("exchange deleted");
      refreshEquity();
      navigate("/finances");
    } catch (error) {
      toast.error(`${error}`);
    }
  }

  if (!exchange) {
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
        <h1 style={{ textAlign: "center" }}>Exchange</h1>
        <Datepicker date={selectedDate} setDateCallback={setDate} />
        <div className="transaction__items_group">
          <DecimalInput
            placeholder="from value"
            value={fromValue ?? ""}
            onChangeCallback={(e) => setFromValue(e.target.value)}
          />
          <Dropdown
            value={String(fromCurrencyId) ?? ""}
            onChangeCallback={(e) => setFromCurrencyId(Number(e.target.value))}
          >
            {currencies.map((item) => (
              <option value={item.id} key={item.id}>
                {item.sign}
              </option>
            ))}
          </Dropdown>
        </div>
        <div style={{ textAlign: "center", margin: "0.3rem 0" }}>↓</div>
        <div className="transaction__items_group">
          <DecimalInput
            placeholder="to value"
            value={toValue ?? ""}
            onChangeCallback={(e) => setToValue(e.target.value)}
          />
          <Dropdown
            value={String(toCurrencyId) ?? ""}
            onChangeCallback={(e) => setToCurrencyId(Number(e.target.value))}
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
