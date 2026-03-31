import React from "react";
import { TOKENS } from "src/styles/tokens";
import { SketchBorder } from "./SketchBorder";

type CardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export function Card({ children, style }: CardProps) {
  const hideBorder = style?.border === "none";

  const defaults: React.CSSProperties = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    boxShadow: TOKENS.SHADOW,
    borderRadius: TOKENS.RADIUS,
    padding: TOKENS.SPACE_4,
    background: TOKENS.BG_LIGHTER,
    gap: TOKENS.SPACE_2,
  };

  return (
    <div
      style={{
        overflow: "auto",
        ...defaults,
        ...style,
        border: "none",
      }}
    >
      {!hideBorder && <SketchBorder />}
      {children}
    </div>
  );
}
