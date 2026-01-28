import type { CostShortcut } from "src/data/types";
import { NoData, Card, Button, Datepicker } from "src/components";
import { useCostShortcuts, useEquities, useMobile } from "src/context";
import { TOKENS } from "src/styles/tokens";
import { costShortcutApply } from "src/data/api/client";
import toast from "react-hot-toast";
import { prettyMoney } from "src/domain/transactions";
import { useState, useCallback } from "react";

export function CostShortcutsSection() {
  const { isMobile } = useMobile();
  const { refreshEquity } = useEquities();
  const { costShortcuts } = useCostShortcuts();
  const [userValue, setUserValue] = useState<string | null>(null);
  const [activeShortcut, setActiveShortcut] = useState<CostShortcut | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO: 'Date Override' Feature
  // const [activeDate, setActiveDate] = useState(
  //   new Date().toISOString().slice(0, 10),
  // );

  const handleShortcut = useCallback(
    async (shortcut: CostShortcut, value: number) => {
      setIsSubmitting(true);
      try {
        const res = await costShortcutApply(shortcut.id, { value });
        toast.success(
          `Saved ${res.result.name} ${prettyMoney(res.result.value)}${res.result.currency.sign}`,
        );
        setActiveShortcut(null);
        setUserValue(null);
        refreshEquity();
      } catch (error) {
      } finally {
        setIsSubmitting(false);
      }
    },
    [refreshEquity],
  );

  const onShortcutClick = useCallback(
    (shortcut: CostShortcut) => {
      if (shortcut.value == null) {
        setUserValue(null);
        setActiveShortcut(shortcut);
      } else {
        handleShortcut(shortcut, shortcut.value);
      }
    },
    [handleShortcut],
  );

  if (!costShortcuts) {
    return <NoData />;
  } else {
    return (
      <>
        <Card>
          {/* 🚧 Feature is not ready yet */}
          <div style={{ opacity: "0.3" }}>
            <Datepicker
              setDateCallback={() => {
                toast("'Date Override' feature is not ready yet");
              }}
              disabled={true}
            />
          </div>
          <br />

          <div
            style={{
              display: "grid",
              justifyContent: "space-around",
              alignItems: "center",
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : "repeat(auto-fit, minmax(140px, 1fr))",
              gap: TOKENS.SPACE_1,
            }}
          >
            {costShortcuts.map((item) => (
              <Button
                key={item.id}
                onClickCallback={() => onShortcutClick(item)}
                color="darkslategrey"
                hoverBackground="indianred"
                overrideStyles={{
                  fontSize: "small",
                }}
              >
                <p style={{ marginBottom: 0, fontSize: "medium" }}>
                  {item.name}
                </p>
                <p style={{ fontSize: "small", margin: 0 }}>
                  {item.category.name}
                </p>
                <p>{item.value ? `${item.value} ${item.currency.sign}` : ""}</p>
              </Button>
            ))}
          </div>
        </Card>

        {activeShortcut && (
          <div
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              zIndex: 9999,
              width: "100vw",
              height: "100vh",
              background: TOKENS.BG,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => !isSubmitting && setActiveShortcut(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "flex",
                flexDirection: "column",
                background: TOKENS.BG_LIGHTER,
                border: TOKENS.BORDER,
                padding: isMobile
                  ? TOKENS.SPACE_2
                  : `${TOKENS.SPACE_3} ${TOKENS.SPACE_5}`,
                borderRadius: TOKENS.RADIUS,
                boxShadow: TOKENS.SHADOW,
                gap: isMobile ? TOKENS.SPACE_1 : TOKENS.SPACE_3,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <h1>{activeShortcut.name}</h1>
                <div style={{ color: "#888" }}>
                  {activeShortcut.category.name}
                  {activeShortcut.currency
                    ? ` (${activeShortcut.currency.sign})`
                    : ""}
                </div>
              </div>
              <input
                type="text"
                inputMode="decimal"
                pattern="\d*"
                placeholder="value..."
                value={userValue ?? ""}
                onChange={(e) => {
                  setUserValue(e.target.value);
                }}
                autoFocus
                style={{
                  height: "75px",
                  fontSize: "large",
                }}
              />
              <Button
                color="darkslategrey"
                hoverBackground="indianred"
                onClickCallback={() => {
                  if (userValue != null && Number(userValue)) {
                    handleShortcut(
                      activeShortcut,
                      Number(userValue.replace(",", ".")),
                    );
                  } else {
                    toast.error("cost value is not correct");
                  }
                }}
                overrideStyles={{
                  minHeight: isMobile ? "100px" : "175px",
                  fontSize: "x-large",
                }}
              >
                Save
              </Button>
            </div>
          </div>
        )}
        {isMobile && (
          <>
            <br />
            <br />
          </>
        )}
      </>
    );
  }
}
