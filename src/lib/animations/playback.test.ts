import { describe, expect, it } from "vitest";

import { pythonString } from "@/lib/python/values";
import type { OperationResult } from "@/lib/python/types";

import { isRunLocked, routePlayback, SORT_DISCLAIMER } from "./playback";

function result(
  animation: OperationResult["animation"],
  extras: Partial<OperationResult> = {},
): OperationResult {
  const before = [
    { id: "a", value: pythonString("apple") },
    { id: "b", value: pythonString("banana") },
  ];

  return {
    before,
    after: before,
    mutates: false,
    code: "items",
    explanation: "ok",
    animation,
    ...extras,
  };
}

describe("routePlayback", () => {
  it("uses structural playback for undo, redo, reset, and presets", () => {
    expect(
      routePlayback({
        playbackKind: "undo",
        result: null,
        method: "append",
      }),
    ).toEqual({ type: "structural" });
    expect(
      routePlayback({
        playbackKind: "reset",
        result: null,
        method: "append",
      }),
    ).toEqual({ type: "structural" });
  });

  it("routes engine animation metadata for operations", () => {
    expect(
      routePlayback({
        playbackKind: "operation",
        method: "append",
        result: result({ type: "append", addedIndex: 2 }, { mutates: true }),
      }),
    ).toEqual({ type: "append", addedIndex: 2 });

    expect(
      routePlayback({
        playbackKind: "operation",
        method: "len",
        result: result({
          type: "scan",
          scannedIndices: [0, 1],
          matchedIndices: [0, 1],
        }),
      }),
    ).toEqual({
      type: "scan",
      scannedIndices: [0, 1],
      matchedIndices: [0, 1],
      purpose: "len",
    });

    expect(
      routePlayback({
        playbackKind: "operation",
        method: "sorted",
        result: result({
          type: "sort",
          previousOrder: ["a", "b"],
          nextOrder: ["b", "a"],
        }),
      }),
    ).toMatchObject({ type: "sort", secondary: true });
  });

  it("turns failed scans and typed errors into educational routes", () => {
    expect(
      routePlayback({
        playbackKind: "operation",
        method: "remove",
        result: result(
          { type: "scan", scannedIndices: [0, 1], matchedIndices: [] },
          {
            error: {
              type: "ValueError",
              message: "x not in list",
              friendlyMessage: "Not found",
            },
          },
        ),
      }),
    ).toMatchObject({ type: "scan", purpose: "remove-miss" });

    expect(
      routePlayback({
        playbackKind: "operation",
        method: "pop",
        result: result(
          { type: "none" },
          {
            error: {
              type: "IndexError",
              message: "pop index out of range",
              friendlyMessage: "Out of range",
            },
          },
        ),
      }),
    ).toEqual({ type: "error", errorType: "IndexError" });
  });

  it("exposes a sort disclaimer that does not claim Timsort", () => {
    expect(SORT_DISCLAIMER.toLowerCase()).toContain("not python");
    expect(SORT_DISCLAIMER.toLowerCase()).not.toContain("timsort");
  });
});

describe("isRunLocked", () => {
  it("locks Run only during a successful mutating operation animation", () => {
    expect(
      isRunLocked({
        isAnimating: true,
        playbackKind: "operation",
        lastResult: result({ type: "append", addedIndex: 1 }, { mutates: true }),
      }),
    ).toBe(true);

    expect(
      isRunLocked({
        isAnimating: true,
        playbackKind: "operation",
        lastResult: result({
          type: "scan",
          scannedIndices: [0],
          matchedIndices: [0],
        }),
      }),
    ).toBe(false);

    expect(
      isRunLocked({
        isAnimating: true,
        playbackKind: "undo",
        lastResult: result({ type: "append", addedIndex: 1 }, { mutates: true }),
      }),
    ).toBe(false);

    expect(
      isRunLocked({
        isAnimating: true,
        playbackKind: "step",
        lastResult: result({ type: "insert", insertedIndex: 1, shiftedIndices: [1] }, { mutates: true }),
      }),
    ).toBe(true);
  });
});
