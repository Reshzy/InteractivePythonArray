import { describe, expect, it } from "vitest";

import {
  createList,
  createListItem,
  pythonBoolean,
  pythonNone,
  pythonNumber,
  pythonString,
  pythonValueEquals,
} from "./index";

describe("pythonValueEquals", () => {
  it("matches values of the same type and payload", () => {
    expect(pythonValueEquals(pythonString("apple"), pythonString("apple"))).toBe(
      true,
    );
    expect(pythonValueEquals(pythonNumber(42), pythonNumber(42))).toBe(true);
    expect(pythonValueEquals(pythonBoolean(true), pythonBoolean(true))).toBe(
      true,
    );
    expect(pythonValueEquals(pythonNone(), pythonNone())).toBe(true);
  });

  it("does not match across types", () => {
    expect(pythonValueEquals(pythonString("1"), pythonNumber(1))).toBe(false);
    expect(pythonValueEquals(pythonBoolean(true), pythonNumber(1))).toBe(false);
    expect(pythonValueEquals(pythonBoolean(false), pythonNumber(0))).toBe(false);
    expect(pythonValueEquals(pythonNone(), pythonString("None"))).toBe(false);
  });
});

describe("createListItem", () => {
  it("assigns a unique id that is not derived from an index", () => {
    const first = createListItem(pythonString("apple"));
    const second = createListItem(pythonString("apple"));

    expect(first.id).not.toBe(second.id);
    expect(first.id).not.toBe("0");
    expect(pythonValueEquals(first.value, pythonString("apple"))).toBe(true);
  });
});

describe("createList", () => {
  it("creates independent items for each value", () => {
    const list = createList([pythonString("a"), pythonNumber(1)]);

    expect(list).toHaveLength(2);
    expect(list[0]?.id).not.toBe(list[1]?.id);
    expect(list[0]?.value).toEqual(pythonString("a"));
  });
});
