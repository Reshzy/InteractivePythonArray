import { describe, expect, it } from "vitest";

import { createPlaygroundError } from "./errors";
import {
  cloneList,
  createList,
  createListItem,
  executeOperation,
  listIds,
  pythonBoolean,
  pythonNone,
  pythonNumber,
  pythonString,
  pythonValueEquals,
} from "./index";
import type { ListItem, PythonValue } from "./types";

function snapshot(list: ListItem[]): ListItem[] {
  return cloneList(list);
}

function returnedList(value: PythonValue | ListItem[] | undefined): ListItem[] {
  if (!Array.isArray(value)) {
    throw new Error("Expected a copied list return value");
  }

  return value;
}

describe("len", () => {
  it("returns 0 for an empty list without mutating", () => {
    const list = createList([]);
    const before = snapshot(list);
    const result = executeOperation({ method: "len", list });

    expect(list).toEqual(before);
    expect(result.mutates).toBe(false);
    expect(result.returnValue).toEqual(pythonNumber(0));
    expect(result.after).toEqual([]);
    expect(result.code).toBe("len(items)");
    expect(result.animation).toEqual({
      type: "scan",
      scannedIndices: [],
      matchedIndices: [],
    });
  });

  it("returns the item count for a populated list", () => {
    const list = createList([
      pythonString("apple"),
      pythonString("banana"),
      pythonString("orange"),
    ]);
    const result = executeOperation({
      method: "len",
      list,
      variableName: "fruits",
    });

    expect(result.returnValue).toEqual(pythonNumber(3));
    expect(result.after.map((item) => item.id)).toEqual(listIds(list));
    expect(result.code).toBe("len(fruits)");
    expect(result.explanation).toBe("The list contains 3 items.");
    expect(result.animation).toEqual({
      type: "scan",
      scannedIndices: [0, 1, 2],
      matchedIndices: [0, 1, 2],
    });
  });
});

describe("append", () => {
  it("appends a string and preserves existing IDs", () => {
    const list = createList([pythonString("apple"), pythonString("banana")]);
    const originalIds = listIds(list);
    const before = snapshot(list);
    const result = executeOperation({
      method: "append",
      list,
      variableName: "fruits",
      args: { value: pythonString("mango") },
    });

    expect(list).toEqual(before);
    expect(result.mutates).toBe(true);
    expect(result.returnValue).toEqual(pythonNone());
    expect(result.after.map((item) => item.value)).toEqual([
      pythonString("apple"),
      pythonString("banana"),
      pythonString("mango"),
    ]);
    expect(listIds(result.after).slice(0, 2)).toEqual(originalIds);
    expect(result.after[2]?.id).toBeDefined();
    expect(originalIds).not.toContain(result.after[2]?.id);
    expect(result.code).toBe('fruits.append("mango")');
    expect(result.animation).toEqual({ type: "append", addedIndex: 2 });
  });

  it("appends a number", () => {
    const list = createList([pythonNumber(1)]);
    const result = executeOperation({
      method: "append",
      list,
      args: { value: pythonNumber(42) },
    });

    expect(result.after.map((item) => item.value)).toEqual([
      pythonNumber(1),
      pythonNumber(42),
    ]);
    expect(result.code).toBe("items.append(42)");
  });
});

describe("clear", () => {
  it("empties a populated list", () => {
    const list = createList([pythonString("apple"), pythonString("banana")]);
    const before = snapshot(list);
    const result = executeOperation({ method: "clear", list });

    expect(list).toEqual(before);
    expect(result.after).toEqual([]);
    expect(result.mutates).toBe(true);
    expect(result.returnValue).toEqual(pythonNone());
    expect(result.animation).toEqual({
      type: "clear",
      removedIndices: [0, 1],
    });
    expect(result.code).toBe("items.clear()");
  });

  it("succeeds on an already empty list", () => {
    const list = createList([]);
    const result = executeOperation({ method: "clear", list });

    expect(result.after).toEqual([]);
    expect(result.error).toBeUndefined();
    expect(result.animation).toEqual({
      type: "clear",
      removedIndices: [],
    });
  });
});

