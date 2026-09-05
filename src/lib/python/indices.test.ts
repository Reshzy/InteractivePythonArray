import { describe, expect, it } from "vitest";

import { normalizeAccessIndex, normalizeInsertIndex } from "./indices";

describe("normalizeAccessIndex", () => {
  it("resolves positive indices inside the list", () => {
    expect(normalizeAccessIndex(0, 3)).toEqual({ ok: true, index: 0 });
    expect(normalizeAccessIndex(2, 3)).toEqual({ ok: true, index: 2 });
  });

  it("resolves negative indices from the end", () => {
    expect(normalizeAccessIndex(-1, 3)).toEqual({ ok: true, index: 2 });
    expect(normalizeAccessIndex(-3, 3)).toEqual({ ok: true, index: 0 });
  });

  it("rejects out-of-range and non-integer indices", () => {
    expect(normalizeAccessIndex(3, 3)).toEqual({
      ok: false,
      reason: "out_of_range",
    });
    expect(normalizeAccessIndex(-4, 3)).toEqual({
      ok: false,
      reason: "out_of_range",
    });
    expect(normalizeAccessIndex(0, 0)).toEqual({
      ok: false,
      reason: "out_of_range",
    });
    expect(normalizeAccessIndex(1.5, 3)).toEqual({
      ok: false,
      reason: "not_integer",
    });
  });
});

describe("normalizeInsertIndex", () => {
  it("keeps in-range indices, including the append position", () => {
    expect(normalizeInsertIndex(0, 3)).toBe(0);
    expect(normalizeInsertIndex(1, 3)).toBe(1);
    expect(normalizeInsertIndex(3, 3)).toBe(3);
  });

  it("clamps indices larger than the list length", () => {
    expect(normalizeInsertIndex(100, 3)).toBe(3);
    expect(normalizeInsertIndex(5, 0)).toBe(0);
  });

  it("normalizes negative indices and clamps very negative values", () => {
    expect(normalizeInsertIndex(-1, 3)).toBe(2);
    expect(normalizeInsertIndex(-100, 3)).toBe(0);
  });

  it("throws for non-integer indices", () => {
    expect(() => normalizeInsertIndex(1.5, 3)).toThrow(
      /insert index must be an integer/,
    );
  });
});
