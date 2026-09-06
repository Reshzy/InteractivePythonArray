/**
 * Animation / React coordination
 *
 * The Zustand store keeps `list` as the logical Python list (the engine's
 * after-state) so history, undo, and persistence stay correct.
 *
 * The visualizer renders a separate display list. On Run it starts as
 * `result.before`, then GSAP Flip / tweens move it to `result.after`.
 *
 * Flip pattern: `Flip.getState(cells)` → React commit of the next layout →
 * `Flip.from(state)` in `useLayoutEffect`. Cells use stable `data-flip-id`
 * (ListItem.id), never array index.
 *
 * Undo / redo / reset / preset use a short Flip/fade only. They do not replay
 * instructional scan or insert timelines.
 */

import type { MethodId, OperationResult, PlaygroundErrorType } from "@/lib/python/types";

export type PlaybackKind =
  | "idle"
  | "operation"
  | "undo"
  | "redo"
  | "reset"
  | "preset";

export type PlaybackRoute =
  | {
      type: "append";
      addedIndex: number;
    }
  | {
      type: "insert";
      insertedIndex: number;
      shiftedIndices: number[];
    }
  | {
      type: "remove";
      removedIndex: number;
      scannedIndices: number[];
    }
  | {
      type: "pop";
      removedIndex: number;
    }
  | {
      type: "clear";
      removedIndices: number[];
    }
  | {
      type: "scan";
      scannedIndices: number[];
      matchedIndices: number[];
      purpose: "len" | "count" | "index" | "remove" | "remove-miss";
    }
  | {
      type: "extend";
      addedIndices: number[];
    }
  | {
      type: "reverse";
    }
  | {
      type: "sort";
      previousOrder: string[];
      nextOrder: string[];
      secondary: boolean;
    }
  | {
      type: "copy";
    }
  | {
      type: "error";
      errorType: PlaygroundErrorType;
    }
  | {
      type: "structural";
    }
  | {
      type: "none";
    };

export type SecondaryLabels = {
  source: string;
  destination: string;
};

export const SORT_DISCLAIMER =
  "This animation shows the resulting order, not Python’s exact internal sorting algorithm.";

export function isRunLocked(state: {
  isAnimating: boolean;
  playbackKind: PlaybackKind;
  lastResult: OperationResult | null;
}): boolean {
  return (
    state.isAnimating &&
    state.playbackKind === "operation" &&
    state.lastResult?.mutates === true &&
    !state.lastResult.error
  );
}

export function routePlayback(input: {
  playbackKind: PlaybackKind;
  result: OperationResult | null;
  method: MethodId;
}): PlaybackRoute {
  if (
    input.playbackKind === "undo" ||
    input.playbackKind === "redo" ||
    input.playbackKind === "reset" ||
    input.playbackKind === "preset"
  ) {
    return { type: "structural" };
  }

  if (input.playbackKind !== "operation") {
    return { type: "none" };
  }

  const result = input.result;
  if (!result) {
    return { type: "none" };
  }

  if (result.error && result.animation.type === "none") {
    return {
      type: "error",
      errorType: result.error.type,
    };
  }

  if (result.error && result.animation.type === "scan") {
    return {
      type: "scan",
      scannedIndices: result.animation.scannedIndices,
      matchedIndices: result.animation.matchedIndices,
      purpose: input.method === "remove" ? "remove-miss" : "index",
    };
  }

  switch (result.animation.type) {
    case "append":
    case "insert":
    case "remove":
    case "pop":
    case "clear":
    case "extend":
    case "reverse":
    case "copy":
      return result.animation;
    case "sort":
      return {
        type: "sort",
        previousOrder: result.animation.previousOrder,
        nextOrder: result.animation.nextOrder,
        secondary: input.method === "sorted" || !result.mutates,
      };
    case "scan":
      return {
        type: "scan",
        scannedIndices: result.animation.scannedIndices,
        matchedIndices: result.animation.matchedIndices,
        purpose:
          input.method === "len"
            ? "len"
            : input.method === "count"
              ? "count"
              : "index",
      };
    case "none":
      return { type: "none" };
  }
}
