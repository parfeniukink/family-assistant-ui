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
    <svg preserveAspectRatio="none">
      <rect stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
  );
}