describe("copy", () => {
  it("returns a new list with equal values and distinct IDs", () => {
    const list = createList([pythonString("apple"), pythonNumber(42)]);
    const before = snapshot(list);
    const result = executeOperation({
      method: "copy",
      list,
      variableName: "fruits",
    });
    const copied = returnedList(result.returnValue);

    expect(list).toEqual(before);
    expect(result.mutates).toBe(false);
    expect(result.after.map((item) => item.id)).toEqual(listIds(list));
    expect(copied.map((item) => item.value)).toEqual(
      list.map((item) => item.value),
    );
    expect(listIds(copied)).not.toEqual(listIds(list));
    expect(copied[0]?.id).not.toBe(list[0]?.id);
    expect(result.code).toBe("copied = fruits.copy()");
    expect(result.animation).toEqual({ type: "copy" });
  });
});

describe("count", () => {
  it("counts duplicates", () => {
    const list = createList([
      pythonString("A"),
      pythonString("B"),
      pythonString("A"),
      pythonString("A"),
    ]);
    const result = executeOperation({
      method: "count",
      list,
      args: { value: pythonString("A") },
    });

    expect(result.returnValue).toEqual(pythonNumber(3));
    expect(result.mutates).toBe(false);
    expect(result.animation).toEqual({
      type: "scan",
      scannedIndices: [0, 1, 2, 3],
      matchedIndices: [0, 2, 3],
    });
    expect(result.explanation).toBe("Python found 3 matching items.");
  });

  it("returns 0 when there are no matches", () => {
    const list = createList([pythonNumber(1), pythonNumber(2)]);
    const result = executeOperation({
      method: "count",
      list,
      args: { value: pythonNumber(9) },
    });

    expect(result.returnValue).toEqual(pythonNumber(0));
    expect(result.animation).toMatchObject({ matchedIndices: [] });
  });

  it("uses type-aware matching", () => {
    const list = createList([pythonString("1"), pythonNumber(1)]);
    const result = executeOperation({
      method: "count",
      list,
      args: { value: pythonNumber(1) },
    });

    expect(result.returnValue).toEqual(pythonNumber(1));
    expect(result.animation).toMatchObject({ matchedIndices: [1] });
  });
});

describe("extend", () => {
  it("adds each value with a new ID and preserves existing IDs", () => {
    const list = createList([pythonString("apple")]);
    const originalIds = listIds(list);
    const before = snapshot(list);
    const result = executeOperation({
      method: "extend",
      list,
      args: { values: [pythonString("kiwi"), pythonNumber(2)] },
    });

    expect(list).toEqual(before);
    expect(result.after.map((item) => item.value)).toEqual([
      pythonString("apple"),
      pythonString("kiwi"),
      pythonNumber(2),
    ]);
    expect(listIds(result.after).slice(0, 1)).toEqual(originalIds);
    expect(result.after[1]?.id).not.toBe(result.after[2]?.id);
    expect(originalIds).not.toContain(result.after[1]?.id);
    expect(result.animation).toEqual({
      type: "extend",
      addedIndices: [1, 2],
    });
    expect(result.code).toBe('items.extend(["kiwi", 2])');
  });

  it("does nothing visible for an empty iterable", () => {
    const list = createList([pythonString("apple")]);
    const result = executeOperation({
      method: "extend",
      list,
      args: { values: [] },
    });

    expect(result.after.map((item) => item.value)).toEqual([
      pythonString("apple"),
    ]);
    expect(result.animation).toEqual({ type: "extend", addedIndices: [] });
  });
});

