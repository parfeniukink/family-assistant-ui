import { Card, Button, DecimalInput, Datepicker, TextInput } from "src/components";
import { useSearchParams } from "react-router-dom";
import { useCurrencies, useMobile, useTransactions } from "src/context";
import { Dropdown } from "src/components";
import { TOKENS } from "src/styles/tokens";
import toast from "react-hot-toast";

export default function TransactionsFiltersForm() {
  // Context
  const { currencies } = useCurrencies();
  const { isMobile } = useMobile();

  const { fetchNextTransactions, fetchTransactions, transactionsLeft } =
    useTransactions();

  // URL search params as single source of truth
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCurrencyId = searchParams.get("currencyId") || "";
  const selectedOnlyMine = searchParams.get("onlyMine") === "true";
  const selectedOperation = searchParams.get("operation") || "";
  const selectedMinValue = searchParams.get("minValue") || "";
  const selectedPattern = searchParams.get("pattern") || "";
  const selectedStartDate = searchParams.get("startDate") || "";
  const selectedEndDate = searchParams.get("endDate") || "";

  function updateParam(key: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      return next;
    });
  }

  function applyFilters() {
    fetchTransactions({
      onlyMine: selectedOnlyMine,
      currencyId: selectedCurrencyId ? Number(selectedCurrencyId) : null,
      operation: selectedOperation || null,
      minValue: selectedMinValue ? Number(selectedMinValue) : null,
      pattern: selectedPattern || null,
      startDate: selectedStartDate || null,
      endDate: selectedEndDate || null,
    });
  }

  const filterGroupStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "start",
    flexDirection: isMobile ? "row" : "column",
    gap: "4px",
  };

  const buttonStyle = {
    minWidth: isMobile ? "100px" : "100px",
    minHeight: isMobile ? "50px" : "40px",
  };

  return (
    <Card
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: isMobile ? TOKENS.SPACE_1 : TOKENS.SPACE_2,
      }}
    >
      {/* Currency */}
      <div style={filterGroupStyle}>
        <b>currency</b>
        <Dropdown
          value={selectedCurrencyId}
          onChangeCallback={(e) => updateParam("currencyId", e.target.value)}
        >
          <option value="">all</option>
          {currencies.map((item) => (
            <option value={item.id} key={item.id}>
              {item.sign} {item.name}
            </option>
          ))}
        </Dropdown>
      </div>
      {/* Only Mine */}
      <div style={filterGroupStyle}>
        <b>only mine</b>
        <input
          type="checkbox"
          checked={selectedOnlyMine}
          onChange={(e) =>
            updateParam("onlyMine", e.target.checked ? "true" : "")
          }
          className="checkbox"
        />
      </div>
      {/* Type */}
      <div style={filterGroupStyle}>
        <b>type</b>
        <Dropdown
          value={selectedOperation}
          onChangeCallback={(e) => updateParam("operation", e.target.value)}
        >
          <option value="">all</option>
          <option value="cost">cost</option>
          <option value="income">income</option>
          <option value="exchange">exchange</option>
        </Dropdown>
      </div>
      {/* Min Value */}
      <div style={filterGroupStyle}>
        <b>min value</b>
        <DecimalInput
          value={selectedMinValue}
          placeholder="0"
          onChangeCallback={(e) => updateParam("minValue", e.target.value)}
        />
      </div>
      {/* Pattern */}
      <div style={filterGroupStyle}>
        <b>pattern</b>
        <TextInput
          value={selectedPattern}
          placeholder="search"
          onChangeCallback={(e) => updateParam("pattern", e.target.value)}
        />
      </div>
      {/* Dates */}
      <div style={filterGroupStyle}>
        <b>dates</b>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Datepicker
            date={selectedStartDate}
            setDateCallback={(value: string) =>
              updateParam("startDate", value)
            }
            showShortcuts={false}
          />
          <span style={{ color: TOKENS.GRAY }}>&mdash;</span>
          <Datepicker
            date={selectedEndDate}
            setDateCallback={(value: string) => updateParam("endDate", value)}
            showShortcuts={false}
          />
        </div>
      </div>
      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <Button onClickCallback={applyFilters} overrideStyles={buttonStyle}>
          Filter
        </Button>
        <Button
          onClickCallback={() => {
            if (transactionsLeft) {
              fetchNextTransactions();
            } else {
              toast("No more transactions");
            }
          }}
          overrideStyles={buttonStyle}
        >
          {`Load (${transactionsLeft})`}
        </Button>
      </div>
    </Card>
  );
}
