import { describe, expect, it } from "vitest";

import { createList, pythonString } from "@/lib/python/values";

import {
  buildXRayAssignmentDescription,
  buildXRayCopyDescription,
  buildXRayView,
} from "./xray";

describe("buildXRayView", () => {
  it("describes variable, indices, values, and length", () => {
    const view = buildXRayView(
      "fruits",
      createList([
        pythonString("apple"),
        pythonString("banana"),
        pythonString("orange"),
      ]),
    );

    expect(view.variableName).toBe("fruits");
    expect(view.length).toBe(3);
    expect(view.cells).toEqual([
      { index: 0, formatted: '"apple"' },
      { index: 1, formatted: '"banana"' },
      { index: 2, formatted: '"orange"' },
    ]);
    expect(view.description).toBe(
      'Variable fruits refers to a list of length 3. Index 0 is "apple". Index 1 is "banana". Index 2 is "orange".',
    );
  });

  it("describes an empty list", () => {
    const view = buildXRayView("items", []);

    expect(view.length).toBe(0);
    expect(view.cells).toEqual([]);
    expect(view.description).toBe(
      "Variable items refers to a list of length 0. The list is empty.",
    );
  });
});

describe("x-ray relationship copy", () => {
  it("explains copy as two lists and assignment as one list", () => {
    expect(buildXRayCopyDescription("a", "b")).toBe(
      "a refers to the original list. b refers to a new, separate list with the same items.",
    );
    expect(buildXRayAssignmentDescription("a", "b")).toBe(
      "a and b are two names for the same list.",
    );
  });
});
