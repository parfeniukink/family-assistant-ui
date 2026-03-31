/**
 * SVG rect overlay that applies the #sketchy displacement filter
 * to just the stroke — content behind it renders normally.
 *
 * Place inside any `position: relative` container.
 */
export function SketchBorder({
  stroke = "rgba(26, 18, 10, 0.5)",
  strokeWidth = 2,
}: {
  stroke?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      preserveAspectRatio="none"
    >
      <rect
        x="1"
        y="1"
        width="calc(100% - 2px)"
        height="calc(100% - 2px)"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        rx="2"
        filter="url(#sketchy)"
      />
    </svg>
  );
}