describe("index", () => {
  it("returns the first match and stops scanning", () => {
    const list = createList([
      pythonString("A"),
      pythonString("B"),
      pythonString("A"),
    ]);
    const result = executeOperation({
      method: "index",
      list,
      args: { value: pythonString("A") },
    });

    expect(result.returnValue).toEqual(pythonNumber(0));
    expect(result.mutates).toBe(false);
    expect(result.animation).toEqual({
      type: "scan",
      scannedIndices: [0],
      matchedIndices: [0],
    });
  });

  it("returns ValueError when the value is missing", () => {
    const list = createList([pythonString("apple")]);
    const result = executeOperation({
      method: "index",
      list,
      args: { value: pythonString("kiwi") },
    });

    expect(result.error?.type).toBe("ValueError");
    expect(result.error?.friendlyMessage).toMatch(/could not find/i);
    expect(result.mutates).toBe(false);
    expect(result.after.map((item) => item.value)).toEqual([
      pythonString("apple"),
    ]);
    expect(result.animation).toEqual({
      type: "scan",
      scannedIndices: [0],
      matchedIndices: [],
    });
  });
});

describe("insert", () => {
  it("inserts at the beginning, middle, and end", () => {
    const start = executeOperation({
      method: "insert",
      list: createList([pythonString("b"), pythonString("c")]),
      args: { index: 0, value: pythonString("a") },
    });
    expect(start.after.map((item) => item.value)).toEqual([
      pythonString("a"),
      pythonString("b"),
      pythonString("c"),
    ]);
    expect(start.animation).toEqual({
      type: "insert",
      insertedIndex: 0,
      shiftedIndices: [0, 1],
    });

    const middle = executeOperation({
      method: "insert",
      list: createList([pythonString("a"), pythonString("c")]),
      variableName: "fruits",
      args: { index: 1, value: pythonString("kiwi") },
    });
    expect(middle.after.map((item) => item.value)).toEqual([
      pythonString("a"),
      pythonString("kiwi"),
      pythonString("c"),
    ]);
    expect(middle.code).toBe('fruits.insert(1, "kiwi")');

    const end = executeOperation({
      method: "insert",
      list: createList([pythonString("a")]),
      args: { index: 1, value: pythonString("b") },
    });
    expect(end.after.map((item) => item.value)).toEqual([
      pythonString("a"),
      pythonString("b"),
    ]);
  });

  it("clamps an index larger than the list length", () => {
    const list = createList([pythonNumber(1), pythonNumber(2)]);
    const originalIds = listIds(list);
    const result = executeOperation({
      method: "insert",
      list,
      args: { index: 50, value: pythonNumber(3) },
    });

    expect(result.after.map((item) => item.value)).toEqual([
      pythonNumber(1),
      pythonNumber(2),
      pythonNumber(3),
    ]);
    expect(listIds(result.after).slice(0, 2)).toEqual(originalIds);
    expect(result.animation).toMatchObject({ insertedIndex: 2 });
  });

  it("handles negative and very negative indices", () => {
    const negative = executeOperation({
      method: "insert",
      list: createList([pythonNumber(1), pythonNumber(2), pythonNumber(3)]),
      args: { index: -1, value: pythonNumber(9) },
    });
    expect(negative.after.map((item) => item.value)).toEqual([
      pythonNumber(1),
      pythonNumber(2),
      pythonNumber(9),
      pythonNumber(3),
    ]);

    const veryNegative = executeOperation({
      method: "insert",
      list: createList([pythonNumber(1), pythonNumber(2)]),
      args: { index: -100, value: pythonNumber(0) },
    });
    expect(veryNegative.after.map((item) => item.value)).toEqual([
      pythonNumber(0),
      pythonNumber(1),
      pythonNumber(2),
    ]);
  });
});

