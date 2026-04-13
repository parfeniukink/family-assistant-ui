import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Container } from "src/components/Container";
import { Card } from "src/components/Card";
import { Button } from "src/components/Button";
import { NoData } from "src/components/NoData";
import { Dropdown } from "src/components/Dropdown";
import { DecimalInput } from "src/components/DecimalInput";
import { TOKENS } from "src/styles/tokens";
import { useCurrencies } from "src/context/CurrenciesContext";
import { useMobile } from "src/context/MobileContext";
import { prettyMoney } from "src/domain/transactions";
import {
  cashList,
  cashCreate,
  cashUpdate,
  cashDelete,
} from "src/data/api/cash";
import type { CashBalance } from "src/data/types";
import type { Currency } from "src/data/types/currency";

type AddFormState = {
  currencyId: string;
  step: string;
};

export default function Page() {
  const { isMobile } = useMobile();
  const { currencies } = useCurrencies();
  const [cards, setCards] = useState<CashBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<AddFormState>({
    currencyId: "",
    step: "",
  });
  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  const [editStepValue, setEditStepValue] = useState("");
  const [editingBalanceId, setEditingBalanceId] = useState<number | null>(null);
  const [editBalanceValue, setEditBalanceValue] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(
    null,
  );

  const fetchCards = useCallback(async () => {
    try {
      const response = await cashList();
      setCards(response.result);
    } catch {
      // errors handled by apiCall via toast
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const trackedCurrencyIds = new Set(
    cards.map((c) => c.currency.id),
  );
  const availableCurrencies: Currency[] = currencies.filter(
    (c) => !trackedCurrencyIds.has(c.id),
  );

  const handleAdd = useCallback(async () => {
    const currencyId = Number(addForm.currencyId);
    const step = Number(addForm.step.replace(",", "."));

    if (!currencyId) {
      toast.error("Select a currency");
      return;
    }
    if (!step || step <= 0) {
      toast.error("Step must be a positive number");
      return;
    }

    try {
      const response = await cashCreate({
        currency_id: currencyId,
        step,
      });
      setCards((prev) => [...prev, response.result]);
      setShowAddForm(false);
      setAddForm({ currencyId: "", step: "" });
      toast.success("Cash card added");
    } catch {
      // errors handled by apiCall via toast
    }
  }, [addForm]);

  const handleIncrement = useCallback(
    async (card: CashBalance) => {
      const newBalance = card.balance + card.step;
      try {
        const response = await cashUpdate(card.id, {
          balance: newBalance,
        });
        setCards((prev) =>
          prev.map((c) =>
            c.id === card.id ? response.result : c,
          ),
        );
      } catch {
        // errors handled by apiCall via toast
      }
    },
    [],
  );

  const handleDecrement = useCallback(
    async (card: CashBalance) => {
      const newBalance = card.balance - card.step;
      if (newBalance < 0) return;
      try {
        const response = await cashUpdate(card.id, {
          balance: newBalance,
        });
        setCards((prev) =>
          prev.map((c) =>
            c.id === card.id ? response.result : c,
          ),
        );
      } catch {
        // errors handled by apiCall via toast
      }
    },
    [],
  );

  const handleStepSave = useCallback(
    async (card: CashBalance) => {
      const step = Number(editStepValue.replace(",", "."));
      if (!step || step <= 0) {
        toast.error("Step must be a positive number");
        return;
      }
      try {
        const response = await cashUpdate(card.id, { step });
        setCards((prev) =>
          prev.map((c) =>
            c.id === card.id ? response.result : c,
          ),
        );
        setEditingStepId(null);
        setEditStepValue("");
        toast.success("Step updated");
      } catch {
        // errors handled by apiCall via toast
      }
    },
    [editStepValue],
  );

  const handleBalanceSave = useCallback(
    async (card: CashBalance) => {
      const balance = Number(editBalanceValue.replace(",", "."));
      if (isNaN(balance) || balance < 0) {
        toast.error("Balance must be zero or positive");
        return;
      }
      try {
        const response = await cashUpdate(card.id, { balance });
        setCards((prev) =>
          prev.map((c) =>
            c.id === card.id ? response.result : c,
          ),
        );
        setEditingBalanceId(null);
        setEditBalanceValue("");
        toast.success("Balance updated");
      } catch {
        // errors handled by apiCall via toast
      }
    },
    [editBalanceValue],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await cashDelete(id);
        setCards((prev) => prev.filter((c) => c.id !== id));
        setDeleteConfirmId(null);
        toast.success("Cash card removed");
      } catch {
        // errors handled by apiCall via toast
      }
    },
    [],
  );

  if (loading) {
    return (
      <Container>
        <NoData />
      </Container>
    );
  }

  return (
    <Container>
      <h2 style={{ margin: 0 }}>Cash</h2>

      {cards.length === 0 && !showAddForm && (
        <Card>
          <p style={{ color: TOKENS.INK_FADED, textAlign: "center" }}>
            No cash cards yet. Add your first currency to start
            tracking.
          </p>
          <div style={{ maxWidth: "200px", margin: "0 auto" }}>
            <Button
              color="green"
              onClickCallback={() => setShowAddForm(true)}
              overrideStyles={{ padding: "12px 24px" }}
            >
              + Add Currency
            </Button>
          </div>
        </Card>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : "repeat(auto-fill, minmax(420px, 1fr))",
          gap: TOKENS.SPACE_4,
        }}
      >
        {cards.map((card) => (
          <CashCard
            key={card.id}
            card={card}
            isEditingStep={editingStepId === card.id}
            editStepValue={editStepValue}
            isEditingBalance={editingBalanceId === card.id}
            editBalanceValue={editBalanceValue}
            isDeleteConfirm={deleteConfirmId === card.id}
            onIncrement={() => handleIncrement(card)}
            onDecrement={() => handleDecrement(card)}
            onEditStart={() => {
              setEditingStepId(card.id);
              setEditStepValue(String(card.step));
              setEditingBalanceId(card.id);
              setEditBalanceValue(String(card.balance));
            }}
            onEditCancel={() => {
              setEditingStepId(null);
              setEditStepValue("");
              setEditingBalanceId(null);
              setEditBalanceValue("");
            }}
            onEditStepChange={(value: string) =>
              setEditStepValue(value)
            }
            onEditBalanceChange={(value: string) =>
              setEditBalanceValue(value)
            }
            onEditSave={() => {
              handleStepSave(card);
              handleBalanceSave(card);
            }}
            onDeleteStart={() => setDeleteConfirmId(card.id)}
            onDeleteCancel={() => setDeleteConfirmId(null)}
            onDeleteConfirm={() => handleDelete(card.id)}
          />
        ))}
      </div>

      {cards.length > 0 && !showAddForm && (
        <div
          style={{
            maxWidth: "200px",
            margin: isMobile ? "0 auto" : undefined,
          }}
        >
          <Button
            color="green"
            onClickCallback={() => setShowAddForm(true)}
            overrideStyles={{ padding: "12px 24px" }}
            hidden={availableCurrencies.length === 0}
          >
            + Add Currency
          </Button>
        </div>
      )}

      {showAddForm && (
        <AddCashForm
          availableCurrencies={availableCurrencies}
          addForm={addForm}
          onCurrencyChange={(currencyId: string) =>
            setAddForm((prev) => ({ ...prev, currencyId }))
          }
          onStepChange={(step: string) =>
            setAddForm((prev) => ({ ...prev, step }))
          }
          onSave={handleAdd}
          onCancel={() => {
            setShowAddForm(false);
            setAddForm({ currencyId: "", step: "" });
          }}
        />
      )}
    </Container>
  );
}

// ─────────────────────────────────────────────────────────
// CashCard
// ─────────────────────────────────────────────────────────
type CashCardProps = {
  card: CashBalance;
  isEditingStep: boolean;
  editStepValue: string;
  isEditingBalance: boolean;
  editBalanceValue: string;
  isDeleteConfirm: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditStepChange: (value: string) => void;
  onEditBalanceChange: (value: string) => void;
  onEditSave: () => void;
  onDeleteStart: () => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
};

function CashCard({
  card,
  isEditingStep,
  editStepValue,
  isEditingBalance,
  editBalanceValue,
  isDeleteConfirm,
  onIncrement,
  onDecrement,
  onEditStart,
  onEditCancel,
  onEditStepChange,
  onEditBalanceChange,
  onEditSave,
  onDeleteStart,
  onDeleteCancel,
  onDeleteConfirm,
}: CashCardProps) {
  const isEditing = isEditingStep || isEditingBalance;
  const decrementDisabled = card.balance === 0;

  return (
    <Card
      style={{
        display: "flex",
        flexDirection: "column",
        gap: TOKENS.SPACE_2,
        minHeight: "220px",
      }}
    >
      {/* Header: currency name + sign */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>
          {card.currency.name} {card.currency.sign}
        </h3>
        <div style={{ display: "flex", gap: "8px" }}>
          {!isEditing && (
            <button
              onClick={onEditStart}
              style={{
                background: "none",
                border: "none",
                color: TOKENS.INK_FADED,
                cursor: "pointer",
                fontSize: "1rem",
                padding: "4px",
              }}
              title="Edit"
              type="button"
            >
              &#9881;
            </button>
          )}
          <button
            onClick={onDeleteStart}
            style={{
              background: "none",
              border: "none",
              color: TOKENS.ACCENT_RED,
              cursor: "pointer",
              fontSize: "1rem",
              padding: "4px",
            }}
            title="Delete card"
            type="button"
          >
            &#10005;
          </button>
        </div>
      </div>

      {/* Balance display or edit */}
      {isEditingBalance ? (
        <div style={{ textAlign: "center" }}>
          <DecimalInput
            value={editBalanceValue}
            placeholder="Balance..."
            onChangeCallback={(
              e: React.ChangeEvent<HTMLInputElement>,
            ) => onEditBalanceChange(e.target.value)}
          />
        </div>
      ) : (
        <span
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            textAlign: "center",
            color: TOKENS.INK_FADED,
          }}
        >
          {prettyMoney(card.balance)} {card.currency.sign}
        </span>
      )}

      {/* Step display or edit */}
      {isEditingStep ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              color: TOKENS.INK_FADED,
              fontSize: "1rem",
              flexShrink: 0,
            }}
          >
            step:
          </span>
          <DecimalInput
            value={editStepValue}
            placeholder="Step..."
            onChangeCallback={(
              e: React.ChangeEvent<HTMLInputElement>,
            ) => onEditStepChange(e.target.value)}
          />
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            color: TOKENS.INK_FADED,
            fontSize: "1.1rem",
            fontWeight: 500,
          }}
        >
          step: {prettyMoney(card.step)} {card.currency.sign}
        </div>
      )}

      {/* Edit actions or -/+ buttons */}
      {isEditing ? (
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            marginTop: "auto",
          }}
        >
          <div style={{ width: "80px", height: "36px" }}>
            <Button
              color="green"
              onClickCallback={onEditSave}
              overrideStyles={{
                fontSize: "1rem",
                padding: "4px 8px",
              }}
            >
              Save
            </Button>
          </div>
          <div style={{ width: "80px", height: "36px" }}>
            <Button
              onClickCallback={onEditCancel}
              overrideStyles={{
                fontSize: "1rem",
                padding: "4px 8px",
                background: TOKENS.BG_LIGHTER,
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: TOKENS.SPACE_4,
            marginTop: "auto",
          }}
        >
          <div style={{ width: "80px", height: "40px" }}>
            <Button
              color="red"
              onClickCallback={onDecrement}
              overrideStyles={{
                fontSize: "1.2rem",
                fontWeight: 700,
                opacity: decrementDisabled ? 0.4 : 1,
                pointerEvents: decrementDisabled
                  ? "none"
                  : "auto",
                padding: "4px 16px",
              }}
            >
              -
            </Button>
          </div>
          <div style={{ width: "80px", height: "40px" }}>
            <Button
              color="green"
              onClickCallback={onIncrement}
              overrideStyles={{
                fontSize: "1.2rem",
                fontWeight: 700,
                padding: "4px 16px",
              }}
            >
              +
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {isDeleteConfirm && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "4px",
          }}
        >
          <span
            style={{
              color: TOKENS.ACCENT_RED,
              fontSize: "1rem",
            }}
          >
            Delete this card?
          </span>
          <div style={{ width: "70px", height: "36px" }}>
            <Button
              color="red"
              onClickCallback={onDeleteConfirm}
              overrideStyles={{
                fontSize: "1rem",
                padding: "4px 8px",
              }}
            >
              Yes
            </Button>
          </div>
          <div style={{ width: "70px", height: "36px" }}>
            <Button
              onClickCallback={onDeleteCancel}
              overrideStyles={{
                fontSize: "1rem",
                padding: "4px 8px",
                background: TOKENS.BG_LIGHTER,
              }}
            >
              No
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─────────────────────────────────────────────────────────
// AddCashForm
// ─────────────────────────────────────────────────────────
type AddCashFormProps = {
  availableCurrencies: Currency[];
  addForm: AddFormState;
  onCurrencyChange: (currencyId: string) => void;
  onStepChange: (step: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

function AddCashForm({
  availableCurrencies,
  addForm,
  onCurrencyChange,
  onStepChange,
  onSave,
  onCancel,
}: AddCashFormProps) {
  return (
    <Card>
      <h3 style={{ margin: 0 }}>Add Cash Card</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: TOKENS.SPACE_2,
        }}
      >
        <Dropdown
          value={addForm.currencyId}
          onChangeCallback={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onCurrencyChange(e.target.value)
          }
        >
          <option value="">Select currency...</option>
          {availableCurrencies.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name} ({c.sign})
            </option>
          ))}
        </Dropdown>

        <DecimalInput
          value={addForm.step}
          placeholder="Step value..."
          onChangeCallback={(e: React.ChangeEvent<HTMLInputElement>) =>
            onStepChange(e.target.value)
          }
        />

        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          <div style={{ width: "100px", height: "40px" }}>
            <Button
              color="green"
              onClickCallback={onSave}
              overrideStyles={{ padding: "8px 16px" }}
            >
              Add
            </Button>
          </div>
          <div style={{ width: "100px", height: "40px" }}>
            <Button
              onClickCallback={onCancel}
              overrideStyles={{
                padding: "8px 16px",
                background: TOKENS.BG_LIGHTER,
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
