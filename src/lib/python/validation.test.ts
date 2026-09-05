import { describe, expect, it } from "vitest";

import { createList, pythonNumber, pythonString } from "./values";
import {
  DEFAULT_VARIABLE_NAME,
  getSortKind,
  resolveVariableName,
} from "./validation";

describe("resolveVariableName", () => {
  it("keeps simple identifiers", () => {
    expect(resolveVariableName("fruits")).toBe("fruits");
    expect(resolveVariableName("numbers")).toBe("numbers");
    expect(resolveVariableName("values")).toBe("values");
  });

  it("falls back to items for missing or unsafe names", () => {
    expect(resolveVariableName()).toBe(DEFAULT_VARIABLE_NAME);
    expect(resolveVariableName("")).toBe(DEFAULT_VARIABLE_NAME);
    expect(resolveVariableName("123bad")).toBe(DEFAULT_VARIABLE_NAME);
    expect(resolveVariableName("fruits-list")).toBe(DEFAULT_VARIABLE_NAME);
  });
});

describe("getSortKind", () => {
  it("returns the shared type for homogeneous lists", () => {
    expect(getSortKind(createList([pythonNumber(1), pythonNumber(2)]))).toBe(
      "number",
    );
    expect(getSortKind(createList([pythonString("a"), pythonString("b")]))).toBe(
      "string",
    );
  });

  it("returns null for mixed types", () => {
    expect(
      getSortKind(createList([pythonNumber(1), pythonString("a")])),
    ).toBeNull();
  });
});
