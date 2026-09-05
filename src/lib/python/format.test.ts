import { describe, expect, it } from "vitest";

import { formatPythonList, formatPythonValue } from "./format";
import {
  createList,
  pythonBoolean,
  pythonNone,
  pythonNumber,
  pythonString,
} from "./index";

describe("formatPythonValue", () => {
  it("renders strings with double quotes", () => {
    expect(formatPythonValue(pythonString("apple"))).toBe('"apple"');
  });

  it("escapes quotes, backslashes, and newlines", () => {
    expect(formatPythonValue(pythonString('say "hi"'))).toBe('"say \\"hi\\""');
    expect(formatPythonValue(pythonString("a\\b"))).toBe('"a\\\\b"');
    expect(formatPythonValue(pythonString("a\nb"))).toBe('"a\\nb"');
    expect(formatPythonValue(pythonString("a\r\tb"))).toBe('"a\\r\\tb"');
  });

  it("renders numbers, booleans, and None as Python literals", () => {
    expect(formatPythonValue(pythonNumber(42))).toBe("42");
    expect(formatPythonValue(pythonNumber(1.5))).toBe("1.5");
    expect(formatPythonValue(pythonBoolean(true))).toBe("True");
    expect(formatPythonValue(pythonBoolean(false))).toBe("False");
    expect(formatPythonValue(pythonNone())).toBe("None");
  });
});

describe("formatPythonList", () => {
  it("formats mixed supported values as Python source", () => {
    expect(
      formatPythonList([
        pythonString("apple"),
        pythonString("banana"),
        pythonNumber(42),
        pythonBoolean(true),
        pythonNone(),
      ]),
    ).toBe('["apple", "banana", 42, True, None]');
  });

  it("formats list items using their values", () => {
    const list = createList([pythonString("apple"), pythonNumber(2)]);
    expect(formatPythonList(list)).toBe('["apple", 2]');
  });
});
