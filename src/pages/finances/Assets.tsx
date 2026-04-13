import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { Container } from "src/components/Container";
import { Card } from "src/components/Card";
import { Button } from "src/components/Button";
import { NoData } from "src/components/NoData";
import { TextInput } from "src/components/TextInput";
import { TOKENS } from "src/styles/tokens";
import { useMobile } from "src/context/MobileContext";
import {
  assetsList,
  assetsCreate,
  assetsUpdate,
  assetsDelete,
  assetFieldCreate,
  assetFieldUpdate,
  assetFieldDelete,
  assetDocumentDownload,
  assetDocumentUpload,
  assetDocumentDelete,
} from "src/data/api/assets";
import type { Asset, AssetField } from "src/data/types";

export default function Page() {
  const { isMobile } = useMobile();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(
    null,
  );
  const [editingAssetId, setEditingAssetId] = useState<number | null>(
    null,
  );

  const fetchAssets = useCallback(async () => {
    try {
      const response = await assetsList();
      setAssets(response.result);
    } catch {
      // errors handled by apiCall via toast
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleAddAsset = useCallback(async () => {
    const trimmed = addName.trim();
    if (!trimmed) {
      toast.error("Asset name is required");
      return;
    }

    try {
      const response = await assetsCreate({ name: trimmed });
      setAssets((prev) => [...prev, response.result]);
      setEditingAssetId(response.result.id);
      setShowAddForm(false);
      setAddName("");
      toast.success("Asset created");
    } catch {
      // errors handled by apiCall via toast
    }
  }, [addName]);

  const handleUpdateName = useCallback(
    async (assetId: number, name: string) => {
      try {
        const response = await assetsUpdate(assetId, { name });
        setAssets((prev) =>
          prev.map((a) =>
            a.id === assetId ? response.result : a,
          ),
        );
        toast.success("Asset name updated");
      } catch {
        // errors handled by apiCall via toast
      }
    },
    [],
  );

  const handleDeleteAsset = useCallback(
    async (id: number) => {
      try {
        await assetsDelete(id);
        setAssets((prev) => prev.filter((a) => a.id !== id));
        setDeleteConfirmId(null);
        toast.success("Asset deleted");
      } catch {
        // errors handled by apiCall via toast
      }
    },
    [],
  );

  const handleAddField = useCallback(
    async (assetId: number, key: string, value: string) => {
      try {
        const response = await assetFieldCreate(assetId, {
          key,
          value,
        });
        setAssets((prev) =>
          prev.map((a) =>
            a.id === assetId ? response.result : a,
          ),
        );
        toast.success("Field added");
      } catch {
        // errors handled by apiCall via toast
      }
    },
    [],
  );

  const handleUpdateField = useCallback(
    async (
      assetId: number,
      fieldId: number,
      updates: { key?: string; value?: string },
    ) => {
      try {
        const response = await assetFieldUpdate(
          assetId,
          fieldId,
          updates,
        );
        setAssets((prev) =>
          prev.map((a) =>
            a.id === assetId ? response.result : a,
          ),
        );
        toast.success("Field updated");
      } catch {
        // errors handled by apiCall via toast
      }
    },
    [],
  );

  const handleDeleteField = useCallback(
    async (assetId: number, fieldId: number) => {
      try {
        await assetFieldDelete(assetId, fieldId);
        setAssets((prev) =>
          prev.map((a) =>
            a.id === assetId
              ? {
                  ...a,
                  fields: a.fields.filter(
                    (f) => f.id !== fieldId,
                  ),
                }
              : a,
          ),
        );
        toast.success("Field removed");
      } catch {
        // errors handled by apiCall via toast
      }
    },
    [],
  );

  const handleUploadDocument = useCallback(
    async (assetId: number, file: File) => {
      try {
        const response = await assetDocumentUpload(assetId, file);
        setAssets((prev) =>
          prev.map((a) =>
            a.id === assetId ? response.result : a,
          ),
        );
        toast.success("Document uploaded");
      } catch {
        // errors handled by apiCall or assetDocumentUpload
      }
    },
    [],
  );

  const handleDownloadDocument = useCallback(
    async (
      assetId: number,
      docId: number,
      filename: string,
    ) => {
      try {
        await assetDocumentDownload(assetId, docId, filename);
      } catch {
        toast.error("Failed to download document");
      }
    },
    [],
  );

  const handleDeleteDocument = useCallback(
    async (assetId: number, docId: number) => {
      try {
        await assetDocumentDelete(assetId, docId);
        setAssets((prev) =>
          prev.map((a) =>
            a.id === assetId
              ? {
                  ...a,
                  documents: a.documents.filter(
                    (d) => d.id !== docId,
                  ),
                }
              : a,
          ),
        );
        toast.success("Document removed");
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
      <h2 style={{ margin: 0 }}>Assets</h2>

      {assets.length === 0 && !showAddForm && (
        <Card>
          <p style={{ color: TOKENS.INK_FADED, textAlign: "center" }}>
            No assets yet. Add your first asset to start tracking.
          </p>
          <div style={{ maxWidth: "200px", margin: "0 auto" }}>
            <Button
              color="green"
              onClickCallback={() => setShowAddForm(true)}
              overrideStyles={{ padding: "12px 24px" }}
            >
              + Add Asset
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
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            isEditing={editingAssetId === asset.id}
            onEditStart={() => setEditingAssetId(asset.id)}
            onEditEnd={() => setEditingAssetId(null)}
            isDeleteConfirm={deleteConfirmId === asset.id}
            onUpdateName={(name: string) =>
              handleUpdateName(asset.id, name)
            }
            onDeleteStart={() => setDeleteConfirmId(asset.id)}
            onDeleteCancel={() => setDeleteConfirmId(null)}
            onDeleteConfirm={() => handleDeleteAsset(asset.id)}
            onAddField={(key: string, value: string) =>
              handleAddField(asset.id, key, value)
            }
            onUpdateField={(
              fieldId: number,
              updates: { key?: string; value?: string },
            ) => handleUpdateField(asset.id, fieldId, updates)}
            onDeleteField={(fieldId: number) =>
              handleDeleteField(asset.id, fieldId)
            }
            onUploadDocument={(file: File) =>
              handleUploadDocument(asset.id, file)
            }
            onDownloadDocument={(
              docId: number,
              filename: string,
            ) =>
              handleDownloadDocument(asset.id, docId, filename)
            }
            onDeleteDocument={(docId: number) =>
              handleDeleteDocument(asset.id, docId)
            }
          />
        ))}
      </div>

      {assets.length > 0 && !showAddForm && (
        <div
          style={{
            maxWidth: "200px",
            margin: isMobile ? "0 auto" : undefined,
          }}
        >
          <Button
            color="green"
            onClickCallback={() => setShowAddForm(true)}
            overrideStyles={{ padding: "12px 24px", fontSize: "large" }}
          >
            + Add Asset
          </Button>
        </div>
      )}

      {showAddForm && (
        <AddAssetForm
          name={addName}
          onNameChange={(value: string) => setAddName(value)}
          onSave={handleAddAsset}
          onCancel={() => {
            setShowAddForm(false);
            setAddName("");
          }}
        />
      )}
    </Container>
  );
}

// ─────────────────────────────────────────────────────────
// AssetCard
// ─────────────────────────────────────────────────────────
type AssetCardProps = {
  asset: Asset;
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
  isDeleteConfirm: boolean;
  onUpdateName: (name: string) => void;
  onDeleteStart: () => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
  onAddField: (key: string, value: string) => void;
  onUpdateField: (
    fieldId: number,
    updates: { key?: string; value?: string },
  ) => void;
  onDeleteField: (fieldId: number) => void;
  onUploadDocument: (file: File) => void;
  onDownloadDocument: (docId: number, filename: string) => void;
  onDeleteDocument: (docId: number) => void;
};

function AssetCard({
  asset,
  isEditing,
  onEditStart,
  onEditEnd,
  isDeleteConfirm,
  onUpdateName,
  onDeleteStart,
  onDeleteCancel,
  onDeleteConfirm,
  onAddField,
  onUpdateField,
  onDeleteField,
  onUploadDocument,
  onDownloadDocument,
  onDeleteDocument,
}: AssetCardProps) {
  const [editNameValue, setEditNameValue] = useState(asset.name);
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [editingFieldId, setEditingFieldId] = useState<number | null>(null);
  const [editFieldKey, setEditFieldKey] = useState("");
  const [editFieldValue, setEditFieldValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const trimmed = editNameValue.trim();
    if (!trimmed) {
      toast.error("Asset name is required");
      return;
    }
    if (trimmed !== asset.name) {
      onUpdateName(trimmed);
    }
    onEditEnd();
    setShowAddField(false);
    setEditingFieldId(null);
  };

  const handleAddFieldSubmit = () => {
    const trimmedKey = newFieldKey.trim();
    const trimmedValue = newFieldValue.trim();
    if (!trimmedKey) {
      toast.error("Field key is required");
      return;
    }
    if (!trimmedValue) {
      toast.error("Field value is required");
      return;
    }
    onAddField(trimmedKey, trimmedValue);
    setNewFieldKey("");
    setNewFieldValue("");
    setShowAddField(false);
  };

  const handleFieldSave = (field: AssetField) => {
    const updates: { key?: string; value?: string } = {};
    if (editFieldKey.trim() !== field.key) {
      updates.key = editFieldKey.trim();
    }
    if (editFieldValue.trim() !== field.value) {
      updates.value = editFieldValue.trim();
    }
    if (Object.keys(updates).length > 0) {
      if (updates.key !== undefined && !updates.key) {
        toast.error("Field key is required");
        return;
      }
      onUpdateField(field.id, updates);
    }
    setEditingFieldId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadDocument(file);
    }
    e.target.value = "";
  };

  // ── View mode ──
  if (!isEditing) {
    return (
      <Card
        style={{
          display: "flex",
          flexDirection: "column",
          gap: TOKENS.SPACE_2,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0 }}>{asset.name}</h3>
          <button
            onClick={() => {
              setEditNameValue(asset.name);
              onEditStart();
            }}
            style={{
              background: "none",
              border: "none",
              color: TOKENS.INK_FADED,
              cursor: "pointer",
              fontSize: "1rem",
              padding: "4px",
            }}
            title="Edit asset"
            type="button"
          >
            &#9881;
          </button>
        </div>

        {asset.fields.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {asset.fields.map((field) => (
              <div
                key={field.id}
                style={{
                  display: "flex",
                  gap: "8px",
                  padding: "4px 0",
                  borderBottom: "1px solid rgba(26, 18, 10, 0.25)",
                }}
              >
                <span
                  style={{
                    color: TOKENS.INK_GHOST,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                  }}
                >
                  {field.key}:
                </span>
                <span style={{ fontSize: "1.1rem", fontWeight: 500, color: TOKENS.INK_FADED }}>
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {asset.documents.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span
              style={{
                fontSize: "1.1rem",
                color: TOKENS.INK_GHOST,
                fontWeight: 700,
              }}
            >
              Documents
            </span>
            {asset.documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() =>
                  onDownloadDocument(doc.id, doc.filename)
                }
                style={{
                  background: "none",
                  border: "none",
                  color: TOKENS.LINK,
                  cursor: "pointer",
                  fontSize: "1rem",
                  padding: "4px 0",
                  textDecoration: "underline",
                  textAlign: "left",
                }}
                type="button"
              >
                {doc.filename}
              </button>
            ))}
          </div>
        )}
      </Card>
    );
  }

  // ── Edit mode ──
  return (
    <Card
      style={{
        display: "flex",
        flexDirection: "column",
        gap: TOKENS.SPACE_2,
      }}
    >
      {/* Editable name */}
      <TextInput
        value={editNameValue}
        placeholder="Asset name..."
        onChangeCallback={(
          e: React.ChangeEvent<HTMLInputElement>,
        ) => setEditNameValue(e.target.value)}
      />

      {/* Fields section */}
      {asset.fields.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span
            style={{
              fontSize: "1rem",
              color: TOKENS.INK_FADED,
              fontWeight: 700,
            }}
          >
            Fields
          </span>
          {asset.fields.map((field) =>
            editingFieldId === field.id ? (
              <div
                key={field.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <TextInput
                  value={editFieldKey}
                  placeholder="Key..."
                  onChangeCallback={(
                    e: React.ChangeEvent<HTMLInputElement>,
                  ) => setEditFieldKey(e.target.value)}
                />
                <TextInput
                  value={editFieldValue}
                  placeholder="Value..."
                  onChangeCallback={(
                    e: React.ChangeEvent<HTMLInputElement>,
                  ) => setEditFieldValue(e.target.value)}
                />
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <div style={{ width: "60px", height: "30px" }}>
                    <Button
                      color="green"
                      onClickCallback={() =>
                        handleFieldSave(field)
                      }
                      overrideStyles={{
                        fontSize: "1rem",
                        padding: "2px 6px",
                      }}
                    >
                      Save
                    </Button>
                  </div>
                  <div style={{ width: "60px", height: "30px" }}>
                    <Button
                      onClickCallback={() =>
                        setEditingFieldId(null)
                      }
                      overrideStyles={{
                        fontSize: "1rem",
                        padding: "2px 6px",
                        background: TOKENS.BG_LIGHTER,
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={field.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "4px 0",
                  borderBottom: "1px solid rgba(26, 18, 10, 0.25)",
                }}
              >
                <div style={{ display: "flex", gap: "8px" }}>
                  <span
                    style={{
                      color: TOKENS.INK_FADED,
                      fontSize: "1rem",
                    }}
                  >
                    {field.key}:
                  </span>
                  <span style={{ fontSize: "1rem" }}>
                    {field.value}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    onClick={() => {
                      setEditFieldKey(field.key);
                      setEditFieldValue(field.value);
                      setEditingFieldId(field.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: TOKENS.INK_FADED,
                      cursor: "pointer",
                      fontSize: "1rem",
                      padding: "4px 6px",
                    }}
                    title="Edit field"
                    type="button"
                  >
                    &#9998;
                  </button>
                  <button
                    onClick={() => onDeleteField(field.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: TOKENS.ACCENT_RED,
                      cursor: "pointer",
                      fontSize: "1rem",
                      padding: "4px 6px",
                    }}
                    title="Delete field"
                    type="button"
                  >
                    &#10005;
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {/* Add field */}
      {showAddField ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <TextInput
            value={newFieldKey}
            placeholder="Key..."
            onChangeCallback={(
              e: React.ChangeEvent<HTMLInputElement>,
            ) => setNewFieldKey(e.target.value)}
          />
          <TextInput
            value={newFieldValue}
            placeholder="Value..."
            onChangeCallback={(
              e: React.ChangeEvent<HTMLInputElement>,
            ) => setNewFieldValue(e.target.value)}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ width: "80px", height: "36px" }}>
              <Button
                color="green"
                onClickCallback={handleAddFieldSubmit}
                overrideStyles={{
                  fontSize: "1rem",
                  padding: "4px 8px",
                }}
              >
                Add
              </Button>
            </div>
            <div style={{ width: "80px", height: "36px" }}>
              <Button
                onClickCallback={() => {
                  setShowAddField(false);
                  setNewFieldKey("");
                  setNewFieldValue("");
                }}
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
        </div>
      ) : (
        <div style={{ width: "150px", height: "44px" }}>
          <Button
            onClickCallback={() => setShowAddField(true)}
            overrideStyles={{
              fontSize: "1rem",
              padding: "4px 8px",
              background: TOKENS.BG_LIGHTER,
            }}
          >
            + Add Field
          </Button>
        </div>
      )}

      {/* Documents section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {asset.documents.length > 0 && (
          <>
            <span
              style={{
                fontSize: "1.1rem",
                color: TOKENS.INK_GHOST,
                fontWeight: 700,
              }}
            >
              Documents
            </span>
            {asset.documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "4px 0",
                  borderBottom: "1px solid rgba(26, 18, 10, 0.25)",
                }}
              >
                <button
                  onClick={() =>
                    onDownloadDocument(doc.id, doc.filename)
                  }
                  style={{
                    background: "none",
                    border: "none",
                    color: TOKENS.LINK,
                    cursor: "pointer",
                    fontSize: "1rem",
                    padding: 0,
                    textDecoration: "underline",
                    textAlign: "left",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                    minWidth: 0,
                  }}
                  type="button"
                >
                  {doc.filename}
                </button>
                <button
                  onClick={() => onDeleteDocument(doc.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: TOKENS.ACCENT_RED,
                    cursor: "pointer",
                    fontSize: "1rem",
                    padding: "4px 6px",
                    flexShrink: 0,
                  }}
                  title="Delete document"
                  type="button"
                >
                  &#10005;
                </button>
              </div>
            ))}
          </>
        )}

        {/* Upload document */}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <div style={{ width: "200px", height: "44px" }}>
          <Button
            onClickCallback={() =>
              fileInputRef.current?.click()
            }
            overrideStyles={{
              fontSize: "1rem",
              padding: "4px 12px",
              background: TOKENS.BG_LIGHTER,
              whiteSpace: "nowrap",
            }}
          >
            + Upload Document
          </Button>
        </div>
      </div>

      {/* Bottom actions */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "auto",
          paddingTop: "8px",
          borderTop: "1px solid rgba(26, 18, 10, 0.25)",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "80px", height: "36px" }}>
          <Button
            color="green"
            onClickCallback={handleSave}
            overrideStyles={{
              fontSize: "1rem",
              padding: "4px 12px",
            }}
          >
            Save
          </Button>
        </div>
        <div style={{ width: "80px", height: "36px" }}>
          <Button
            color="red"
            onClickCallback={onDeleteStart}
            overrideStyles={{
              fontSize: "1rem",
              padding: "4px 12px",
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Delete confirmation */}
      {isDeleteConfirm && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              color: TOKENS.ACCENT_RED,
              fontSize: "1rem",
            }}
          >
            Delete this asset?
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
// AddAssetForm
// ─────────────────────────────────────────────────────────
type AddAssetFormProps = {
  name: string;
  onNameChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

function AddAssetForm({
  name,
  onNameChange,
  onSave,
  onCancel,
}: AddAssetFormProps) {
  return (
    <Card>
      <h3 style={{ margin: 0 }}>Add Asset</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: TOKENS.SPACE_2,
        }}
      >
        <TextInput
          value={name}
          placeholder="Asset name..."
          onChangeCallback={(
            e: React.ChangeEvent<HTMLInputElement>,
          ) => onNameChange(e.target.value)}
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