describe("pop", () => {
  it("pops the last item by default", () => {
    const list = createList([
      pythonString("apple"),
      pythonString("banana"),
      pythonString("orange"),
    ]);
    const originalIds = listIds(list);
    const result = executeOperation({
      method: "pop",
      list,
      variableName: "fruits",
    });

    expect(result.returnValue).toEqual(pythonString("orange"));
    expect(result.after.map((item) => item.value)).toEqual([
      pythonString("apple"),
      pythonString("banana"),
    ]);
    expect(listIds(result.after)).toEqual(originalIds.slice(0, 2));
    expect(result.code).toBe("removed = fruits.pop()");
    expect(result.animation).toEqual({ type: "pop", removedIndex: 2 });
  });

  it("pops a positive or negative index", () => {
    const positive = executeOperation({
      method: "pop",
      list: createList([
        pythonString("apple"),
        pythonString("banana"),
        pythonString("orange"),
      ]),
      variableName: "fruits",
      args: { index: 1 },
    });
    expect(positive.returnValue).toEqual(pythonString("banana"));
    expect(positive.code).toBe("removed = fruits.pop(1)");
    expect(positive.explanation).toMatch(/index 1/);

    const negative = executeOperation({
      method: "pop",
      list: createList([pythonNumber(1), pythonNumber(2), pythonNumber(3)]),
      args: { index: -2 },
    });
    expect(negative.returnValue).toEqual(pythonNumber(2));
    expect(negative.after.map((item) => item.value)).toEqual([
      pythonNumber(1),
      pythonNumber(3),
    ]);
  });

  it("returns IndexError for an out-of-range index", () => {
    const result = executeOperation({
      method: "pop",
      list: createList([pythonNumber(1)]),
      args: { index: 5 },
    });

    expect(result.error?.type).toBe("IndexError");
    expect(result.error?.message).toBe("pop index out of range");
    expect(result.after.map((item) => item.value)).toEqual([pythonNumber(1)]);
  });

  it("returns IndexError for an empty list", () => {
    const result = executeOperation({
      method: "pop",
      list: createList([]),
    });

    expect(result.error?.type).toBe("IndexError");
    expect(result.error?.message).toBe("pop from empty list");
    expect(result.mutates).toBe(false);
  });
});

describe("remove", () => {
  it("removes only the first matching value", () => {
    const list = createList([
      pythonNumber(5),
      pythonNumber(2),
      pythonNumber(5),
    ]);
    const keptId = list[2]?.id;
    const result = executeOperation({
      method: "remove",
      list,
      args: { value: pythonNumber(5) },
    });

    expect(result.after.map((item) => item.value)).toEqual([
      pythonNumber(2),
      pythonNumber(5),
    ]);
    expect(result.after[1]?.id).toBe(keptId);
    expect(result.returnValue).toEqual(pythonNone());
    expect(result.animation).toEqual({
      type: "remove",
      removedIndex: 0,
      scannedIndices: [0],
    });
  });

  it("returns ValueError when the value is missing", () => {
    const result = executeOperation({
      method: "remove",
      list: createList([pythonString("apple")]),
      args: { value: pythonString("kiwi") },
    });

    expect(result.error?.type).toBe("ValueError");
    expect(result.error?.friendlyMessage).toMatch(/not in the list/);
    expect(result.mutates).toBe(false);
  });
});

describe("reverse", () => {
  it("reverses a populated list while preserving IDs", () => {
    const list = createList([
      pythonString("a"),
      pythonString("b"),
      pythonString("c"),
    ]);
    const originalIds = listIds(list);
    const result = executeOperation({ method: "reverse", list });

    expect(result.after.map((item) => item.value)).toEqual([
      pythonString("c"),
      pythonString("b"),
      pythonString("a"),
    ]);
    expect(listIds(result.after)).toEqual([...originalIds].reverse());
    expect(result.mutates).toBe(true);
    expect(result.returnValue).toEqual(pythonNone());
    expect(result.animation).toEqual({ type: "reverse" });
  });

  it("succeeds on an empty list", () => {
    const result = executeOperation({
      method: "reverse",
      list: createList([]),
    });

    expect(result.after).toEqual([]);
    expect(result.error).toBeUndefined();
  });
});

