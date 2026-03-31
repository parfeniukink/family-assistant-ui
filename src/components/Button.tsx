import React, { useState, useCallback, memo } from "react";
import { TOKENS } from "../styles/tokens";
import { SketchBorder } from "./SketchBorder";

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
  border: "none",
  borderRadius: TOKENS.RADIUS,
  color: TOKENS.INK_LIGHT,
  background: "transparent",
  cursor: "pointer",
  height: "100%",
  width: "100%",
  transform: "translate(0, 0)",
  transition: "all 0.12s ease",
  boxSizing: "border-box",
  boxShadow: "none",
  letterSpacing: "0.08em",
};

export const Button = memo(function Button({
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

  const transform = "translate(0, 0)";

  // Set button border + text color
  let borderColor = "rgba(26, 18, 10, 0.7)";
  let textColor = TOKENS.INK_LIGHT;
  if (color === "red") { borderColor = TOKENS.ACCENT_RED; textColor = TOKENS.ACCENT_RED; }
  if (color === "green") { borderColor = TOKENS.ACCENT_GREEN; textColor = TOKENS.ACCENT_GREEN; }
  if (color === "blue") { borderColor = TOKENS.ACCENT_BLUE; textColor = TOKENS.ACCENT_BLUE; }

  // Set `hover` background
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
    border: "none",
    color: textColor,
    transform,
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
      <SketchBorder stroke={borderColor} strokeWidth={3} />
      <span style={{ position: "relative" }}>{children}</span>
    </button>
  );
});
