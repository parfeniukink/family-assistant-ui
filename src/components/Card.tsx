import React from "react";

type CardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export function Card({ children, style }: CardProps) {
  const borderless = style?.border === "none";
  const className = borderless ? "card card--borderless" : "card";

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
