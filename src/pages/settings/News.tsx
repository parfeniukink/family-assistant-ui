import { useState, useEffect, useMemo } from "react";
import { useIdentity } from "src/context/IdentityContext";
import { TOKENS } from "src/styles/tokens";

type ParsedProfile = {
  skip: string[];
  high_priority: string[];
  recently_deleted: {
    title: string;
    feedback?: string;
    deleted_at?: string;
  }[];
};

function tryParseProfile(raw: string): ParsedProfile | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (
      typeof data === "object" &&
      (Array.isArray(data.skip) ||
        Array.isArray(data.high_priority) ||
        Array.isArray(data.boost) ||
        Array.isArray(data.recently_deleted) ||
        Array.isArray(data.deleted))
    ) {
      return {
        skip: data.skip ?? [],
        high_priority: data.high_priority ?? data.boost ?? [],
        recently_deleted:
          data.recently_deleted ?? data.deleted ?? [],
      };
    }
  } catch {
    /* not JSON — fall through */
  }
  return null;
}

const tagStyle = (bg: string): React.CSSProperties => ({
  display: "inline-block",
  fontSize: "0.8rem",
  padding: "0.25rem 0.6rem",
  borderRadius: "4px",
  background: bg,
  color: TOKENS.WHITE,
});

function ProfilePreview({ profile }: { profile: ParsedProfile }) {
  const sections: {
    label: string;
    color: string;
    items: string[];
  }[] = [
    { label: "SKIP", color: TOKENS.BG_RED, items: profile.skip },
    {
      label: "HIGH PRIORITY",
      color: TOKENS.BG_GREEN,
      items: profile.high_priority,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "0.75rem",
        border: TOKENS.BORDER,
        borderRadius: TOKENS.RADIUS,
      }}
    >
      {sections.map(
        ({ label, color, items }) =>
          items.length > 0 && (
            <div key={label}>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: "bold",
                  color: TOKENS.GRAY,
                  letterSpacing: "0.05em",
                  marginBottom: "0.4rem",
                  display: "block",
                }}
              >
                {label}
              </span>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.35rem",
                }}
              >
                {items.map((item, i) => (
                  <span key={i} style={tagStyle(color)}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ),
      )}

      {profile.recently_deleted.length > 0 && (
        <div>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: "bold",
              color: TOKENS.GRAY,
              letterSpacing: "0.05em",
              marginBottom: "0.4rem",
              display: "block",
            }}
          >
            RECENTLY DELETED
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.3rem",
            }}
          >
            {profile.recently_deleted.map((d, i) => (
              <div
                key={i}
                style={{
                  fontSize: "0.8rem",
                  color: TOKENS.WHITE,
                  padding: "0.3rem 0.5rem",
                  borderRadius: "4px",
                  background: TOKENS.BLACK,
                }}
              >
                <span style={{ opacity: 0.5 }}>&times;</span>{" "}
                {d.title}
                {d.deleted_at && (
                  <span
                    style={{
                      color: TOKENS.GRAY,
                      fontSize: "0.7rem",
                      marginLeft: "0.4rem",
                    }}
                  >
                    {d.deleted_at}
                  </span>
                )}
                {d.feedback && (
                  <span
                    style={{
                      color: TOKENS.GRAY,
                      fontStyle: "italic",
                      marginLeft: "0.5rem",
                    }}
                  >
                    — {d.feedback}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.skip.length === 0 &&
        profile.high_priority.length === 0 &&
        profile.recently_deleted.length === 0 && (
          <span style={{ fontSize: "0.8rem", color: TOKENS.GRAY }}>
            No rules yet. React to articles to generate preferences.
          </span>
        )}
    </div>
  );
}

export default function NewsSection() {
  const { user, updateConfig } = useIdentity();
  const [filterPrompt, setFilterPrompt] = useState("");
  const [preferenceProfile, setPreferenceProfile] = useState("");
  const [editingRaw, setEditingRaw] = useState(false);

  const [gcRetention, setGcRetention] = useState(
    String(user?.configuration.gcRetentionDays ?? 3),
  );
  const [gcRetentionEditing, setGcRetentionEditing] = useState(
    String(user?.configuration.gcRetentionDays ?? 3),
  );
  const [analyzePreferences, setAnalyzePreferences] = useState(
    user?.configuration.analyzePreferences ?? true,
  );

  useEffect(() => {
    if (user) {
      setGcRetention(String(user.configuration.gcRetentionDays ?? 3));
      setGcRetentionEditing(String(user.configuration.gcRetentionDays ?? 3));
      setAnalyzePreferences(user.configuration.analyzePreferences ?? true);
    }
  }, [user]);

  useEffect(() => {
    if (user?.configuration.newsFilterPrompt) {
      setFilterPrompt(user.configuration.newsFilterPrompt);
    }
  }, [user?.configuration.newsFilterPrompt]);

  useEffect(() => {
    if (user?.configuration.newsPreferenceProfile) {
      setPreferenceProfile(user.configuration.newsPreferenceProfile);
    }
  }, [user?.configuration.newsPreferenceProfile]);

  const parsed = useMemo(
    () => tryParseProfile(preferenceProfile),
    [preferenceProfile],
  );

  async function handleGcRetentionComplete(value: string) {
    setGcRetention(value);
    const num = Number(value);
    if (!isNaN(num) && num > 0) {
      await updateConfig({ gcRetentionDays: num });
    }
  }

  async function handleAnalyzeToggle() {
    const next = !analyzePreferences;
    setAnalyzePreferences(next);
    await updateConfig({ analyzePreferences: next });
  }

  async function handleFilterSave() {
    await updateConfig({
      newsFilterPrompt: filterPrompt || null,
    });
  }

  async function handlePreferenceSave() {
    await updateConfig({
      newsPreferenceProfile: preferenceProfile || null,
    });
  }

  return (
    <div
      style={{
        textAlign: "left",
      }}
    >
      <h2>Settings</h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <label className="label-items">
          <span>GC RETENTION DAYS</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={gcRetentionEditing}
            onChange={(e) => setGcRetentionEditing(e.target.value)}
            onBlur={() => {
              if (gcRetentionEditing !== gcRetention) {
                handleGcRetentionComplete(gcRetentionEditing);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            placeholder="3"
            style={{
              background: "transparent",
              maxWidth: "200px",
              height: "50px",
              fontSize: "medium",
            }}
          />
        </label>
        <label className="label-items">
          <span>ANALYZE PREFERENCES</span>
          <input
            type="checkbox"
            checked={analyzePreferences}
            onChange={handleAnalyzeToggle}
            style={{
              width: "20px",
              height: "20px",
              cursor: "pointer",
            }}
          />
        </label>
      </div>

      <h2>Prompts</h2>

      <h3 style={{ textAlign: "right" }}>NEWS Filter Prompt</h3>
      <textarea
        value={filterPrompt}
        onChange={(e) => setFilterPrompt(e.target.value)}
        onBlur={handleFilterSave}
        placeholder="e.g. Only keep articles about AI, crypto, and geopolitics..."
        rows={4}
        style={{
          width: "100%",
          padding: "0.75rem",
          fontFamily: "inherit",
          fontSize: "0.9rem",
          color: TOKENS.WHITE,
          background: "transparent",
          border: TOKENS.BORDER,
          borderRadius: TOKENS.RADIUS,
          resize: "vertical",
          boxSizing: "border-box",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "1rem",
        }}
      >
        <h3 style={{ margin: 0 }}>NEWS Preference Profile</h3>
        {parsed && (
          <button
            onClick={() => setEditingRaw(!editingRaw)}
            style={{
              fontSize: "0.75rem",
              padding: "0.25rem 0.6rem",
              background: editingRaw ? TOKENS.BLACK : "transparent",
              color: TOKENS.GRAY,
              border: TOKENS.BORDER,
              borderRadius: TOKENS.RADIUS,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {editingRaw ? "PREVIEW" : "EDIT RAW"}
          </button>
        )}
      </div>
      <span
        style={{
          display: "block",
          fontSize: "0.75rem",
          color: TOKENS.GRAY,
          marginBottom: "0.5rem",
          textAlign: "right",
        }}
      >
        Auto-generated by AI from your reactions. Edit to override.
      </span>

      {parsed && !editingRaw ? (
        <ProfilePreview profile={parsed} />
      ) : (
        <textarea
          value={preferenceProfile}
          onChange={(e) => setPreferenceProfile(e.target.value)}
          onBlur={handlePreferenceSave}
          placeholder="AI will generate this from your article reactions..."
          rows={6}
          style={{
            width: "100%",
            padding: "0.75rem",
            fontFamily: "inherit",
            fontSize: "0.9rem",
            color: TOKENS.WHITE,
            background: "transparent",
            border: TOKENS.BORDER,
            borderRadius: TOKENS.RADIUS,
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
}
