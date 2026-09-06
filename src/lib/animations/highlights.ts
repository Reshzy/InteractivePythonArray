export const CELL_VISUAL_STATES = [
  "idle",
  "scanned",
  "matched",
  "inserted",
  "removed",
  "moved",
  "returned",
  "error",
  "active-index",
] as const;

export type CellVisualState = (typeof CELL_VISUAL_STATES)[number];

export function isCellVisualState(value: string): value is CellVisualState {
  return CELL_VISUAL_STATES.some((state) => state === value);
}

export const CELL_STATE_ATTRIBUTE = "data-cell-state";
export const FLIP_ID_ATTRIBUTE = "data-flip-id";
