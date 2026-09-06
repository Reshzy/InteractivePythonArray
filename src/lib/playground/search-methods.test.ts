import { describe, expect, it } from "vitest";

import { searchLearningContent } from "@/lib/playground/search-methods";

describe("searchLearningContent", () => {
  it("returns every method and comparison for an empty query", () => {
    const result = searchLearningContent("  ");
    expect(result.methods.map((method) => method.id)).toContain("append");
    expect(result.comparisons.map((comparison) => comparison.id)).toContain(
      "append-extend",
    );
  });

  it("surfaces remove(), pop(), and the remove vs pop comparison", () => {
    const result = searchLearningContent("remove");
    const methodIds = result.methods.map((method) => method.id);
    const comparisonIds = result.comparisons.map((comparison) => comparison.id);

    expect(methodIds).toContain("remove");
    expect(methodIds).toContain("pop");
    expect(comparisonIds).toContain("remove-pop");
  });
});
