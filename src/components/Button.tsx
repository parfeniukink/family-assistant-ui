import React, { useState, useCallback, memo } from "react";
import { TOKENS } from "../styles/tokens";

type ButtonProps = {
  children: React.ReactNode;
  color?: string;
  hoverBackground?: string;
  onClickCallback: () => void;
  overrideStyles?: React.CSSProperties;
};

const DEFAULT_STYLES: React.CSSProperties = {
  fontFamily: "inherit",
  border: TOKENS.BORDER,
  borderRadius: TOKENS.RADIUS,
  color: TOKENS.WHITE,
  background: TOKENS.ACCENT,
  cursor: "pointer",
  height: "100%",
  width: "100%",
  transform: "translate(0, 0)",
  transition: "transform 0.02s ease, box-shadow 0.02s ease",
  boxSizing: "border-box",
  boxShadow: TOKENS.SHADOW,
};

export const Button = memo(function Button({
  children,
  color,
  hoverBackground,
  onClickCallback,
  overrideStyles: extraStyles,
}: ButtonProps) {
  const [isHovered, setHovered] = useState(false);
  const [isActive, setActive] = useState(false);

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setActive(false);
  }, []);
  const handleMouseDown = useCallback(() => setActive(true), []);
  const handleMouseUp = useCallback(() => setActive(false), []);

  let transform = "translate(0, 0)";

  if (isActive) {
    transform = "translate(2px, 2px)";
  } else if (isHovered) {
    transform = "translate(1px, 1px)";
  }

  // Set button background
  let buttonBg = color ?? TOKENS.ACCENT;
  if (color === "red") buttonBg = TOKENS.ACCENT_RED;
  if (color === "green") buttonBg = TOKENS.ACCENT_GREEN;
  if (color === "blue") buttonBg = TOKENS.ACCENT_BLUE;

  // Set `hover` background
  let hoverStyles: React.CSSProperties = {};
  if (isHovered) {
    if (hoverBackground) {
      hoverStyles.background = hoverBackground;
    }
  }

  const style: React.CSSProperties = {
    ...DEFAULT_STYLES,
    ...extraStyles,
    background: buttonBg,
    transform,
    ...hoverStyles,
  };

  return (
    <button
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseDown={handleMouseDown}
      onClick={onClickCallback}
      type="button"
    >
      {children}
    </button>
  );
});
