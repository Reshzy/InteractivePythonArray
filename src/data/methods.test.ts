import { describe, expect, it } from "vitest";

import { METHOD_CATEGORIES, METHODS } from "@/data/methods";

describe("method teaching metadata", () => {
  it("covers every method with example, complexity, advanced notes, and tryIt", () => {
    expect(METHODS.length).toBeGreaterThan(0);

    for (const method of METHODS) {
      expect(method.example.setup.length).toBeGreaterThan(0);
      expect(method.example.call.length).toBeGreaterThan(0);
      expect(method.example.result.length).toBeGreaterThan(0);
      expect(method.complexity.length).toBeGreaterThan(0);
      expect(method.advanced.length).toBeGreaterThan(0);
      expect(method.tryIt.variableName.length).toBeGreaterThan(0);
      expect(Array.isArray(method.tryIt.list)).toBe(true);
    }
  });

  it("keeps categories aligned with the explorer groups", () => {
    const categoryIds = new Set(METHOD_CATEGORIES.map((category) => category.id));

    for (const method of METHODS) {
      expect(categoryIds.has(method.category)).toBe(true);
    }
  });
});
