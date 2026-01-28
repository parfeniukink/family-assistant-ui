import React, { useEffect, useMemo, useRef, useState } from "react";
import { TOKENS } from "src/styles/tokens";
import type { CostShortcut } from "src/data/types";
import {
  useCostShortcuts,
  useCostCategories,
  useCurrencies,
  useMobile,
} from "src/context";
import { Button, Card } from "src/components";
import toast from "react-hot-toast";

function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to) return list;
  const next = list.slice();
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
}

function withReindexedPositions(list: CostShortcut[]): CostShortcut[] {
  return list.map((sc, i) => ({
    ...sc,
    ui: { ...(sc.ui ?? { positionIndex: i }), positionIndex: i },
  }));
}

export default function ShortcutsReorderSection() {
  // Context
  const { isMobile } = useMobile();

  const {
    costShortcuts,
    updateShortcutsOrder,
    removeShortcut,
    createShortcut,
  } = useCostShortcuts();

  const { currencies } = useCurrencies();
  const { categories } = useCostCategories();

  const sortedFromServer = useMemo(() => {
    const src = costShortcuts ?? [];
    return src
      .slice()
      .sort((a, b) => (a.ui?.positionIndex ?? 0) - (b.ui?.positionIndex ?? 0));
  }, [costShortcuts]);

  const [shortcutOrder, setShortcutOrder] = useState<CostShortcut[]>([]);
  const [saving, setSaving] = useState(false);

  // purely for visuals
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  // for reliable logic across re-renders during drag
  const dragFromRef = useRef<number | null>(null);
  const overRef = useRef<number | null>(null);

  // Create Cost Shortcut Modal
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState<string>("");
  const [newValue, setNewValue] = useState<string>("");
  const [newCurrencyId, setNewCurrencyId] = useState<number | null>(null);
  const [newCategoryId, setNewCategoryId] = useState<number | null>(null);

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

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, idx: number) => {
    if (saving) return;

    dragFromRef.current = idx;
    setDraggedIndex(idx);

    // Critical for drop to fire in Firefox/Safari
    e.dataTransfer.setData("text/plain", String(idx));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, idx: number) => {
    if (saving) return;
    e.preventDefault(); // required to allow drop
    e.dataTransfer.dropEffect = "move";

    overRef.current = idx;
    setOverIndex(idx);
  };

  const handleDrop = async (e: React.DragEvent<HTMLLIElement>, idx: number) => {
    e.preventDefault();
    if (saving) return;

    const from = dragFromRef.current;
    const to = idx;

    if (from === null || from === to) {
      dragFromRef.current = null;
      overRef.current = null;
      setDraggedIndex(null);
      setOverIndex(null);
      return;
    }

    const before = shortcutOrder;
    const moved = moveItem(before, from, to);
    const reindexed = withReindexedPositions(moved);

    setSaving(true);
    setShortcutOrder(reindexed);

    try {
      await updateShortcutsOrder(reindexed);
    } catch (err) {
      // If API fails, revert UI order so it doesn’t lie to the user
      setShortcutOrder(before);
      // Consider surfacing an error toast here
      // eslint-disable-next-line no-console
      console.error("Failed to update shortcuts order:", err);
    } finally {
      dragFromRef.current = null;
      overRef.current = null;
      setDraggedIndex(null);
      setOverIndex(null);
      setSaving(false);
    }
  };

  const handleDragEnd = () => {
    dragFromRef.current = null;
    overRef.current = null;
    setDraggedIndex(null);
    setOverIndex(null);
  };

  const handleRemoveShortcut = async (id: string | number) => {
    if (saving) return;
    await removeShortcut(Number(id));
    // No need to setShortcutOrder here, context auto-updates
  };

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

  // --- Render Modal ---
  function renderModal() {
    return showModal ? (
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 999,
          width: "100vw",
          height: "100vh",
          background: TOKENS.BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={() => !creating && setShowModal(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            minWidth: "350px",
            maxWidth: "80%",
            background: TOKENS.BG_LIGHTER,
            borderRadius: TOKENS.RADIUS,
            boxShadow: TOKENS.SHADOW,
            padding: "32px",
            border: TOKENS.BORDER,
            display: "flex",
            flexDirection: "column",
            gap: TOKENS.SPACE_2,
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
            style={{ height: "50px", fontSize: "medium" }}
          />
          <input
            type="text"
            inputMode="decimal"
            placeholder="value (optional)"
            pattern="\d*"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            disabled={creating}
            style={{ height: "50px", fontSize: "medium" }}
          />
          <select
            value={newCurrencyId ?? ""}
            onChange={(e) => setNewCurrencyId(Number(e.target.value))}
            disabled={creating}
            style={{
              height: "50px",
              fontSize: "medium",
              color: TOKENS.WHITE,
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
              fontSize: "medium",
              color: TOKENS.WHITE,
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
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button
              color="darkslategrey"
              onClickCallback={handleCreateShortcut}
              overrideStyles={{
                height: "75px",
                fontSize: "large",
              }}
            >
              {creating ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </div>
    ) : null;
  }
  // ---

  return (
    <div style={isMobile ? { marginTop: TOKENS.SPACE_3 } : {}}>
      <h3 style={{ textAlign: isMobile ? "center" : "right" }}>
        REORDER SHORTCUTS
      </h3>

      <Card
        style={
          isMobile
            ? { boxShadow: "none", border: "none", margin: 0, padding: 0 }
            : { boxShadow: "none" }
        }
      >
        <div
          style={
            isMobile
              ? {
                  listStyle: "none",
                  display: "grid",
                  justifyContent: "space-around",
                  alignItems: "center",
                  gridTemplateColumns: isMobile
                    ? "repeat(1, 1fr)"
                    : "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: TOKENS.SPACE_1,
                }
              : {
                  listStyle: "none",
                  display: "grid",
                  justifyContent: "space-around",
                  alignItems: "center",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: TOKENS.SPACE_1,
                }
          }
        >
          {shortcutOrder.map((sc, idx) => (
            <li
              key={sc.id}
              draggable={!saving}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
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
                transition: "box-shadow 0.1s, background 0.1s, opacity 0.15s",
                cursor: saving ? "not-allowed" : "move",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: TOKENS.SPACE_2,
                  fontSize: "small",
                }}
              >
                <div>
                  <p style={{ margin: 0 }}>
                    {sc.name} {sc.value ?? "__"} {sc.currency.sign}
                  </p>
                  <p style={{ margin: 0 }}>{sc.category.name}</p>
                </div>
                <Button
                  color={TOKENS.BG_RED}
                  hoverBackground={TOKENS.BG_RED}
                  onClickCallback={() => {
                    handleRemoveShortcut(sc.id);
                  }}
                  overrideStyles={{
                    width: "25px",
                    boxShadow: "none",
                    border: `2px solid ${TOKENS.BLACK}`,
                  }}
                >
                  x
                </Button>
              </div>
            </li>
          ))}

          <Button
            color="darkslategrey"
            onClickCallback={() => setShowModal(true)}
            overrideStyles={{
              maxHeight: "75px",
              padding: "10px 12px",
            }}
          >
            add
          </Button>
        </div>
      </Card>
      {renderModal()}
    </div>
  );
}
