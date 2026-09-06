import { describe, expect, it } from "vitest";

import type { PlaygroundError } from "@/lib/python/types";

import {
  buildResultAnnouncement,
  shouldShowExactErrorMessage,
} from "./display";

const valueError = (
  overrides: Partial<PlaygroundError> = {},
): PlaygroundError => ({
  type: "ValueError",
  message: `"kiwi" is not in list`,
  friendlyMessage: `"kiwi" is not in the list.`,
  guidance: `Try adding "kiwi" first or choose a value already present.`,
  ...overrides,
});

describe("shouldShowExactErrorMessage", () => {
  it("hides the exact line when it matches the friendly message", () => {
    expect(
      shouldShowExactErrorMessage(
        valueError({
          message: "Python could not find that value in the list.",
          friendlyMessage: "Python could not find that value in the list.",
        }),
      ),
    ).toBe(false);
  });

  it("shows a short distinct Python error string", () => {
    expect(shouldShowExactErrorMessage(valueError())).toBe(true);
  });

  it("hides long raw messages", () => {
    expect(
      shouldShowExactErrorMessage(
        valueError({
          message: "x".repeat(121),
        }),
      ),
    ).toBe(false);
  });
});

describe("buildResultAnnouncement", () => {
  it("announces errors from the educational copy without requiring a raw extra line", () => {
    expect(
      buildResultAnnouncement(
        {
          before: [],
          after: [],
          mutates: false,
          explanation: `"kiwi" is not in the list.`,
          code: `fruits.remove("kiwi")`,
          error: valueError(),
          animation: { type: "none" },
        },
        3,
      ),
    ).toBe(
      `ValueError. "kiwi" is not in the list. Try adding "kiwi" first or choose a value already present.`,
    );
  });
});
