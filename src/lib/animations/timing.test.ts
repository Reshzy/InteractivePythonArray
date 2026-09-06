import { describe, expect, it } from "vitest";

import {
  BASE_DURATIONS,
  cappedStagger,
  LARGE_LIST_THRESHOLD,
  scaleDuration,
  scanStepDuration,
} from "./timing";

describe("scaleDuration", () => {
  it("divides the base duration by the playback speed", () => {
    expect(scaleDuration(0.5, 1)).toBe(0.5);
    expect(scaleDuration(0.5, 0.5)).toBe(1);
    expect(scaleDuration(0.5, 2)).toBe(0.25);
    expect(scaleDuration(BASE_DURATIONS.flip, 1.5)).toBeCloseTo(
      BASE_DURATIONS.flip / 1.5,
    );
  });
});

describe("cappedStagger", () => {
  it("returns 0 for a single item", () => {
    expect(cappedStagger({ each: 0.1, count: 1 })).toBe(0);
  });

  it("keeps the natural step when the total stays under the cap", () => {
    expect(cappedStagger({ each: 0.1, count: 4, maxTotal: 1 })).toBe(0.1);
  });

  it("shrinks the step so the whole stagger stays within maxTotal", () => {
    expect(cappedStagger({ each: 0.2, count: 11, maxTotal: 0.5 })).toBe(0.05);
  });
});

describe("scanStepDuration", () => {
  it("uses a compressed step for reduced motion and large lists", () => {
    expect(
      scanStepDuration({
        count: 3,
        speed: 1,
        reducedMotion: true,
        simplify: false,
      }),
    ).toBe(0.04);

    expect(
      scanStepDuration({
        count: LARGE_LIST_THRESHOLD,
        speed: 1,
        reducedMotion: false,
        simplify: false,
      }),
    ).toBe(0.05);
  });
});
