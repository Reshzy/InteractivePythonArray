export type AccessIndexResult =
  | {
      ok: true;
      index: number;
    }
  | {
      ok: false;
      reason: "out_of_range" | "not_integer";
    };

/**
 * Normalize a Python list access index (`pop`, subscription).
 * Negative indices count from the end. Out-of-range values fail.
 */
export function normalizeAccessIndex(
  index: number,
  length: number,
): AccessIndexResult {
  if (!Number.isInteger(index)) {
    return { ok: false, reason: "not_integer" };
  }

  let resolved = index;
  if (resolved < 0) {
    resolved += length;
  }

  if (resolved < 0 || resolved >= length) {
    return { ok: false, reason: "out_of_range" };
  }

  return { ok: true, index: resolved };
}

/**
 * Normalize a Python `list.insert` index.
 * Out-of-range values are clamped instead of throwing.
 */
export function normalizeInsertIndex(index: number, length: number): number {
  if (!Number.isInteger(index)) {
    throw new TypeError("insert index must be an integer");
  }

  let resolved = index;

  if (resolved < 0) {
    resolved += length;
    if (resolved < 0) {
      resolved = 0;
    }
  } else if (resolved > length) {
    resolved = length;
  }

  return resolved;
}

export function rangeIndices(length: number): number[] {
  return Array.from({ length }, (_, index) => index);
}
