import { useEffect, useState } from "react";
import { useCurrencies, useEquities, useMobile } from "src/context";
import { exchangeCreate } from "src/data/api/client";
import toast from "react-hot-toast";
import { type Response } from "src/infrastructure/generic";
import type { Exchange } from "src/data/types";
import { prettyMoney } from "src/domain/transactions";
import { useNavigate } from "react-router-dom";
import { ActionButtons } from "./shared";
import {
  Container,
  Datepicker,
  Card,
  Dropdown,
  DecimalInput,
  NoData,
} from "src/components";

export default function ExchangeCreate() {
  const navigate = useNavigate();

  // Context
  const { isMobile } = useMobile();
  const { refreshEquity } = useEquities();
  const { currencies } = useCurrencies();

  const today = new Date().toISOString().slice(0, 10);

  // State
  const [selectedDate, setDate] = useState<string>(today);
  const [fromValue, setFromValue] = useState<string | null>(null);
  const [toValue, setToValue] = useState<string | null>(null);
  const [fromCurrencyId, setFromCurrencyId] = useState<number | null>(null);
  const [toCurrencyId, setToCurrencyId] = useState<number | null>(null);

  useEffect(() => {
    if (currencies.length < 2) {
      toast.error("not enough currencies for exchange");
      navigate("/finances");
    }

    // Optionally set defaults here if required
    if (currencies.length > 1) {
      setFromCurrencyId(currencies[0].id);
      setToCurrencyId(currencies[1].id);
    }
  }, [currencies.length]);

  function handleReset() {
    setFromValue(null);
    setToValue(null);
    if (currencies.length > 1) {
      setFromCurrencyId(currencies[0].id);
      setToCurrencyId(currencies[1].id);
    }
  }

  async function handleSave() {
    if (
      !fromValue ||
      !toValue ||
      !selectedDate ||
      !fromCurrencyId ||
      !toCurrencyId
    ) {
      toast.error("information not provided");
      return;
    }
    try {
      const response: Response<Exchange> = await exchangeCreate({
        fromValue: makeNumber(fromValue ?? "0"),
        toValue: makeNumber(toValue ?? "0"),
        fromCurrencyId,
        toCurrencyId,
        timestamp: selectedDate,
      });
      const exchange = response.result;
      handleReset();
      toast.success(
        `${prettyMoney(exchange.fromValue)}${exchange.fromCurrency.sign} → ${prettyMoney(exchange.toValue)}${exchange.toCurrency.sign} saved`,
      );
      refreshEquity();
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
      // Clear and error
      throw new Error("Invalid Value. Please try again");
    }
    return cleaned;
  }

  if (!currencies) {
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
            onChangeCallback={(e) => {
              setToCurrencyId(Number(fromCurrencyId));
              setFromCurrencyId(Number(e.target.value));
            }}
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
            onChangeCallback={(e) => {
              setFromCurrencyId(Number(toCurrencyId));
              setToCurrencyId(Number(e.target.value));
            }}
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
          redText="reset"
          greenCallback={handleSave}
          redCallback={handleReset}
        />
      </Card>
    </Container>
  );
}