describe("sort", () => {
  it("sorts numbers ascending and descending", () => {
    const list = createList([
      pythonNumber(8),
      pythonNumber(3),
      pythonNumber(12),
      pythonNumber(1),
    ]);
    const ascending = executeOperation({ method: "sort", list });
    expect(ascending.after.map((item) => item.value)).toEqual([
      pythonNumber(1),
      pythonNumber(3),
      pythonNumber(8),
      pythonNumber(12),
    ]);
    expect(ascending.mutates).toBe(true);
    expect(ascending.returnValue).toEqual(pythonNone());
    expect(ascending.code).toBe("items.sort()");

    const descending = executeOperation({
      method: "sort",
      list,
      variableName: "numbers",
      args: { reverse: true },
    });
    expect(descending.after.map((item) => item.value)).toEqual([
      pythonNumber(12),
      pythonNumber(8),
      pythonNumber(3),
      pythonNumber(1),
    ]);
    expect(descending.code).toBe("numbers.sort(reverse=True)");
  });

  it("sorts strings and keeps duplicate IDs stable", () => {
    const first = createListItem(pythonString("b"));
    const second = createListItem(pythonString("a"));
    const duplicate = createListItem(pythonString("b"));
    const list = [first, second, duplicate];
    const result = executeOperation({ method: "sort", list });

    expect(result.after.map((item) => item.value)).toEqual([
      pythonString("a"),
      pythonString("b"),
      pythonString("b"),
    ]);
    expect(listIds(result.after)).toEqual([second.id, first.id, duplicate.id]);
    expect(result.animation).toMatchObject({
      type: "sort",
      previousOrder: [first.id, second.id, duplicate.id],
      nextOrder: [second.id, first.id, duplicate.id],
    });
  });

  it("returns TypeError for mixed values", () => {
    const list = createList([pythonNumber(1), pythonString("a")]);
    const before = snapshot(list);
    const result = executeOperation({ method: "sort", list });

    expect(list).toEqual(before);
    expect(result.error?.type).toBe("TypeError");
    expect(result.mutates).toBe(false);
    expect(result.after.map((item) => item.value)).toEqual([
      pythonNumber(1),
      pythonString("a"),
    ]);
  });
});

describe("sorted", () => {
  it("returns a new sorted list without mutating the original", () => {
    const list = createList([pythonNumber(3), pythonNumber(1)]);
    const originalIds = listIds(list);
    const before = snapshot(list);
    const result = executeOperation({
      method: "sorted",
      list,
      variableName: "numbers",
    });
    const ordered = returnedList(result.returnValue);

    expect(list).toEqual(before);
    expect(result.mutates).toBe(false);
    expect(listIds(result.after)).toEqual(originalIds);
    expect(ordered.map((item) => item.value)).toEqual([
      pythonNumber(1),
      pythonNumber(3),
    ]);
    expect(ordered[0]?.id).not.toBe(list[1]?.id);
    expect(result.code).toBe("sorted(numbers)");
  });
});

describe("generated code and errors", () => {
  it("falls back to items for an unsafe variable name", () => {
    const result = executeOperation({
      method: "append",
      list: createList([]),
      variableName: "123bad",
      args: { value: pythonBoolean(true) },
    });

    expect(result.code).toBe("items.append(True)");
  });

  it("builds structured educational errors", () => {
    const error = createPlaygroundError(
      "ValueError",
      "x is not in list",
      "Python could not find that value in the list.",
    );

    expect(error).toEqual({
      type: "ValueError",
      message: "x is not in list",
      friendlyMessage: "Python could not find that value in the list.",
    });
  });
});

describe("pythonValueEquals used by search operations", () => {
  it("does not treat True as 1 during remove", () => {
    const list = createList([pythonBoolean(true), pythonNumber(1)]);
    const result = executeOperation({
      method: "remove",
      list,
      args: { value: pythonNumber(1) },
    });

    expect(result.after.map((item) => item.value)).toEqual([
      pythonBoolean(true),
    ]);
    expect(
      pythonValueEquals(pythonBoolean(true), pythonNumber(1)),
    ).toBe(false);
  });
});
