import { Card, Button, DecimalInput, TextInput } from "src/components";
import { useSearchParams } from "react-router-dom";
import { useCurrencies, useMobile, useTransactions } from "src/context";
import { Dropdown } from "src/components";
import { TOKENS } from "src/styles/tokens";
import toast from "react-hot-toast";

const CELL: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  padding: "0.5rem 0.75rem",
};

const LABEL: React.CSSProperties = {
  fontSize: TOKENS.FONT_XS,
  fontWeight: 700,
  letterSpacing: "0.08em",
  color: TOKENS.INK_FADED,
  textTransform: "uppercase" as const,
};

export default function TransactionsFiltersForm() {
  const { currencies } = useCurrencies();
  const { isMobile } = useMobile();
  const { fetchNextTransactions, fetchTransactions, transactionsLeft } =
    useTransactions();
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

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: TOKENS.SPACE_2 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1px",
            background: "transparent",
            border: "none",
          }}
        >
          <div style={{ ...CELL, background: "transparent" }}>
            <span style={LABEL}>currency</span>
            <Dropdown value={selectedCurrencyId} onChangeCallback={(e) => updateParam("currencyId", e.target.value)}>
              <option value="">all</option>
              {currencies.map((item) => (<option value={item.id} key={item.id}>{item.sign}</option>))}
            </Dropdown>
          </div>
          <div style={{ ...CELL, background: "transparent" }}>
            <span style={LABEL}>type</span>
            <Dropdown value={selectedOperation} onChangeCallback={(e) => updateParam("operation", e.target.value)}>
              <option value="">all</option>
              <option value="cost">cost</option>
              <option value="income">income</option>
              <option value="exchange">exchange</option>
            </Dropdown>
          </div>
          <div style={{ ...CELL, background: "transparent" }}>
            <span style={LABEL}>from</span>
            <input type="date" className="datepicker" style={{ width: "100%" }} value={selectedStartDate} onChange={(e) => updateParam("startDate", e.target.value)} />
          </div>
          <div style={{ ...CELL, background: "transparent" }}>
            <span style={LABEL}>to</span>
            <input type="date" className="datepicker" style={{ width: "100%" }} value={selectedEndDate} onChange={(e) => updateParam("endDate", e.target.value)} />
          </div>
          <div style={{ ...CELL, background: "transparent", gridColumn: "1 / -1" }}>
            <span style={LABEL}>pattern</span>
            <TextInput value={selectedPattern} placeholder="search" onChangeCallback={(e) => updateParam("pattern", e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: TOKENS.SPACE_2 }}>
          <div style={{ flex: 1, height: "50px" }}>
            <Button onClickCallback={applyFilters} overrideStyles={{ fontSize: "1rem", fontWeight: 600 }}>Filter</Button>
          </div>
          <div style={{ flex: 1, height: "50px" }}>
            <Button onClickCallback={() => { if (transactionsLeft) fetchNextTransactions(); else toast("No more transactions"); }} overrideStyles={{ fontSize: "1rem" }}>
              {`Load (${transactionsLeft})`}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: strict 4-column grid, 2 rows of 4 cells = 8 items
  return (
    <Card style={{ gap: 0, padding: 0, overflow: "hidden" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          borderBottom: "1px solid rgba(26, 18, 10, 0.12)",
        }}
      >
        <div style={{ ...CELL, borderRight: "1px solid rgba(26, 18, 10, 0.12)" }}>
          <span style={LABEL}>currency</span>
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
        <div style={{ ...CELL, borderRight: "1px solid rgba(26, 18, 10, 0.12)" }}>
          <span style={LABEL}>type</span>
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
        <div style={{ ...CELL, borderRight: "1px solid rgba(26, 18, 10, 0.12)" }}>
          <span style={LABEL}>pattern</span>
          <TextInput
            value={selectedPattern}
            placeholder="search"
            onChangeCallback={(e) => updateParam("pattern", e.target.value)}
          />
        </div>
        <div style={CELL}>
          <span style={LABEL}>min value</span>
          <DecimalInput
            value={selectedMinValue}
            placeholder="0"
            onChangeCallback={(e) => updateParam("minValue", e.target.value)}
          />
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
        }}
      >
        <div style={{ ...CELL, borderRight: "1px solid rgba(26, 18, 10, 0.12)" }}>
          <span style={LABEL}>from</span>
          <input
            type="date"
            className="datepicker"
            style={{ width: "100%" }}
            value={selectedStartDate}
            onChange={(e) => updateParam("startDate", e.target.value)}
          />
        </div>
        <div style={{ ...CELL, borderRight: "1px solid rgba(26, 18, 10, 0.12)" }}>
          <span style={LABEL}>to</span>
          <input
            type="date"
            className="datepicker"
            style={{ width: "100%" }}
            value={selectedEndDate}
            onChange={(e) => updateParam("endDate", e.target.value)}
          />
        </div>
        <div
          style={{
            ...CELL,
            borderRight: "1px solid rgba(26, 18, 10, 0.12)",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: "0.5rem",
          }}
        >
          <span style={LABEL}>only mine</span>
          <input
            type="checkbox"
            checked={selectedOnlyMine}
            onChange={(e) =>
              updateParam("onlyMine", e.target.checked ? "true" : "")
            }
            className="checkbox"
          />
        </div>
        <div
          style={{
            ...CELL,
            flexDirection: "row",
            gap: TOKENS.SPACE_1,
            alignItems: "stretch",
          }}
        >
          <div style={{ flex: 1 }}>
            <Button
              onClickCallback={applyFilters}
              overrideStyles={{ fontSize: "0.9rem", fontWeight: 600 }}
            >
              Filter
            </Button>
          </div>
          <div style={{ flex: 1 }}>
            <Button
              onClickCallback={() => {
                if (transactionsLeft) {
                  fetchNextTransactions();
                } else {
                  toast("No more transactions");
                }
              }}
              overrideStyles={{ fontSize: "0.9rem" }}
            >
              {`Load (${transactionsLeft})`}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
