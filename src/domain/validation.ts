export function makeNumber(input: string): number {
  const result = input
    .replace(" ", "")
    .replace(/[^0-9.,]+/g, "")
    .replace(",", ".");
  const cleaned = Number(result);
  if (!cleaned) throw new Error("Invalid value");
  return cleaned;
}
