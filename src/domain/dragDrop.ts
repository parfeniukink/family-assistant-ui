import type { CostShortcut } from "src/data/types";

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to) return list;
  const next = list.slice();
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
}

export function withReindexedPositions(list: CostShortcut[]): CostShortcut[] {
  return list.map((sc, i) => ({
    ...sc,
    ui: { ...(sc.ui ?? { positionIndex: i }), positionIndex: i },
  }));
}
