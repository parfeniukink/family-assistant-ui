export function makeNumber(input: string): number {
  const result = input
    .replace(" ", "")
    .replace(/[^0-9.,]+/g, "")
    .replace(",", ".");
  const cleaned = Number(result);
  if (!cleaned) return 0;
  return cleaned;
}
