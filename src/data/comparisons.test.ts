import { describe, expect, it } from "vitest";

import { COMPARISONS } from "@/data/comparisons";
import { createList, executeOperation } from "@/lib/python";
import { pythonNumber, pythonString } from "@/lib/python/values";

describe("comparison lessons", () => {
  it("documents five teaching pairings", () => {
    expect(COMPARISONS.map((comparison) => comparison.id)).toEqual([
      "append-extend",
      "remove-pop",
      "sort-sorted",
      "copy-assignment",
      "index-count",
    ]);
  });

  it("matches append vs extend playground try-it results", () => {
    const append = executeOperation({
      method: "append",
      list: createList([pythonNumber(1), pythonNumber(2)]),
      variableName: "a",
      args: { value: pythonNumber(3) },
    });
    expect(append.after.map((item) => item.value)).toEqual([
      pythonNumber(1),
      pythonNumber(2),
      pythonNumber(3),
    ]);
    expect(append.returnValue).toEqual({ type: "none", value: null });

    const extend = executeOperation({
      method: "extend",
      list: createList([pythonNumber(1), pythonNumber(2)]),
      variableName: "a",
      args: { values: [pythonNumber(3), pythonNumber(4)] },
    });
    expect(extend.after.map((item) => item.value)).toEqual([
      pythonNumber(1),
      pythonNumber(2),
      pythonNumber(3),
      pythonNumber(4),
    ]);
  });

  it("matches sort vs sorted playground try-it results", () => {
    const list = createList([
      pythonNumber(8),
      pythonNumber(3),
      pythonNumber(12),
      pythonNumber(1),
    ]);

    const sort = executeOperation({
      method: "sort",
      list,
      variableName: "numbers",
    });
    expect(sort.mutates).toBe(true);
    expect(sort.after.map((item) => item.value)).toEqual([
      pythonNumber(1),
      pythonNumber(3),
      pythonNumber(8),
      pythonNumber(12),
    ]);
    expect(sort.returnValue).toEqual({ type: "none", value: null });

    const sorted = executeOperation({
      method: "sorted",
      list,
      variableName: "numbers",
    });
    expect(sorted.mutates).toBe(false);
    expect(sorted.after.map((item) => item.value)).toEqual([
      pythonNumber(8),
      pythonNumber(3),
      pythonNumber(12),
      pythonNumber(1),
    ]);
    expect(
      Array.isArray(sorted.returnValue)
        ? sorted.returnValue.map((item) => item.value)
        : sorted.returnValue,
    ).toEqual([
      pythonNumber(1),
      pythonNumber(3),
      pythonNumber(8),
      pythonNumber(12),
    ]);
  });

  it("keeps index and count teaching examples accurate", () => {
    const list = createList([
      pythonString("A"),
      pythonString("B"),
      pythonString("A"),
    ]);

    const index = executeOperation({
      method: "index",
      list,
      args: { value: pythonString("A") },
    });
    expect(index.returnValue).toEqual(pythonNumber(0));

    const count = executeOperation({
      method: "count",
      list,
      args: { value: pythonString("A") },
    });
    expect(count.returnValue).toEqual(pythonNumber(2));
  });
});
