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

  const labelStyle: React.CSSProperties = {
    fontSize: "0.85rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    color: TOKENS.INK_LIGHT,
    marginBottom: "4px",
  };

  return (
    <Card
      style={{
        gap: TOKENS.SPACE_1,
        padding: isMobile ? TOKENS.SPACE_1 : TOKENS.SPACE_2,
      }}
    >
      {/* Row 1: Main filters */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr auto",
          gap: TOKENS.SPACE_1,
          alignItems: "end",
        }}
      >
        <div>
          <div style={labelStyle}>currency</div>
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
        <div>
          <div style={labelStyle}>type</div>
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
        <div>
          <div style={labelStyle}>pattern</div>
          <TextInput
            value={selectedPattern}
            placeholder="search"
            onChangeCallback={(e) => updateParam("pattern", e.target.value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={labelStyle}>only mine</div>
          <input
            type="checkbox"
            checked={selectedOnlyMine}
            onChange={(e) =>
              updateParam("onlyMine", e.target.checked ? "true" : "")
            }
            className="checkbox"
          />
        </div>
      </div>

      {/* Row 2: Dates, min value, and action buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "auto 1fr auto",
          gap: TOKENS.SPACE_1,
          alignItems: "end",
        }}
      >
        <div>
          <div style={labelStyle}>dates</div>
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
            <span style={{ color: TOKENS.INK_FADED }}>&mdash;</span>
            <Datepicker
              date={selectedEndDate}
              setDateCallback={(value: string) => updateParam("endDate", value)}
              showShortcuts={false}
            />
          </div>
        </div>
        <div>
          <div style={labelStyle}>min value</div>
          <DecimalInput
            value={selectedMinValue}
            placeholder="0"
            onChangeCallback={(e) => updateParam("minValue", e.target.value)}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "end",
          }}
        >
          <div style={{ height: "44px", minWidth: "100px" }}>
            <Button onClickCallback={applyFilters} overrideStyles={{ fontSize: "1rem", fontWeight: 600 }}>
              Filter
            </Button>
          </div>
          <div style={{ height: "44px", minWidth: "120px" }}>
            <Button
              onClickCallback={() => {
                if (transactionsLeft) {
                  fetchNextTransactions();
                } else {
                  toast("No more transactions");
                }
              }}
              overrideStyles={{ fontSize: "1rem" }}
            >
              {`Load (${transactionsLeft})`}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
