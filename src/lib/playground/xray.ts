import { formatPythonValue } from "@/lib/python/format";
import type { ListItem } from "@/lib/python/types";

export type XRayCell = {
  index: number;
  formatted: string;
};

export type XRayView = {
  variableName: string;
  length: number;
  cells: XRayCell[];
  description: string;
};

export function buildXRayView(
  variableName: string,
  list: readonly ListItem[],
): XRayView {
  const cells = list.map((item, index) => ({
    index,
    formatted: formatPythonValue(item.value),
  }));
  const length = cells.length;
  const itemSummary =
    length === 0
      ? "The list is empty."
      : cells
          .map((cell) => `Index ${cell.index} is ${cell.formatted}.`)
          .join(" ");

  return {
    variableName,
    length,
    cells,
    description: `Variable ${variableName} refers to a list of length ${length}. ${itemSummary}`,
  };
}

export function buildXRayCopyDescription(
  source: string,
  destination: string,
): string {
  return `${source} refers to the original list. ${destination} refers to a new, separate list with the same items.`;
}

export function buildXRayAssignmentDescription(
  first: string,
  second: string,
): string {
  return `${first} and ${second} are two names for the same list.`;
}
