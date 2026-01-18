import { Card, Button } from "src/components";
import { useState } from "react";
import { useCurrencies, useMobile, useTransactions } from "src/context";
import { Dropdown } from "src/components";
import { TOKENS } from "src/styles/tokens";
import toast from "react-hot-toast";

type FormProps = {
  currencyId?: number;
};

export default function TransactionsFiltersForm({ currencyId }: FormProps) {
  // Context
  const { currencies } = useCurrencies();
  const { isMobile } = useMobile();

  const { fetchNextTransactions, fetchTransactions, transactionsLeft } =
    useTransactions();

  // State
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number>(
    currencyId || 0,
  );
  const [selectedOnlyMine, setSelectedOnlyMine] = useState<boolean>(false);

  return (
    <Card
      style={{
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Currency Selector*/}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "start",
          flexDirection: isMobile ? "row" : "column",
          gap: TOKENS.SPACE_1,
        }}
      >
        <b>currency</b>
        <Dropdown
          value={String(selectedCurrencyId) || ""}
          onChangeCallback={(e) =>
            setSelectedCurrencyId(Number(e.target.value) || 0)
          }
        >
          <option value={0}>all</option>
          {currencies.map((item) => (
            <option value={item.id} key={item.id}>
              {item.sign} {item.name}
            </option>
          ))}
        </Dropdown>
      </div>
      {/* Currency Selector*/}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          gap: TOKENS.SPACE_1,
          alignItems: "center",
          justifyContent: "start",
        }}
      >
        <b>only mine</b>
        <input
          type="checkbox"
          checked={selectedOnlyMine}
          onChange={(e) => {
            setSelectedOnlyMine(e.target.checked);
          }}
          className="checkbox"
        />
      </div>
      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          gap: TOKENS.SPACE_1,
        }}
      >
        <Button
          onClickCallback={() => {
            fetchTransactions({
              onlyMine: selectedOnlyMine,
              currencyId: selectedCurrencyId || null,
            });
          }}
          overrideStyles={
            isMobile
              ? {
                  minWidth: "100px",
                  minHeight: "50px",
                }
              : {
                  minWidth: "200px",
                  minHeight: "40px",
                }
          }
        >
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
          overrideStyles={
            isMobile
              ? {
                  minWidth: "100px",
                  minHeight: "50px",
                }
              : {
                  minWidth: "200px",
                  minHeight: "40px",
                }
          }
        >
          <p
            style={{
              margin: 0,
            }}
          >
            Load
          </p>
          <p
            style={{
              margin: "1px 0",
              fontStyle: "italic",
              color: TOKENS.GRAY,
            }}
          >
            {`(${transactionsLeft})`}
          </p>
        </Button>
      </div>
    </Card>
  );
}
