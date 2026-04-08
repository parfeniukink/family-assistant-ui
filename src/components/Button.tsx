import React, { useState, useCallback } from "react";
import { TOKENS } from "../styles/tokens";

type ButtonProps = {
  children: React.ReactNode;
  color?: string;
  hidden?: boolean;
  hoverBackground?: string;
  onClickCallback: () => void;
  overrideStyles?: React.CSSProperties;
};

const DEFAULT_STYLES: React.CSSProperties = {
  position: "relative",
  fontFamily: "inherit",
  borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
  color: TOKENS.INK,
  background: "transparent",
  cursor: "pointer",
  height: "100%",
  width: "100%",
  transition: "all 0.12s ease",
  boxSizing: "border-box",
  boxShadow: "3px 3px 6px rgba(26, 18, 10, 0.25), inset 0 0 20px rgba(26, 18, 10, 0.06)",
  letterSpacing: "0.08em",
};

export function Button({
  children,
  color,
  hidden,
  hoverBackground,
  onClickCallback,
  overrideStyles: extraStyles,
}: ButtonProps) {
  const [isHovered, setHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  let borderColor = "rgba(26, 18, 10, 0.8)";
  let textColor = TOKENS.INK;
  if (color === "red") { borderColor = TOKENS.ACCENT_RED; textColor = TOKENS.ACCENT_RED; }
  if (color === "green") { borderColor = TOKENS.ACCENT_GREEN; textColor = TOKENS.ACCENT_GREEN; }
  if (color === "blue") { borderColor = TOKENS.ACCENT_BLUE; textColor = TOKENS.ACCENT_BLUE; }

  let hoverStyles: React.CSSProperties = {};
  if (isHovered) {
    if (hoverBackground) {
      hoverStyles.background = hoverBackground;
    } else if (color === "red") {
      hoverStyles.background = TOKENS.BG_RED;
    } else if (color === "green") {
      hoverStyles.background = TOKENS.BG_GREEN;
    } else if (color === "blue") {
      hoverStyles.background = TOKENS.BG_BLUE;
    } else {
      hoverStyles.background = "rgba(26, 18, 10, 0.1)";
    }
  }

  const style: React.CSSProperties = {
    ...DEFAULT_STYLES,
    ...extraStyles,
    border: `4px solid ${borderColor}`,
    color: textColor,
    ...hoverStyles,
  };

  return (
    <button
      hidden={hidden}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClickCallback}
      type="button"
    >
      {children}
    </button>
  );
}
