import { describe, expect, it } from "vitest";

import { LARGE_LIST_THRESHOLD } from "./timing";
import { resolveAnimationMode } from "./reduced-motion";
import { isReduced, shouldFlipLayout } from "./runtime";

describe("resolveAnimationMode", () => {
  it("prefers reduced motion over list-size simplification", () => {
    expect(
      resolveAnimationMode({
        prefersReducedMotion: true,
        listLength: LARGE_LIST_THRESHOLD + 5,
      }),
    ).toBe("reduced");
  });

  it("simplifies large lists and uses the full path otherwise", () => {
    expect(
      resolveAnimationMode({
        prefersReducedMotion: false,
        listLength: LARGE_LIST_THRESHOLD,
      }),
    ).toBe("simplified");

    expect(
      resolveAnimationMode({
        prefersReducedMotion: false,
        listLength: 3,
      }),
    ).toBe("full");
  });
});

describe("reduced-motion layout grammar", () => {
  it("keeps Flip travel off in reduced mode and on otherwise", () => {
    expect(shouldFlipLayout("reduced")).toBe(false);
    expect(shouldFlipLayout("simplified")).toBe(true);
    expect(shouldFlipLayout("full")).toBe(true);
    expect(isReduced("reduced")).toBe(true);
  });
});
