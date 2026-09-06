import { describe, expect, it } from "vitest";

import { heldCellStatesFromResult } from "./held-states";
import type { OperationResult } from "@/lib/python/types";
import { pythonNone, pythonString } from "@/lib/python";

function result(
  animation: OperationResult["animation"],
  extras: Partial<OperationResult> = {},
): OperationResult {
  return {
    before: [],
    after: [],
    mutates: true,
    explanation: "ok",
    code: "fruits.append(\"mango\")",
    animation,
    returnValue: pythonNone(),
    ...extras,
  };
}

describe("heldCellStatesFromResult", () => {
  it("keeps the appended cell inserted after playback", () => {
    expect(
      heldCellStatesFromResult(result({ type: "append", addedIndex: 3 }), 4),
    ).toEqual(["idle", "idle", "idle", "inserted"]);
  });

  it("marks a miss as error on scanned cells", () => {
    expect(
      heldCellStatesFromResult(
        result(
          { type: "scan", scannedIndices: [0, 1, 2], matchedIndices: [] },
          {
            mutates: false,
            error: {
              type: "ValueError",
              message: "not in list",
              friendlyMessage: "kiwi is not in the list.",
            },
            returnValue: pythonString("kiwi"),
          },
        ),
        3,
      ),
    ).toEqual(["error", "error", "error"]);
  });

  it("returns undefined when nothing should stay highlighted", () => {
    expect(heldCellStatesFromResult(result({ type: "none" }), 3)).toBeUndefined();
  });
});
