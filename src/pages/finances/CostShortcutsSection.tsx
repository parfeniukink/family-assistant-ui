import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import type { CostShortcut } from "src/data/types";
import { NoData } from "src/components/NoData";
import { Card } from "src/components/Card";
import { Button } from "src/components/Button";
import { Datepicker } from "src/components/Datepicker";
import { Modal } from "src/components/Modal";
import { useCostShortcuts } from "src/context/CostShortcutsContext";
import { useCostCategories } from "src/context/CostCategoriesContext";
import { useCurrencies } from "src/context/CurrenciesContext";
import { useEquities } from "src/context/EquityContext";
import { useMobile } from "src/context/MobileContext";
import { TOKENS } from "src/styles/tokens";
import { costShortcutApply } from "src/data/api/transactions";
import toast from "react-hot-toast";
import { prettyMoney } from "src/domain/transactions";
import { moveItem, withReindexedPositions } from "src/domain/dragDrop";

export function CostShortcutsSection() {
  const { isMobile } = useMobile();
  const { refreshEquity } = useEquities();
  const {
    costShortcuts,
    updateShortcutsOrder,
    removeShortcut,
    createShortcut,
  } = useCostShortcuts();
  const { currencies } = useCurrencies();
  const { categories } = useCostCategories();

  // ── Apply shortcut state ──
  const [userValue, setUserValue] = useState<string | null>(null);
  const [activeShortcut, setActiveShortcut] = useState<CostShortcut | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDate, setActiveDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  // ── Edit mode state ──
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragFromRef = useRef<number | null>(null);
  const overRef = useRef<number | null>(null);

  // ── Create modal state ──
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newCurrencyId, setNewCurrencyId] = useState<number | null>(null);
  const [newCategoryId, setNewCategoryId] = useState<number | null>(null);

  const sortedFromServer = useMemo(() => {
    const src = costShortcuts ?? [];
    return src
      .slice()
      .sort((a, b) => (a.ui?.positionIndex ?? 0) - (b.ui?.positionIndex ?? 0));
  }, [costShortcuts]);

  const [shortcutOrder, setShortcutOrder] = useState<CostShortcut[]>([]);

  useEffect(() => {
    setShortcutOrder(sortedFromServer);
  }, [sortedFromServer]);

  useEffect(() => {
    if (showModal && !newCurrencyId && currencies.length) {
      setNewCurrencyId(currencies[0].id);
    }
    if (showModal && !newCategoryId && categories.length) {
      setNewCategoryId(categories[0].id);
    }
  }, [showModal, currencies, categories, newCurrencyId, newCategoryId]);

  // ── Apply shortcut handlers ──
  const handleShortcut = useCallback(
    async (shortcut: CostShortcut, value: number) => {
      setIsSubmitting(true);
      const today = new Date().toISOString().slice(0, 10);
      const dateOverride = activeDate !== today ? activeDate : null;
      try {
        const res = await costShortcutApply(shortcut.id, {
          value,
          date_override: dateOverride,
        });
        toast.success(
          `Saved ${res.result.name} ${prettyMoney(res.result.value)}${res.result.currency.sign}`,
        );
        setActiveShortcut(null);
        setUserValue(null);
        refreshEquity();
      } catch {
        // Error already handled by apiCall toast
      } finally {
        setIsSubmitting(false);
      }
    },
    [refreshEquity, activeDate],
  );

  const onShortcutClick = useCallback(
    (shortcut: CostShortcut) => {
      if (editMode) return;
      if (shortcut.value == null) {
        setUserValue(null);
        setActiveShortcut(shortcut);
      } else {
        handleShortcut(shortcut, shortcut.value);
      }
    },
    [handleShortcut, editMode],
  );

  // ── Drag & drop handlers ──
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    if (saving) return;
    dragFromRef.current = idx;
    setDraggedIndex(idx);
    e.dataTransfer.setData("text/plain", String(idx));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    if (saving) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    overRef.current = idx;
    setOverIndex(idx);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    e.preventDefault();
    if (saving) return;
    const from = dragFromRef.current;
    if (from === null || from === idx) {
      resetDrag();
      return;
    }
    const before = shortcutOrder;
    const moved = moveItem(before, from, idx);
    const reindexed = withReindexedPositions(moved);
    setSaving(true);
    setShortcutOrder(reindexed);
    try {
      await updateShortcutsOrder(reindexed);
    } catch (err) {
      setShortcutOrder(before);
    } finally {
      resetDrag();
      setSaving(false);
    }
  };

  const resetDrag = () => {
    dragFromRef.current = null;
    overRef.current = null;
    setDraggedIndex(null);
    setOverIndex(null);
  };

  // ── Create shortcut ──
  async function handleCreateShortcut() {
    if (
      !newName.trim() ||
      !newCurrencyId ||
      !newCategoryId ||
      (newValue && isNaN(Number(newValue.replace(",", "."))))
    ) {
      toast.error("Please provide valid name, currency, and category");
      return;
    }
    setCreating(true);
    try {
      await createShortcut({
        name: newName.trim(),
        value:
          newValue.trim() === "" ? null : Number(newValue.replace(",", ".")),
        currencyId: newCurrencyId,
        categoryId: newCategoryId,
      });
      setShowModal(false);
      setNewName("");
      setNewValue("");
      setNewCurrencyId(null);
      setNewCategoryId(null);
    } catch (err) {
      toast.error("Failed to add shortcut");
    } finally {
      setCreating(false);
    }
  }

  if (!costShortcuts) {
    return <NoData />;
  }

  const items = editMode ? shortcutOrder : (costShortcuts ?? []);

  return (
    <>
      <Card style={{ border: "none" }}>
        {/* Header: datepicker + edit toggle */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "center",
            gap: TOKENS.SPACE_2,
          }}
        >
          {!editMode && (
            <Datepicker date={activeDate} setDateCallback={setActiveDate} />
          )}
          {editMode && <div />}
          <Button
            onClickCallback={() => setEditMode(!editMode)}
            overrideStyles={{
              width: isMobile ? "100%" : "auto",
              height: isMobile ? "44px" : "auto",
              padding: "0.4rem 1rem",
              fontSize: "1rem",
              fontWeight: 600,
              opacity: 0.75,
            }}
          >
            {editMode ? "DONE" : "EDIT"}
          </Button>
        </div>

        {/* Shortcuts grid */}
        <div
          style={{
            display: "grid",
            justifyContent: "space-around",
            alignItems: "center",
            gridTemplateColumns: isMobile
              ? "repeat(2, minmax(0, 1fr))"
              : "repeat(auto-fit, minmax(140px, 1fr))",
            gap: TOKENS.SPACE_2,
          }}
        >
          {items.map((item, idx) =>
            editMode ? (
              <div
                key={item.id}
                draggable={!saving}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={resetDrag}
                style={{
                  userSelect: "none",
                  padding: "8px 10px",
                  border: TOKENS.BORDER,
                  boxShadow:
                    draggedIndex === idx
                      ? `0 0 4px 2px ${TOKENS.ACCENT_RED}`
                      : overIndex === idx
                        ? `0 0 8px 2px ${TOKENS.BG_YELLOW}`
                        : TOKENS.SHADOW,
                  borderRadius: TOKENS.RADIUS,
                  opacity: draggedIndex === idx ? 0.3 : 1,
                  background: TOKENS.BG_LIGHTER,
                  textAlign: "left",
                  transition:
                    "box-shadow 0.1s, background 0.1s, opacity 0.15s",
                  cursor: saving ? "not-allowed" : "move",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
                    {item.name}{" "}
                    {item.value != null
                      ? `${item.value} ${item.currency.sign}`
                      : ""}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "1rem",
                      fontWeight: 500,
                      color: TOKENS.INK_FADED,
                    }}
                  >
                    {item.category.name}
                  </p>
                </div>
                <button
                  onClick={() => removeShortcut(Number(item.id))}
                  style={{
                    background: "none",
                    border: "none",
                    color: TOKENS.ACCENT_RED,
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    padding: "2px 6px",
                    flexShrink: 0,
                  }}
                  type="button"
                >
                  &#10005;
                </button>
              </div>
            ) : (
              <Button
                key={item.id}
                onClickCallback={() => onShortcutClick(item)}
                color="darkslategrey"
                hoverBackground="rgba(138, 74, 74, 0.18)"
                overrideStyles={{
                  fontSize: "1.15rem",
                  padding: "0.6rem 0.5rem",
                }}
              >
                <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: TOKENS.INK }}>
                  {item.name}
                </p>
                <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 500, color: TOKENS.INK_FADED, letterSpacing: "0.04em" }}>
                  {item.category.name}
                </p>
                {item.value && (
                  <p style={{ margin: "0.2rem 0 0", fontSize: "1.1rem", fontWeight: 700, color: TOKENS.INK_LIGHT }}>
                    {item.value} {item.currency.sign}
                  </p>
                )}
              </Button>
            ),
          )}

          {/* Add button — only in edit mode */}
          {editMode && (
            <Button
              color="darkslategrey"
              onClickCallback={() => setShowModal(true)}
              overrideStyles={{
                maxHeight: "75px",
                padding: "10px 12px",
                fontSize: "1rem",
              }}
            >
              + ADD
            </Button>
          )}
        </div>
      </Card>

      {/* Value entry modal */}
      {activeShortcut && (
        <Modal
          onClose={() => !isSubmitting && setActiveShortcut(null)}
          style={{
            padding: isMobile
              ? TOKENS.SPACE_4
              : `${TOKENS.SPACE_3} ${TOKENS.SPACE_4}`,
            gap: isMobile ? TOKENS.SPACE_2 : TOKENS.SPACE_3,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1>{activeShortcut.name}</h1>
            <div style={{ color: TOKENS.INK_FADED }}>
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
            onChange={(e) => setUserValue(e.target.value)}
            autoFocus
            style={{ height: "75px", fontSize: "1.2rem" }}
          />
          <Button
            color="red"
            hoverBackground="rgba(138, 74, 74, 0.18)"
            onClickCallback={() => {
              if (
                userValue != null &&
                Number(userValue.replace(",", "."))
              ) {
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
              fontSize: "1.3rem",
            }}
          >
            Save
          </Button>
        </Modal>
      )}

      {/* Create shortcut modal */}
      {showModal && (
        <Modal
          onClose={() => !creating && setShowModal(false)}
          style={{
            minWidth: "350px",
            maxWidth: "80%",
            gap: TOKENS.SPACE_4,
          }}
        >
          <h3 style={{ margin: 0, textAlign: "center" }}>Create Shortcut</h3>
          <input
            type="text"
            placeholder="name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={creating}
            autoFocus
            style={{ height: "50px", fontSize: "1rem" }}
          />
          <input
            type="text"
            inputMode="decimal"
            placeholder="value (optional)"
            pattern="\d*"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            disabled={creating}
            style={{ height: "50px", fontSize: "1rem" }}
          />
          <select
            value={newCurrencyId ?? ""}
            onChange={(e) => setNewCurrencyId(Number(e.target.value))}
            disabled={creating}
            style={{
              height: "50px",
              fontSize: "1rem",
              color: TOKENS.INK,
              background: "transparent",
              border: TOKENS.BORDER,
            }}
          >
            {currencies.map((c) => (
              <option value={c.id} key={c.id}>
                {c.sign}
              </option>
            ))}
          </select>
          <select
            value={newCategoryId ?? ""}
            onChange={(e) => setNewCategoryId(Number(e.target.value))}
            disabled={creating}
            style={{
              height: "50px",
              fontSize: "1rem",
              color: TOKENS.INK,
              background: "transparent",
              border: TOKENS.BORDER,
            }}
          >
            {categories.map((cat) => (
              <option value={cat.id} key={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <Button
            color="darkslategrey"
            onClickCallback={handleCreateShortcut}
            overrideStyles={{
              height: "75px",
              fontSize: "1.1rem",
            }}
          >
            {creating ? "Saving..." : "Save"}
          </Button>
        </Modal>
      )}

      {isMobile && <div style={{ height: "100px" }} />}
    </>
  );
}
