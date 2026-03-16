import { useEffect, useState } from "react";
import { Container, Card, NoData, RequireAuth } from "src/components";
import { useMobile } from "src/context";
import { TOKENS } from "src/styles/tokens";
import {
  newsGroupsList,
  newsItemGet,
  newsItemDelete,
  newsItemBookmark,
  newsItemReact,
  newsItemExtend,
  newsItemFeedback,
} from "src/data/api/client";
import type {
  NewsGroup,
  NewsGroupItem,
  NewsItemDetail,
  NewsSourceBlock,
} from "src/data/types";

const DEFAULT_WINDOW_DAYS = 7;

const REACTIONS = ["🔥", "👀", "😐", "👎"];

function hasReaction(item: NewsGroupItem): boolean {
  return item.bookmarked || (item.reaction != null && item.reaction !== "👀");
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function parseLocal(iso: string): Date {
  return new Date(iso + "T00:00:00");
}

function cleanHtml(raw: string): string {
  const doc = new DOMParser().parseFromString(raw, "text/html");
  return doc.body.textContent || "";
}

function formatDateHeading(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function toBullets(raw: string): string[] {
  const text = cleanHtml(raw);
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return parts.length > 0 ? parts : [text];
}

/* ── Icon button (transparent, emoji-based) ── */

function IconBtn({
  emoji,
  label,
  onClick,
  active,
  disabled,
  size = "1.1rem",
}: {
  emoji: string;
  label?: string;
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
  disabled?: boolean;
  size?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
      title={label}
      style={{
        background: "transparent",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: size,
        padding: "0.25rem",
        lineHeight: 1,
        opacity: disabled ? 0.3 : active ? 1 : hovered ? 0.9 : 0.5,
        filter: active ? "none" : "grayscale(80%)",
        transition: "opacity 0.15s, filter 0.15s",
      }}
    >
      {emoji}
    </button>
  );
}

/* ── Preview modal ── */

function PreviewModal({
  item,
  detail,
  source,
  onClose,
  onBookmark,
  onReact,
  onDelete,
  onFeedback,
  isMobile,
}: {
  item: NewsGroupItem;
  detail: NewsItemDetail | null;
  source: string;
  onClose: () => void;
  onBookmark: (id: number) => void;
  onReact: (id: number, reaction: string | null) => void;
  onDelete: (id: number) => void;
  onFeedback: (id: number, feedback: string | null) => void;
  isMobile: boolean;
}) {
  const bullets = detail ? toBullets(detail.description) : [];
  const [extending, setExtending] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState(detail?.humanFeedback ?? "");
  const [savingFeedback, setSavingFeedback] = useState(false);

  useEffect(() => {
    setFeedbackText(detail?.humanFeedback ?? "");
  }, [detail?.humanFeedback]);

  async function handleFeedbackSave() {
    setSavingFeedback(true);
    try {
      const value = feedbackText.trim() || null;
      onFeedback(item.id, value);
    } finally {
      setSavingFeedback(false);
      setFeedbackOpen(false);
    }
  }

  async function handleExtend(mode: "microscope" | "telescope") {
    setExtending(mode);
    try {
      await newsItemExtend(item.id, mode);
    } catch {
      // handled by apiCall
    } finally {
      setExtending(null);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "0.25rem" : "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: TOKENS.BG_LIGHTER,
          border: TOKENS.BORDER,
          borderRadius: TOKENS.RADIUS,
          padding: isMobile ? "0.75rem" : "1.5rem",
          maxWidth: isMobile ? "600px" : "900px",
          width: "100%",
          maxHeight: isMobile ? "90vh" : "80vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          textAlign: "left",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
          }}
        >
          <h3
            style={{
              margin: 0,
              flex: 1,
              color: hasReaction(item) ? TOKENS.WHITE : TOKENS.GRAY,
            }}
          >
            {item.reaction && (
              <span style={{ marginRight: "0.4rem" }}>{item.reaction}</span>
            )}
            {cleanHtml(item.title)}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: TOKENS.GRAY,
              cursor: "pointer",
              fontSize: "1.25rem",
              padding: 0,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            &#10005;
          </button>
        </div>

        {/* Source badge + bookmark indicator */}
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <span
            style={{
              fontSize: "0.7rem",
              padding: "0.1rem 0.4rem",
              borderRadius: "4px",
              background: TOKENS.BG_BLUE,
              color: TOKENS.WHITE,
            }}
          >
            {source}
          </span>
          {item.bookmarked && <span style={{ fontSize: "0.75rem" }}>🔖</span>}
        </div>

        {/* Description */}
        {!detail ? (
          <span style={{ color: TOKENS.GRAY, fontSize: "0.85rem" }}>
            Loading...
          </span>
        ) : (
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.2rem",
              color: TOKENS.GRAY,
              fontSize: "0.9rem",
              lineHeight: 1.7,
              listStyleType: "disc",
            }}
          >
            {bullets.map((b, i) => (
              <li key={i} style={{ marginBottom: "0.3rem" }}>
                {b}
              </li>
            ))}
          </ul>
        )}

        {/* AI analysis results */}
        {detail?.detailedDescription && (
          <div
            style={{
              background: TOKENS.BG,
              borderRadius: TOKENS.RADIUS,
              padding: "0.75rem",
              fontSize: "0.85rem",
              color: TOKENS.GRAY,
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: TOKENS.WHITE, fontSize: "0.75rem" }}>
              Deep dive
            </strong>
            <ul style={{ margin: "0.35rem 0 0", paddingLeft: "1.2rem" }}>
              {toBullets(detail.detailedDescription).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        )}
        {detail?.extendedDescription && (
          <div
            style={{
              background: TOKENS.BG,
              borderRadius: TOKENS.RADIUS,
              padding: "0.75rem",
              fontSize: "0.85rem",
              color: TOKENS.GRAY,
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: TOKENS.WHITE, fontSize: "0.75rem" }}>
              Big picture
            </strong>
            <ul style={{ margin: "0.35rem 0 0", paddingLeft: "1.2rem" }}>
              {toBullets(detail.extendedDescription).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        )}

        {item.articleUrls && item.articleUrls.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.3rem",
            }}
          >
            {item.articleUrls.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (!item.viewed) {
                    newsItemReact(item.id, "\u{1F440}").catch(() => {});
                  }
                }}
                style={{
                  color: TOKENS.LINK,
                  fontSize: "0.85rem",
                  fontStyle: "italic",
                }}
              >
                {item.articleUrls.length > 1
                  ? `${i + 1} Link`
                  : "Full article..."}
              </a>
            ))}
          </div>
        )}

        {/* Human feedback */}
        {detail?.humanFeedback && !feedbackOpen && (
          <div
            style={{
              background: TOKENS.BG,
              borderRadius: TOKENS.RADIUS,
              padding: "0.75rem",
              fontSize: "0.85rem",
              color: TOKENS.GRAY,
              lineHeight: 1.6,
              cursor: "pointer",
            }}
            onClick={() => setFeedbackOpen(true)}
          >
            <strong style={{ color: TOKENS.WHITE, fontSize: "0.75rem" }}>
              My notes
            </strong>
            <div style={{ marginTop: "0.35rem" }}>{detail.humanFeedback}</div>
          </div>
        )}

        {feedbackOpen && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Your notes on this article..."
              rows={3}
              maxLength={5000}
              style={{
                background: TOKENS.BG,
                color: TOKENS.WHITE,
                border: TOKENS.BORDER,
                borderRadius: TOKENS.RADIUS,
                padding: "0.5rem",
                fontSize: "0.85rem",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={handleFeedbackSave}
                disabled={savingFeedback}
                style={{
                  background: TOKENS.BG_BLUE,
                  color: TOKENS.WHITE,
                  border: "none",
                  borderRadius: TOKENS.RADIUS,
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                {savingFeedback ? "Saving..." : "Save"}
              </button>
              {detail?.humanFeedback && (
                <button
                  onClick={() => {
                    onFeedback(item.id, null);
                    setFeedbackText("");
                    setFeedbackOpen(false);
                  }}
                  style={{
                    background: "transparent",
                    color: TOKENS.GRAY,
                    border: TOKENS.BORDER,
                    borderRadius: TOKENS.RADIUS,
                    padding: "0.3rem 0.75rem",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => {
                  setFeedbackText(detail?.humanFeedback ?? "");
                  setFeedbackOpen(false);
                }}
                style={{
                  background: "transparent",
                  color: TOKENS.GRAY,
                  border: "none",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.15rem",
            flexWrap: "wrap",
            borderTop: `1px solid ${TOKENS.BLACK}`,
            paddingTop: "0.75rem",
          }}
        >
          <IconBtn
            emoji="🔖"
            label="Bookmark"
            onClick={() => onBookmark(item.id)}
            active={item.bookmarked}
            size="1.3rem"
          />
          <IconBtn
            emoji="🔬"
            label={extending === "microscope" ? "Processing..." : "Deep dive"}
            onClick={() => handleExtend("microscope")}
            disabled={extending !== null}
            active={item.hasDetailedDescription}
            size="1.3rem"
          />
          <IconBtn
            emoji="🔭"
            label={extending === "telescope" ? "Processing..." : "Big picture"}
            onClick={() => handleExtend("telescope")}
            disabled={extending !== null}
            active={item.hasExtendedDescription}
            size="1.3rem"
          />
          <IconBtn
            emoji="💬"
            label="Add feedback"
            onClick={() => setFeedbackOpen(!feedbackOpen)}
            active={item.hasHumanFeedback || !!detail?.humanFeedback}
            size="1.3rem"
          />
          <IconBtn
            emoji="🗑️"
            label="Delete"
            onClick={() => {
              onDelete(item.id);
              onClose();
            }}
            size="1.3rem"
          />

          <div
            style={{
              width: "1px",
              height: "1.4rem",
              background: TOKENS.GRAY,
              opacity: 0.2,
              margin: "0 0.25rem",
              flexShrink: 0,
            }}
          />

          {REACTIONS.map((r) => (
            <IconBtn
              key={r}
              emoji={r}
              label={`React ${r}`}
              onClick={() => onReact(item.id, item.reaction === r ? null : r)}
              active={item.reaction === r}
              size="1.3rem"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Source card ── */

function SourceCard({
  block,
  onPreview,
  onBookmark,
  onDelete,
}: {
  block: NewsSourceBlock;
  onPreview: (item: NewsGroupItem, source: string) => void;
  onBookmark: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="news-source-card">
      <Card
        style={{
          background: TOKENS.BG_LIGHTER,
          padding: "0.75rem 1rem",
          gap: "0.4rem",
          boxShadow: "none",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontSize: "0.7rem",
            padding: "0.1rem 0.5rem",
            borderRadius: "4px",
            background: TOKENS.BG_BLUE,
            color: TOKENS.WHITE,
            alignSelf: "flex-start",
            marginBottom: "0.25rem",
          }}
        >
          {block.source}
        </span>

        {block.items.map((item, idx) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
              className="news-item-index"
              style={{
                fontSize: "0.75rem",
                color: TOKENS.GRAY,
                minWidth: "1.5rem",
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              {idx + 1}.
            </span>

            {item.reaction && (
              <span style={{ fontSize: "0.75rem", flexShrink: 0 }}>
                {item.reaction}
              </span>
            )}

            <span
              onClick={() => onPreview(item, block.source)}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: "0.85rem",
                color: hasReaction(item) ? TOKENS.WHITE : TOKENS.GRAY,
                opacity: item.viewed && !hasReaction(item) ? 0.6 : 1,
                cursor: "pointer",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textDecoration: hovered === item.id ? "underline" : "none",
              }}
            >
              {item.articleCount > 1 && (
                <span style={{ opacity: 0.6, marginRight: "0.3rem" }}>
                  ({item.articleCount})
                </span>
              )}
              {cleanHtml(item.title)}
            </span>

            <div
              style={{
                display: "flex",
                gap: "0",
                flexShrink: 0,
              }}
            >
              {item.hasDetailedDescription && (
                <span
                  style={{
                    fontSize: "0.65rem",
                    opacity: 0.7,
                    padding: "0.25rem",
                  }}
                  title="Deep dive available"
                >
                  🔬
                </span>
              )}
              {item.hasExtendedDescription && (
                <span
                  style={{
                    fontSize: "0.65rem",
                    opacity: 0.7,
                    padding: "0.25rem",
                  }}
                  title="Big picture available"
                >
                  🔭
                </span>
              )}
              {item.hasHumanFeedback && (
                <span
                  style={{
                    fontSize: "0.65rem",
                    opacity: 0.7,
                    padding: "0.25rem",
                  }}
                  title="Has feedback"
                >
                  💬
                </span>
              )}
              <IconBtn
                emoji="🔖"
                label="Bookmark"
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark(item.id);
                }}
                active={item.bookmarked}
              />
              <IconBtn
                emoji="🗑"
                label="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
              />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ── Page ── */

export default function Page() {
  const { isMobile } = useMobile();
  const [groups, setGroups] = useState<NewsGroup[]>([]);
  const [earliestDate, setEarliestDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [endDate, setEndDate] = useState<string>(toISODate(new Date()));
  const [windowDays, setWindowDays] = useState(DEFAULT_WINDOW_DAYS);
  const [filterBookmarked, setFilterBookmarked] = useState(false);
  const [filterCommented, setFilterCommented] = useState(false);
  const [filterReaction, setFilterReaction] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    item: NewsGroupItem;
    source: string;
  } | null>(null);
  const [previewDetail, setPreviewDetail] = useState<NewsItemDetail | null>(
    null,
  );

  async function fetchWindow(
    end: string,
    days: number,
    bookmarked?: boolean,
    reaction?: string | null,
    commented?: boolean,
  ) {
    setLoading(true);
    try {
      const useDate = !bookmarked && !commented;
      const startDate = useDate
        ? toISODate(addDays(parseLocal(end), -(days - 1)))
        : undefined;
      const response = await newsGroupsList({
        startDate,
        endDate: useDate ? end : undefined,
        bookmarked: bookmarked || undefined,
        reaction: reaction ?? undefined,
        commented: commented || undefined,
      });
      setGroups(response.result);
      if (response.earliestDate) {
        setEarliestDate(response.earliestDate);
      }
    } catch {
      // errors handled by apiCall
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWindow(endDate, windowDays);
  }, []);

  function handleDateChange(iso: string) {
    setEndDate(iso);
    fetchWindow(
      iso,
      windowDays,
      filterBookmarked,
      filterReaction,
      filterCommented,
    );
  }

  function handleWindowDaysChange(days: number) {
    setWindowDays(days);
    fetchWindow(endDate, days, filterBookmarked, filterReaction, filterCommented);
  }

  function handleBookmarkedFilter(checked: boolean) {
    setFilterBookmarked(checked);
    fetchWindow(endDate, windowDays, checked, filterReaction, filterCommented);
  }

  function handleCommentedFilter(checked: boolean) {
    setFilterCommented(checked);
    fetchWindow(endDate, windowDays, filterBookmarked, filterReaction, checked);
  }

  function handleReactionFilter(reaction: string | null) {
    setFilterReaction(reaction);
    fetchWindow(endDate, windowDays, filterBookmarked, reaction, filterCommented);
  }

  /* ── Item actions ── */

  function updateItemInGroups(
    id: number,
    updater: (item: NewsGroupItem) => NewsGroupItem,
  ) {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        blocks: g.blocks.map((b) => ({
          ...b,
          items: b.items.map((i) => (i.id === id ? updater(i) : i)),
        })),
      })),
    );
  }

  function removeItemFromGroups(id: number) {
    setGroups((prev) =>
      prev
        .map((g) => ({
          ...g,
          blocks: g.blocks
            .map((b) => ({
              ...b,
              items: b.items.filter((i) => i.id !== id),
            }))
            .filter((b) => b.items.length > 0),
        }))
        .filter((g) => g.blocks.length > 0),
    );
  }

  async function handleBookmark(id: number) {
    try {
      const updated = await newsItemBookmark(id);
      updateItemInGroups(id, (i) => ({
        ...i,
        bookmarked: updated.bookmarked,
      }));
      if (preview && preview.item.id === id) {
        setPreview((p) =>
          p ? { ...p, item: { ...p.item, bookmarked: updated.bookmarked } } : p,
        );
      }
    } catch {
      // handled by apiCall
    }
  }

  async function handleReact(id: number, reaction: string | null) {
    try {
      const updated = await newsItemReact(id, reaction);
      updateItemInGroups(id, (i) => ({
        ...i,
        reaction: updated.reaction,
      }));
      if (preview && preview.item.id === id) {
        setPreview((p) =>
          p ? { ...p, item: { ...p.item, reaction: updated.reaction } } : p,
        );
      }
    } catch {
      // handled by apiCall
    }
  }

  async function handleDelete(id: number) {
    try {
      await newsItemDelete(id);
      removeItemFromGroups(id);
    } catch {
      // handled by apiCall
    }
  }

  async function handleFeedback(id: number, feedback: string | null) {
    try {
      const updated = await newsItemFeedback(id, feedback);
      updateItemInGroups(id, (i) => ({
        ...i,
        hasHumanFeedback: updated.humanFeedback != null,
      }));
      setPreviewDetail(updated);
      if (preview && preview.item.id === id) {
        setPreview((p) =>
          p
            ? {
                ...p,
                item: {
                  ...p.item,
                  hasHumanFeedback: updated.humanFeedback != null,
                },
              }
            : p,
        );
      }
    } catch {
      // handled by apiCall
    }
  }

  async function handlePreview(item: NewsGroupItem, source: string) {
    setPreview({ item, source });
    setPreviewDetail(null);
    try {
      const detail = await newsItemGet(item.id);
      setPreviewDetail(detail);
    } catch {
      // handled by apiCall
    }
  }

  const rangeLabel =
    groups.length > 0
      ? `${formatDateHeading(groups[groups.length - 1].date)} — ${formatDateHeading(groups[0].date)}`
      : "";

  const filterPanel = (
    <>
      <input
        type="date"
        value={endDate}
        min={earliestDate ?? undefined}
        max={toISODate(new Date())}
        onChange={(e) => handleDateChange(e.target.value)}
        style={{
          background: TOKENS.BG_LIGHTER,
          color: TOKENS.WHITE,
          border: TOKENS.BORDER,
          borderRadius: TOKENS.RADIUS,
          padding: "0.4rem 0.6rem",
          fontSize: "0.8rem",
          cursor: "pointer",
          colorScheme: "dark",
          width: "100%",
        }}
      />

      <input
        type="number"
        value={windowDays}
        min={1}
        max={365}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v) && v >= 1) handleWindowDaysChange(v);
        }}
        title="Number of days"
        style={{
          background: TOKENS.BG_LIGHTER,
          color: TOKENS.WHITE,
          border: TOKENS.BORDER,
          borderRadius: TOKENS.RADIUS,
          padding: "0.4rem 0.6rem",
          fontSize: "0.8rem",
          width: "100%",
          textAlign: "center",
        }}
      />

      <IconBtn
        emoji="🔖"
        label="Bookmarked only"
        onClick={() => handleBookmarkedFilter(!filterBookmarked)}
        active={filterBookmarked}
        size="1.4rem"
      />
      <IconBtn
        emoji="💬"
        label="Commented only"
        onClick={() => handleCommentedFilter(!filterCommented)}
        active={filterCommented}
        size="1.4rem"
      />

      {REACTIONS.map((r) => (
        <IconBtn
          key={r}
          emoji={r}
          label={`Filter by ${r}`}
          onClick={() => handleReactionFilter(filterReaction === r ? null : r)}
          active={filterReaction === r}
          size="1.4rem"
        />
      ))}
    </>
  );

  const rangeBadge = rangeLabel ? (
    <span
      style={{
        fontSize: "0.65rem",
        color: TOKENS.GRAY,
        textAlign: "center",
        lineHeight: 1.3,
      }}
    >
      {rangeLabel}
    </span>
  ) : null;

  return (
    <RequireAuth>
      <Container>
        {/* Mobile: range label + filters at top */}
        <div
          className="news-filters-mobile"
          style={{
            display: "none",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            {filterPanel}
          </div>
          {rangeBadge}
        </div>

        <div style={{ display: "flex", gap: "1.5rem" }}>
          {/* Groups */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 0,
              minWidth: 0,
            }}
          >
            {!loading && groups.length === 0 && <NoData />}

            {groups.map((group, gi) => (
              <div key={group.date}>
                <div
                  className="news-date-heading"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    margin: gi === 0 ? "0 0 0.75rem 0" : "2.5rem 0 0.75rem 0",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: TOKENS.WHITE,
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDateHeading(group.date)}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      borderBottom: `1px solid ${TOKENS.BLACK}`,
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  {group.blocks.map((block) => (
                    <SourceCard
                      key={block.source}
                      block={block}
                      onPreview={handlePreview}
                      onBookmark={handleBookmark}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop filters (right sidebar, column) */}
          <div
            className="news-filters-desktop"
            style={{
              width: "110px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              position: "sticky",
              top: "1rem",
              alignSelf: "flex-start",
            }}
          >
            {rangeBadge}
            {rangeBadge && (
              <div
                style={{
                  width: "100%",
                  borderBottom: `1px solid ${TOKENS.BLACK}`,
                  marginBottom: "0.25rem",
                }}
              />
            )}
            {filterPanel}
          </div>
        </div>

        <style>{`
          @media (max-width: 600px) {
            .news-filters-mobile { display: flex !important; }
            .news-filters-desktop { display: none !important; }
            .news-source-card { width: 100% !important; }
            .news-date-heading { margin-top: 1.25rem !important; }
            .news-item-index { display: none !important; }
          }
          @media (min-width: 601px) {
            .news-filters-mobile { display: none !important; }
            .news-filters-desktop { display: flex !important; }
          }
        `}</style>
        {isMobile && <div style={{ height: "90px" }} />}
      </Container>

      {preview && (
        <PreviewModal
          item={preview.item}
          detail={previewDetail}
          source={preview.source}
          onClose={() => setPreview(null)}
          onBookmark={handleBookmark}
          onReact={handleReact}
          onDelete={handleDelete}
          onFeedback={handleFeedback}
          isMobile={isMobile}
        />
      )}
    </RequireAuth>
  );
}
