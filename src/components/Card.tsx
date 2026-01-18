import React from "react";
import { TOKENS } from "src/styles/tokens";

type CardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export function Card({ children, style }: CardProps) {
  const defaults: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    border: TOKENS.BORDER,
    boxShadow: TOKENS.SHADOW,
    borderRadius: TOKENS.RADIUS,
    padding: TOKENS.SPACE_2,
    background: TOKENS.BG,
    gap: TOKENS.SPACE_1,
  };

  return (
    <div
      style={{
        overflow: "auto",
        ...defaults,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
