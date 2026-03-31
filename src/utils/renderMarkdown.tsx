import { type ReactNode } from "react";

import { TOKENS } from "src/styles/tokens";

/**
 * Parse **bold**, *italic*, and ***bold-italic*** markers
 * into styled <span> elements. Returns an array of
 * ReactNode fragments safe for inline rendering.
 *
 * Uses color contrast (WHITE vs GRAY) for emphasis since
 * the app font lacks distinct bold/italic variants.
 */
export function renderMarkdown(text: string): ReactNode[] {
  const pattern = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*)/g;
  const result: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // ***bold italic***
      result.push(
        <span
          key={key++}
          style={{
            color: TOKENS.INK,
            fontWeight: 700,
            fontStyle: "italic",
          }}
        >
          {match[2]}
        </span>
      );
    } else if (match[3]) {
      // **bold**
      result.push(
        <span key={key++} style={{ color: TOKENS.INK, fontWeight: 700 }}>
          {match[3]}
        </span>
      );
    } else if (match[4]) {
      // *italic*
      result.push(
        <span key={key++} style={{ fontStyle: "italic" }}>
          {match[4]}
        </span>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result.length > 0 ? result : [text];
}
